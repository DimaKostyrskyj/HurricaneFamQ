const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config.railway.js');
const { isAdmin } = require('../utils/permissions');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('📊 Статистика заявок (только администраторы)'),
    
    async execute(interaction, client) {
        if (!isAdmin(interaction.member)) {
            return interaction.reply({ 
                content: '❌ У вас нет прав для использования этой команды!', 
                ephemeral: true 
            });
        }
        
        // Загружаем данные о заявках
        const dataPath = path.join(__dirname, '..', 'data', 'applications.json');
        let applications = {};
        
        if (fs.existsSync(dataPath)) {
            applications = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        }
        
        // Подсчитываем статистику
        const pending = Object.values(applications).filter(app => app.status === 'pending').length;
        const reviewing = Object.values(applications).filter(app => app.status === 'reviewing').length;
        const approved = Object.values(applications).filter(app => app.status === 'approved').length;
        const rejected = Object.values(applications).filter(app => app.status === 'rejected').length;
        const total = Object.keys(applications).length;
        
        const embed = new EmbedBuilder()
            .setTitle('📊 Статистика заявок Hurricane FamQ')
            .setColor(config.colors.primary)
            .addFields(
                { name: '⏳ Ожидают рассмотрения', value: `${pending}`, inline: true },
                { name: '📌 На рассмотрении', value: `${reviewing}`, inline: true },
                { name: '✅ Одобрено', value: `${approved}`, inline: true },
                { name: '❌ Отклонено', value: `${rejected}`, inline: true },
                { name: '📝 Всего заявок', value: `${total}`, inline: true }
            )
            .setFooter({ 
                text: '🌊 Hurricane FamQ',
                iconURL: interaction.guild.iconURL({ dynamic: true })
            })
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    },
};
