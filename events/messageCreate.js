const { Events } = require('discord.js')
const path = require('node:path')
const fs = require('node:fs')

const faqsPath = path.join(__dirname, '..', 'faqs.json')
let faqs = []
try {
    faqs = JSON.parse(fs.readFileSync(faqsPath, 'utf8'))
}
catch (err) {
    console.error("Failed to load faqs.json:", err)
    process.exit()
}

const cooldown = 3_000
const lastSent = new Map()

const matchFaq = content => {
    for (const faq of faqs) for (const group of faq.keywords) {
        if (group.every(keyword => content.includes(keyword))) {
            return faq
        }
    }

    return null
}

let lastApiStatus = true
const apiDelay = 300_000 // 5 min

const apiUrl = "http://localhost:3000/health"
const getApiStatus = async () => await fetch(apiUrl).then((response) => response.ok).catch(() => false)
let lastApiCheck = Date.now()

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (message.author.bot) return
        if (! message.channel) return

        const content = message.content.toLowerCase()
        const faq = matchFaq(content)

        if (! faq) return

        const now = Date.now()
        const last = lastSent.get(faq.id) || 0

        if (now - last < cooldown) return
        lastSent.set(faq.id, now)

        try {
            if (faq.id !== "api_down") await message.reply(faq.answer)
            else {
                if (now - lastApiCheck < apiDelay) {
                    let time = Math.floor((now - lastApiCheck) / 1000)

                    if (! lastApiStatus) await message.reply(`Api is currently down, last checked: ${time} seconds ago`)
                    else await message.reply(`Api is currently up, last checked: ${time} seconds ago`)

                    return
                }

                lastApiCheck = now
                lastApiStatus = getApiStatus()
                if (! lastApiStatus) await message.reply(`Api is currently down`)
                else await message.reply(`Api is currently up`)
            }
        }
        catch (err) {
            console.error("Failed to send message:", err)
        }
    }
}