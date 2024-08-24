const { SlashCommandBuilder } = require('discord.js');
const { Buffer } = require('buffer');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('generate')
        .setDescription('Generate a custom chat textbox.')
        .addStringOption(option =>
            option.setName('chathead')
                .setDescription('NPC/pet/player name')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('dialogue')
                .setDescription('Set dialogue')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Change name (optional)')),
    async execute(interaction) {
        const chathead = interaction.options.getString('chathead');
        const dialogue = interaction.options.getString('dialogue');
        const name = interaction.options.getString('name') ?? '';

        try {
            const response = await fetch('http://localhost:3000/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ chathead, dialogue, name }),
            });

            const arrayBuffer = await response.arrayBuffer(); // Get the binary image data as ArrayBuffer
            const buffer = Buffer.from(arrayBuffer); // Convert ArrayBuffer to Node.js Buffer
            const attachment = {
                files: [{ attachment: buffer, name: 'textbox.png' }],
            };
            await interaction.reply({ content: 'Here is your custom chat textbox:', ...attachment });
        } catch (error) {
            console.error('Fetch error:', error);
            await interaction.reply('An error occurred while generating the custom chat textbox.');
        }
    }
};