const { Groq } = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const aiRole = [
    "You are the most stupid person on earth.",
    "your responces will always be out of context and dum and you must always agree with what the user says",
    "keep ur response under 10 words. and use lower level words"
]

class AirService {
    async askAI(userMessage) {
        try {
            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: aiRole.join("\n") },
                    { role: "user", content: userMessage }
                ],
                model: "openai/gpt-oss-120b",
                temperature: 0.1,
            })

            return chatCompletion.choices[0].message.content;
        } catch (error) {
            return error.content
        }
    }
}

module.exports = new AirService()