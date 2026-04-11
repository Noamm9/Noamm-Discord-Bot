require('dotenv').config({ path: require("path").join(__dirname, '../../.env') })
const { REST, Routes } = require("discord.js")
const fs = require('node:fs')
const path = require('node:path')

const token = process.env.DISCORD_BOT_TOKEN
const appId = process.env.DISCORD_BOT_CLIENT_ID

const rest = new REST({ version: '10' }).setToken(token);
const commands = []

const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'))

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file)
    const command = require(filePath)
    commands.push(command.data.toJSON())
}

async function init() {
	const data = await rest.put(Routes.applicationCommands(appId), { body: commands})
	console.log(`Successfully loaded ${data.length} application (/) commands.`)
}

init()