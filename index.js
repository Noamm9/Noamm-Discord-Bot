require('dotenv').config({ path: require("path").join(__dirname, '../../.env') })
const { Client, Events, GatewayIntentBits } = require("discord.js")

const token = process.env.DISCORD_BOT_TOKEN
const autotermMessages = ["autoterm", "autoterminal", "auto term", "auto terminal"]
const delayMessages = ["delay", "settings"]

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
})

const matchDelayMessage = content => delayMessages.some(keyword => content.includes(keyword))
const matchAutotermMessage = content => autotermMessages.some(keyword => content.includes(keyword))

client.on(Events.ClientReady, readyClient => {
    if (!readyClient || !readyClient.user) return console.log("Couldn't log in successfully")
    console.log(`Successfully logged in as ${readyClient.user.tag}`)
})

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return

    const content = message.content.toLowerCase()
    const channel = message.channel
    if (!channel) return

    if (matchDelayMessage(content) && matchAutotermMessage(content)) {
        try {
            await message.reply("The delay is ping based so the median value should be around 150 - ping. If this result is negative then you probably can use 0 delay! Random delay is based on a Gaussian Distribution so your min and max should usually be around 80% - 120% of the calculated median respectively")
        }
        catch (err) {
            console.error("Failed to send message:", err)
        }
    }
})

client.login(token).catch(err => console.error("Login failed:", err.message))
