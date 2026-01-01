const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');
const { canManageApplications } = require('../utils/permissions');
const { logApplication } = require('../utils/logger');
const fs = require('fs');
const path = require('path');

module.exports = {
    customId: 'approve',
    
    async execute(interaction, client) {
        // Проверяем права
        if (!canManageApplications(interaction.member)) {
            return interaction.reply({ 
                content: '❌ У вас нет прав для одобрения заявок!', 
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
            applications[userId].status = 'approved';
            applications[userId].reviewer = interaction.user.id;
            applications[userId].reviewedAt = Date.now();
            
            fs.writeFileSync(dataPath, JSON.stringify(applications, null, 4));
        }
        
        // Выдаем роль Hurricane Academy
        const academyRole = interaction.guild.roles.cache.get(config.roles.academy);
        
        try {
            const member = await interaction.guild.members.fetch(userId);
            
            if (member && academyRole) {
                await member.roles.add(academyRole);
            }
        } catch (error) {
            console.error('❌ Ошибка выдачи роли:', error);
        }
        
        // Уведомляем пользователя
        try {
            const user = await client.users.fetch(userId);
            
            const approveEmbed = new EmbedBuilder()
                .setTitle('✅ Заявка одобрена!')
                .setDescription('🎉 **Поздравляем! Вы приняты в Hurricane FamQ!**')
                .setColor(config.colors.success)
                .addFields({
                    name: '👋 Добро пожаловать',
                    value: 'Вам выдана роль **Hurricane Academy**. Начните свой путь в семье!',
                    inline: false
                })
                .setFooter({ text: '🌊 Hurricane FamQ' })
                .setTimestamp();
            
            await user.send({ embeds: [approveEmbed] });
        } catch (error) {
            console.error('❌ Не удалось отправить ЛС пользователю:', error);
        }
        
        // Обновляем сообщение с заявкой
        const embed = interaction.message.embeds[0];
        embed.color = parseInt(config.colors.success.replace('#', ''), 16);
        embed.fields.push({
            name: '✅ Статус',
            value: `**Одобрена** • ${interaction.user}`,
            inline: false
        });
        
        await interaction.message.edit({ embeds: [embed], components: [] });
        
        // Логируем
        const applicant = await client.users.fetch(userId);
        await logApplication(client, applicant, 'approved', interaction.user);
        
        await interaction.reply({ 
            content: `✅ Заявка одобрена! ${applicant} получил роль Hurricane Academy.`, 
            ephemeral: true 
        });
    },
};
