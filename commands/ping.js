const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config.railway.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('🏓 Проверить задержку бота'),
    
    async execute(interaction, client) {
        const latency = Math.round(client.ws.ping);
        
        const color = latency < 100 ? config.colors.success : 
                     latency < 200 ? config.colors.warning : config.colors.error;
        
        const embed = new EmbedBuilder()
            .setTitle('🏓 Понг!')
            .setDescription(`Задержка: **${latency}ms**`)
            .setColor(color)
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
