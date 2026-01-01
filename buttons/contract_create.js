const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'contract_create',
    
    async execute(interaction, client) {
        // Создаем модальное окно для создания контракта
        const modal = new ModalBuilder()
            .setCustomId('contract_modal')
            .setTitle('🚀 Публикация контракта');
        
        const nameInput = new TextInputBuilder()
            .setCustomId('contract_name')
            .setLabel('Название контракта')
            .setPlaceholder('Например: Бирюзовый док')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(100);
        
        const rewardInput = new TextInputBuilder()
            .setCustomId('reward')
            .setLabel('Награда')
            .setPlaceholder('Например: $20.000 / 20 вексельок')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(100);
        
        const durationExecutionInput = new TextInputBuilder()
            .setCustomId('duration_execution')
            .setLabel('Срок действия / Длится')
            .setPlaceholder('Например: до 25.12.2024 / 2ч 30м')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(100);
        
        const completeForInput = new TextInputBuilder()
            .setCustomId('complete_for')
            .setLabel('Выполнить за')
            .setPlaceholder('Например: 1ч 45м')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(50);
        
        const chanceInput = new TextInputBuilder()
            .setCustomId('chance')
            .setLabel('Шанс')
            .setPlaceholder('Например: 50%')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(20);
        
        const firstRow = new ActionRowBuilder().addComponents(nameInput);
        const secondRow = new ActionRowBuilder().addComponents(rewardInput);
        const thirdRow = new ActionRowBuilder().addComponents(durationExecutionInput);
        const fourthRow = new ActionRowBuilder().addComponents(completeForInput);
        const fifthRow = new ActionRowBuilder().addComponents(chanceInput);
        
        modal.addComponents(firstRow, secondRow, thirdRow, fourthRow, fifthRow);
        
        await interaction.showModal(modal);
    },
};
