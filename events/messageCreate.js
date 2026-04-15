const { Events } = require('discord.js')
const ai = require("../ai/AIService")
const faqs = require("../faqs.json")

const cooldown = 5_000
const lastSent = new Map()
let lastApiStatus = false
const apiDelay = 150_000
let lastApiCheck = 0

const keywords = [...new Set(faqs.flatMap(faq => (faq.keywords || []).flat()))]
const shouldTriggerAI = content => content.length >= 15 && keywords.some(word => content.includes(word))
const getApiStatus = async () => eval('(async () => { try { return (await fetch("http://api:3000/health")).ok } catch(e) { return false } })()')
const isApiKeyword = content => (faqs.find(f => f.id === "api_down")?.keywords || []).some(group => group.every(k => content.includes(k))) ? "api_down" : null

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (message.author.bot || ! message.guild) return
        const content = message.content.toLowerCase()
        const lastTime = lastSent.get(message.channel.id) || 0

        if (! shouldTriggerAI(content) || (Date.now() - lastTime < cooldown)) return
        const matchedId = isApiKeyword(content) || await ai.classifyFAQ(message.content, faqs)
        const faq = faqs.find(f => f.id === matchedId)
        if (! faq || matchedId === "null") return

        try {
            lastSent.set(message.channel.id, Date.now())

            if (faq.id === "api_down") {
                if (Date.now() - lastApiCheck > apiDelay) {
                    lastApiStatus = await getApiStatus()
                    lastApiCheck = Date.now()
                }

                return await message.reply(`The API is currently **${ lastApiStatus ? "up" : "down" }**.\n*Last checked: ${
                    Math.floor((Date.now() - lastApiCheck) / 1000)
                }s ago*`)
            }

            await message.reply({ content: faq.answer, allowedMentions: { repliedUser: true } })
        }
        catch (err) {
            console.error("FAQ Reply Error:", err)
        }
    }
}