const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');
const { canManageApplications } = require('../utils/permissions');
const { logApplication } = require('../utils/logger');
const fs = require('fs');
const path = require('path');

module.exports = {
    customId: 'review',
    
    async execute(interaction, client) {
        // Проверяем права
        if (!canManageApplications(interaction.member)) {
            return interaction.reply({ 
                content: '❌ У вас нет прав для управления заявками!', 
                ephemeral: true 
            });
        }
        
        // Извлекаем ID пользователя из customId кнопки
        const userId = interaction.customId.split('_')[1];
        
        // Обновляем статус заявки
        const dataPath = path.join(__dirname, '..', 'data', 'applications.json');
        let applications = {};
        
        if (fs.existsSync(dataPath)) {
            applications = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        }
        
        if (applications[userId]) {
            applications[userId].status = 'reviewing';
            applications[userId].reviewer = interaction.user.id;
            applications[userId].reviewedAt = Date.now();
            
            fs.writeFileSync(dataPath, JSON.stringify(applications, null, 4));
        }
        
        // Обновляем сообщение с заявкой
        const embed = interaction.message.embeds[0];
        
        // Проверяем, не было ли уже добавлено поле статуса
        const statusFieldIndex = embed.fields.findIndex(field => 
            field.name.includes('Статус')
        );
        
        if (statusFieldIndex !== -1) {
            // Обновляем существующее поле
            embed.fields[statusFieldIndex] = {
                name: '📌 Статус',
                value: `**На рассмотрении** • ${interaction.user}`,
                inline: false
            };
        } else {
            // Добавляем новое поле
            embed.fields.push({
                name: '📌 Статус',
                value: `**На рассмотрении** • ${interaction.user}`,
                inline: false
            });
        }
        
        embed.color = parseInt(config.colors.warning.replace('#', ''), 16);
        
        await interaction.message.edit({ embeds: [embed], components: interaction.message.components });
        
        // Логируем
        const applicant = await client.users.fetch(userId);
        await logApplication(client, applicant, 'reviewing', interaction.user);
        
        await interaction.reply({ 
            content: '✅ Заявка взята на рассмотрение!', 
            ephemeral: true 
        });
    },
};
