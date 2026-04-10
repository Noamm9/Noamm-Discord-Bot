import "dotenv/config"

import { Client, Events, GatewayIntentBits, Message, TextChannel } from "discord.js"

const token = process.env.DISCORD_TOKEN
const autotermMessages = ["autoterm", "autoterminal", "auto term", "auto terminal"]
const delayMessages = ["delay", "settings"]

function initClient() {

    if (!token) {
        console.error("Discord token is not set")
        process.exit(1)
    }

    const client = new Client({ 
        intents: [
            GatewayIntentBits.Guilds, 
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent
        ],
    })

    client.login(token)

    return client
}

const client = initClient()

client.once(Events.ClientReady, (client: Client) => {
    if (client == null || client.user == null) {
        console.log("Couldn't log in successfully")
        return
    }
    console.log(`Sucessfully logged in as ${client.user.tag}`)
})

client.on(Events.MessageCreate, (message: Message) => {
    let content = message.content
    let channel = client.channels.cache.get(message.channelId) as TextChannel

    if (channel == undefined) {
        console.log("Channel is undefined, this shouldn't happen")
        return
    }

    if (matchDelayMessage(content) && matchAutotermMessage(content))
        channel.send("The delay is ping based so the median value should be around 150 - ping. If this result is negative then you probably can use 0 delay! Random delay is based on a Gaussian Distribution so your min and max should usually be around 80% - 120% of the calculated median respectively")
})

function matchDelayMessage(content: string) {
    return delayMessages.some(keyword => content.includes(keyword))
}

function matchAutotermMessage(content: string) {
    return autotermMessages.some(keyword => content.includes(keyword))
}