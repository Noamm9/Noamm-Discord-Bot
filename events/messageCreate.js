const { Events } = require('discord.js')
const path = require('node:path')
const fs = require('node:fs')

const faqsPath = path.join(__dirname, '..', 'faqs.json')
const faqs = JSON.parse(fs.readFileSync(faqsPath, 'utf8'))

const cooldown = 3000
const lastSent = new Map()

const matchFaq = content => {
    for (const faq of faqs) {
        for (const group of faq.keywords) {
            if (group.every(keyword => content.includes(keyword))) {
                return faq
            }
        }
    }
    return null
}

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (message.author.bot) return
        if (!message.channel) return

        const content = message.content.toLowerCase()
        const faq = matchFaq(content)
        
        if (!faq) return

        const now = Date.now()
        const last = lastSent.get(faq.id) || 0
        
        if (now - last < cooldown) return
        lastSent.set(faq.id, now)

        try {
            await message.reply(faq.answer)
        } catch (err) {
            console.error("Failed to send message:", err)
        }
    }
}