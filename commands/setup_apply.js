const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');
const { isAdmin } = require('../utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup_apply')
        .setDescription('📝 Создать кнопку для подачи заявок (только администраторы)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction, client) {
        if (!isAdmin(interaction.member)) {
            return interaction.reply({ 
                content: '❌ У вас нет прав для использования этой команды!', 
                ephemeral: true 
            });
        }
        
        const embed = new EmbedBuilder()
            .setTitle('📝 Заявка в Hurricane FamQ')
            .setDescription('👋 Хочешь стать частью нашей семьи? Заполни заявку ниже!')
            .setColor(config.colors.primary)
            .addFields(
                {
                    name: '📋 Требования',
                    value: 
                        '• 🎂 Возраст персонажа 18+\n' +
                        '• 🎤 Микрофон обязателен\n' +
                        '• 🎭 Знание основ RP\n' +
                        '• ⚡ Активность на сервере\n' +
                        '• 💬 Адекватность и уважение',
                    inline: false
                },
                {
                    name: '✅ После одобрения',
                    value: 'Вы получите роль **Hurricane Academy** и сможете начать свой путь в семье!',
                    inline: false
                }
            )
            .setFooter({ 
                text: '🌊 Hurricane FamQ • Нажми на кнопку ниже',
                iconURL: interaction.guild.iconURL({ dynamic: true })
            })
            .setTimestamp();
        
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('apply')
                    .setLabel('📝 Подать заявку в семью')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('✨')
            );
        
        await interaction.channel.send({ embeds: [embed], components: [row] });
        
        await interaction.reply({ 
            content: '✅ Сообщение с кнопкой подачи заявки создано!', 
            ephemeral: true 
        });
        
        // Удаляем команду если возможно
        try {
            await interaction.deleteReply();
        } catch (error) {
            // Игнорируем ошибку
        }
    },
};
