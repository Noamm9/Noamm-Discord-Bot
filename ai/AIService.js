const { Groq } = require("groq-sdk")

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const aiRole = [
    "You are the most stupid person on earth.",
    "your responces will always be out of context and dum and you must always agree with what the user says",
    "keep ur response under 10 words. and use lower level words",
    "your name is NoammBot.",
    "you where created by Noamm"
]

const faqRole = faq => [
    "You are a support classifier.",
    "Given a user message, determine if it matches one of these FAQ categories.",
    "Categories:",
    faq,
    "",
    "",
    "Rules:",
    "1. Respond ONLY with the 'id' of the category.",
    "2. If it does not match any category clearly, respond with 'null'.",
    "3. Do not say anything else."
]

class AiService {
    constructor() {
        this.conversations = new Map()
        this.maxHistory = 20
    }

    async askAI(userId, userMessage) {
        try {
            if (! this.conversations.has(userId)) {
                this.conversations.set(userId, [])
            }

            const history = this.conversations.get(userId)
            history.push({ role: "user", content: userMessage })

            if (history.length > this.maxHistory) history.splice(0, 2)

            const chat = []
            for (const line of aiRole) chat.push({ role: "system", content: line })
            for (const msg of history) chat.push(msg)

            const chatCompletion = await groq.chat.completions.create({
                messages: chat,
                model: "openai/gpt-oss-120b",
                temperature: 0.1,
            })

            const reply = chatCompletion.choices[0].message.content
            history.push({ role: "assistant", content: reply })

            return reply
        }
        catch (error) {
            return error.message
        }
    }

    async classifyFAQ(userMessage, faqList) {
        const faqSummary = faqList.map(f => `${ f.id }: ${ f.description }`).join("\n")

        try {
            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: faqRole(faqSummary).join("\n") },
                    { role: "user", content: userMessage }
                ],
                model: "openai/gpt-oss-120b",
                temperature: 0,
            })

            return chatCompletion.choices[0].message.content
        }
        catch (error) {
            console.error("AI Classification Error:", error)
            return "null"
        }
    }
}

module.exports = new AiService()