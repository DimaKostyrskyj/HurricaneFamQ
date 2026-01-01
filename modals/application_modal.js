const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config.json');
const { logApplication } = require('../utils/logger');
const fs = require('fs');
const path = require('path');

module.exports = {
    customId: 'application_modal',
    
    async execute(interaction, client) {
        const name = interaction.fields.getTextInputValue('name');
        const age = interaction.fields.getTextInputValue('age');
        const experience = interaction.fields.getTextInputValue('experience');
        const whyFamily = interaction.fields.getTextInputValue('why_family');
        const aboutYourself = interaction.fields.getTextInputValue('about_yourself');
        
        // Проверяем, нет ли уже активной заявки
        const dataPath = path.join(__dirname, '..', 'data', 'applications.json');
        let applications = {};
        
        if (fs.existsSync(dataPath)) {
            applications = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        }
        
        const userId = interaction.user.id;
        
        if (applications[userId] && applications[userId].status === 'pending') {
            return interaction.reply({ 
                content: '❌ У вас уже есть активная заявка! Дождитесь её рассмотрения.', 
                ephemeral: true 
            });
        }
        
        // Создаем embed с заявкой
        const embed = new EmbedBuilder()
            .setTitle('📝 Новая заявка в семью')
            .setDescription(`👤 **Кандидат:** ${interaction.user}\n📅 **Дата:** <t:${Math.floor(Date.now() / 1000)}:F>`)
            .setColor(config.colors.primary)
            .addFields(
                { name: '🎭 Имя персонажа', value: name, inline: true },
                { name: '🎂 Возраст', value: `${age} лет`, inline: true },
                { name: '💬 Discord', value: interaction.user.tag, inline: true },
                { name: '🎮 Опыт игры', value: experience, inline: false },
                { name: '💎 Почему Hurricane FamQ?', value: whyFamily, inline: false },
                { name: '✨ О себе', value: aboutYourself, inline: false }
            )
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: `🆔 ID: ${interaction.user.id}` })
            .setTimestamp();
        
        // Создаем кнопки управления
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`approve_${userId}`)
                    .setLabel('✅ Одобрить')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`reject_${userId}`)
                    .setLabel('❌ Отклонить')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId(`review_${userId}`)
                    .setLabel('📌 На рассмотрении')
                    .setStyle(ButtonStyle.Primary)
            );
        
        // Отправляем в канал рассмотрения
        const reviewChannel = client.channels.cache.get(config.channels.applications);
        
        if (!reviewChannel) {
            return interaction.reply({ 
                content: '❌ Канал рассмотрения заявок не найден! Обратитесь к администратору.', 
                ephemeral: true 
            });
        }
        
        // Упоминаем рекрутеров
        const recRole = interaction.guild.roles.cache.get(config.roles.rec);
        const mention = recRole ? `${recRole} 📝 Новая заявка!` : '📝 Новая заявка!';
        
        await reviewChannel.send({ content: mention, embeds: [embed], components: [row] });
        
        // Сохраняем заявку
        applications[userId] = {
            name,
            age,
            experience,
            whyFamily,
            aboutYourself,
            status: 'pending',
            timestamp: Date.now()
        };
        
        // Создаем директорию data если её нет
        const dataDir = path.join(__dirname, '..', 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        fs.writeFileSync(dataPath, JSON.stringify(applications, null, 4));
        
        // Логируем
        await logApplication(client, interaction.user, 'submitted');
        
        await interaction.reply({ 
            content: '✅ Ваша заявка успешно отправлена на рассмотрение! Ожидайте ответа.', 
            ephemeral: true 
        });
    },
};
