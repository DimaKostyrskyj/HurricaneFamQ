const { EmbedBuilder } = require('discord.js');
const config = require('../config.railway.js');
const { logApplication } = require('../utils/logger');
const fs = require('fs');
const path = require('path');

module.exports = {
    customId: 'approve',
    
    async execute(interaction, client) {
        // Извлекаем ID пользователя из customId кнопки
        const userId = interaction.customId.split('_')[1];
        
        // Проверяем права (только REC могут одобрять)
        const recRole = interaction.guild.roles.cache.get(config.roles.rec);
        if (!recRole || !interaction.member.roles.cache.has(config.roles.rec)) {
            return interaction.reply({ 
                content: '❌ У вас нет прав для одобрения заявок!', 
                ephemeral: true 
            });
        }
        
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
        
        // Получаем пользователя и роли
        try {
            const member = await interaction.guild.members.fetch(userId);
            const academyRole = interaction.guild.roles.cache.get(config.roles.academy);
            const guestRole = interaction.guild.roles.cache.get(config.roles.guest);
            
            if (!academyRole) {
                return interaction.reply({ 
                    content: '❌ Роль Academy не найдена! Проверьте config.railway.js', 
                    ephemeral: true 
                });
            }
            
            // Выдаем роль Academy
            await member.roles.add(academyRole);
            console.log(`✅ Роль Academy выдана пользователю ${member.user.tag}`);
            
            // Убираем роль Guest если она есть
            if (guestRole && member.roles.cache.has(guestRole.id)) {
                await member.roles.remove(guestRole);
                console.log(`✅ Роль Guest убрана у пользователя ${member.user.tag}`);
            }
            
            // Уведомляем пользователя
            const approveEmbed = new EmbedBuilder()
                .setTitle('✅ Заявка одобрена!')
                .setDescription('🎉 Поздравляем! Ваша заявка в Hurricane FamQ была одобрена!')
                .setColor(config.colors.success)
                .addFields(
                    { 
                        name: '🎓 Добро пожаловать в Academy!', 
                        value: 'Вам была выдана роль Academy. Теперь вы можете участвовать в жизни семьи!', 
                        inline: false 
                    },
                    { 
                        name: '📚 Следующие шаги', 
                        value: '• Ознакомьтесь с правилами Academy\n• Участвуйте в контрактах и мероприятиях\n• Общайтесь с другими членами семьи', 
                        inline: false 
                    }
                )
                .setFooter({ text: '🌊 Hurricane FamQ' })
                .setTimestamp();
            
            await member.send({ embeds: [approveEmbed] });
            
        } catch (error) {
            console.error('❌ Ошибка при выдаче роли:', error);
            return interaction.reply({ 
                content: '❌ Не удалось выдать роль! Проверьте права бота и наличие пользователя на сервере.', 
                ephemeral: true 
            });
        }
        
        // Обновляем сообщение с заявкой
        const embed = interaction.message.embeds[0];
        embed.color = parseInt(config.colors.success.replace('#', ''), 16);
        embed.fields.push({
            name: '✅ Статус',
            value: `**Одобрена** модератором ${interaction.user}\n🎓 Выдана роль: **Academy**`,
            inline: false
        });
        
        await interaction.message.edit({ embeds: [embed], components: [] });
        
        // Логируем
        const applicant = await client.users.fetch(userId);
        await logApplication(client, applicant, 'approved', interaction.user);
        
        await interaction.reply({ 
            content: `✅ Заявка одобрена! Пользователю <@${userId}> выдана роль Academy и убрана роль Guest.`, 
            ephemeral: true 
        });
    },
};