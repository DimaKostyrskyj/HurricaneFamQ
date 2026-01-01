const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');
const { logApplication } = require('../utils/logger');
const fs = require('fs');
const path = require('path');

module.exports = {
    customId: 'reject_reason_modal',
    
    async execute(interaction, client) {
        const reason = interaction.fields.getTextInputValue('reject_reason');
        const userId = interaction.message.embeds[0].footer.text.split('ID: ')[1];
        
        // Обновляем статус заявки
        const dataPath = path.join(__dirname, '..', 'data', 'applications.json');
        let applications = {};
        
        if (fs.existsSync(dataPath)) {
            applications = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        }
        
        if (applications[userId]) {
            applications[userId].status = 'rejected';
            applications[userId].reason = reason;
            applications[userId].reviewer = interaction.user.id;
            applications[userId].reviewedAt = Date.now();
            
            fs.writeFileSync(dataPath, JSON.stringify(applications, null, 4));
        }
        
        // Уведомляем пользователя
        try {
            const user = await client.users.fetch(userId);
            
            const rejectEmbed = new EmbedBuilder()
                .setTitle('❌ Заявка отклонена')
                .setDescription('😔 Ваша заявка в Hurricane FamQ была отклонена.')
                .setColor(config.colors.error)
                .addFields(
                    { name: '📋 Причина', value: reason, inline: false },
                    { 
                        name: '💡 Что дальше?', 
                        value: 'Вы можете подать новую заявку после устранения указанных замечаний.', 
                        inline: false 
                    }
                )
                .setFooter({ text: '🌊 Hurricane FamQ' })
                .setTimestamp();
            
            await user.send({ embeds: [rejectEmbed] });
        } catch (error) {
            console.error('❌ Не удалось отправить ЛС пользователю:', error);
        }
        
        // Обновляем сообщение с заявкой
        const embed = interaction.message.embeds[0];
        embed.color = parseInt(config.colors.error.replace('#', ''), 16);
        embed.fields.push({
            name: '❌ Статус',
            value: `**Отклонена** модератором ${interaction.user}\n📋 **Причина:** ${reason}`,
            inline: false
        });
        
        await interaction.message.edit({ embeds: [embed], components: [] });
        
        // Логируем
        const applicant = await client.users.fetch(userId);
        await logApplication(client, applicant, 'rejected', interaction.user);
        
        await interaction.reply({ 
            content: `✅ Заявка отклонена! Причина: ${reason}`, 
            ephemeral: true 
        });
    },
};
