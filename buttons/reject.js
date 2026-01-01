const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { canManageApplications } = require('../utils/permissions');

module.exports = {
    customId: 'reject',
    
    async execute(interaction, client) {
        // Проверяем права
        if (!canManageApplications(interaction.member)) {
            return interaction.reply({ 
                content: '❌ У вас нет прав для отклонения заявок!', 
                ephemeral: true 
            });
        }
        
        // Создаем модальное окно для причины отклонения
        const modal = new ModalBuilder()
            .setCustomId('reject_reason_modal')
            .setTitle('Причина отклонения');
        
        const reasonInput = new TextInputBuilder()
            .setCustomId('reject_reason')
            .setLabel('Укажите причину отклонения')
            .setPlaceholder('Напишите причину, по которой заявка отклонена')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(500);
        
        const row = new ActionRowBuilder().addComponents(reasonInput);
        modal.addComponents(row);
        
        await interaction.showModal(modal);
    },
};
