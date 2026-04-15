const { Events, MessageFlags } = require('discord.js')
const ai = require("../ai/AIService")

const bot_commands = "1450943955624792300"
const allowedRoles = ["Donor", "my son"]

const cooldown = 2000
let lastSent = 0

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (message.author.bot) return
        if (! message.channel) return
        const isOwner = message.guild.ownerId === message.author.id
        if (message.channel.id !== bot_commands && ! isOwner) return
        const client = message.client

        if (message.mentions.has(client.user)) {
            if (! message.guild || ! message.member) return
            const hasAllowedRole = message.member.roles.cache.some(role => allowedRoles.includes(role.name))
            if (! isOwner && ! hasAllowedRole) return await message.reply("Sorry, Only sexy people can talk to me.")

            const now = Date.now()
            if (now - lastSent < cooldown) return
            lastSent = now

            const cleanMessage = message.content.replace(`<@${ client.user.id }>`, '').trim()

            if (cleanMessage.length > 0) try {
                await message.channel.sendTyping()
                const aiResponse = await ai.askAI(message.author.id, cleanMessage)

                await message.reply({
                    content: aiResponse.substring(0, 1800),
                    allowedMentions: { parse: [], roles: [], users: [], repliedUser: true },
                    flags: [MessageFlags.SuppressNotifications]
                })
            }
            catch (err) {
                console.error("AI Reply Error:", err)
                await message.reply("Sorry, my brain is currently offline.")
            }
        }
    }
}