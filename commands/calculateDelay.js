const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('calculatedelay')
        .setDescription('Calculates the recommended Autoterms delay for the inserted ping')
        .addNumberOption((option) => option.setName('ping').setDescription('Insert your ping here').setRequired(true)),
    async execute(interaction) {
        const ping = interaction.options.getNumber('ping')
        if (ping < 0) return await interaction.reply(`ping cannot be negative meow!`)
        const medianPing = 150 - ping

        if (medianPing <= 0) await interaction.reply(`min: 0ms, max: 0ms`)
        else await interaction.reply(`min: ${ Math.floor(0.8 * medianPing) }ms, max: ${ Math.ceil(1.2 * medianPing) }ms`)
    }
}