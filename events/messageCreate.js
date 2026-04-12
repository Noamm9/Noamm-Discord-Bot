const { Events } = require('discord.js')
const path = require('node:path')
const fs = require('node:fs')

const faqsPath = path.join(__dirname, '..', 'faqs.json')
let faqs = []
try {
    faqs = JSON.parse(fs.readFileSync(faqsPath, 'utf8'))
} catch (err) {
    console.error("Failed to load faqs.json:", err)
}

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

//TODO: noam change this to localhost:3000/health
let lastApiStatus = true
const apiDelay = 300000
const apiUrl = "https://api.noamm.org/health"
async function getApiStatus() {
    return await fetch(apiUrl)
        .then((response) => response.ok)
        .catch(() => false)
}

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (message.author.bot) return
        if (!message.channel) return

        const content = message.content.toLowerCase()


        const faq = matchFaq(content)

        const now = Date.now()
        const last = lastSent.get(faq.id) || 0
        
        if (!faq) return
        
        if (now - last < cooldown) return
        lastSent.set(faq.id, now)

        try {
            if (faq.id = "api_down") {
                if (now - last < apiDelay) {
                    let time = Math.floor((now - last) / 1000)
                    
                    if (lastApiStatus == false) {
                        await message.reply(`Api is currently down, last checked: ${time} seconds ago`)
                    }
                    else {
                        await message.reply(`Api is currently up, last checked: ${time} seconds ago`)
                    }
                    return
                }
                lastApiStatus = getApiStatus()
                if (lastApiStatus == false) {
                    await message.reply(`Api is currently down`)
                }
                else {
                    await message.reply(`Api is currently up`)
                }
                return
            }
            await message.reply(faq.answer)
        } catch (err) {
            console.error("Failed to send message:", err)
        }
    }
}