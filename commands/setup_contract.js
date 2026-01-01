const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');
const { isAdmin } = require('../utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup_contract')
        .setDescription('📋 Создать кнопку для создания контрактов (только администраторы)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction, client) {
        if (!isAdmin(interaction.member)) {
            return interaction.reply({ 
                content: '❌ У вас нет прав для использования этой команды!', 
                ephemeral: true 
            });
        }
        
        const embed = new EmbedBuilder()
            .setTitle('📋 Система контрактов Hurricane FamQ')
            .setDescription(
                '🎯 **Создание контрактов**\n\n' +
                'Нажмите на кнопку ниже, чтобы открыть форму создания контракта.\n\n' +
                '**Доступные действия:**\n' +
                '🟢 Создать контракт\n' +
                '🟢 Запустить регистрацию\n' +
                '🔵 Начать контракт\n' +
                '🔴 Завершить контракт'
            )
            .setColor(config.colors.primary)
            .setFooter({ 
                text: '🌊 Hurricane FamQ',
                iconURL: interaction.guild.iconURL({ dynamic: true })
            })
            .setTimestamp();
        
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('contract_create')
                    .setLabel('📋 Создать контракт')
                    .setStyle(ButtonStyle.Success)
            );
        
        await interaction.channel.send({ embeds: [embed], components: [row] });
        
        await interaction.reply({ 
            content: '✅ Сообщение с кнопкой создания контракта создано!', 
            ephemeral: true 
        });
    },
};
