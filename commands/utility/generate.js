const { SlashCommandBuilder } = require('discord.js');
const { Buffer } = require('buffer');
const fs = require('fs');
const path = require('path');
const choices = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'modifiedNames.json')));
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('generate')
        .setDescription('Generate a custom chat textbox.')
        .addStringOption(option =>
            option.setName('chathead')
                .setDescription('NPC/pet/player name')
                .setRequired(true)
                .setAutocomplete(true))
        .addStringOption(option =>
            option.setName('dialogue')
                .setDescription('Set dialogue')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Change default name (optional)'))
        .addStringOption(option =>
            option.setName('removeprompt')
                .setDescription(`Remove 'click here to continue prompt' (optional)`)
                .addChoices(
                    { name: 'Yes, remove prompt', value: 'true' },
                    { name: 'No, keep prompt', value: 'false' },
                )),
    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);
    
        if (focusedOption.name === 'chathead') {
            const filtered = choices.filter(choice => 
                choice.toLowerCase().includes(focusedOption.value.replace(/ /g, '_').toLowerCase())
            );
        
            const options = filtered.length > 25 ? filtered.slice(0, 25) : filtered;

            await interaction.respond(
                options.map(choice => ({ name: choice.replace(/_/g, ' '), value: choice }))
            );
        }
    },
    async execute(interaction) {
        const chathead = interaction.options.getString('chathead');
        const dialogue = interaction.options.getString('dialogue');
        const name = interaction.options.getString('name') || chathead.replace(/_/g, ' ');
        const removePrompt = interaction.options.getString('removeprompt') === 'true';

        try {
            await interaction.deferReply();
            const response = await fetch('https://osrs-chat-generator.adaptable.app/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ chathead, dialogue, name, removePrompt }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error status: ${response.status}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const attachment = {
                files: [{ attachment: buffer, name: 'textbox.png' }],
            };
            await interaction.editReply(attachment);
        } catch (error) {
            console.error('Fetch error:', error);
            await interaction.reply('An error occurred while generating the custom chat textbox.');
        }
    }
};