const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'apply',
    
    async execute(interaction, client) {
        // Создаем модальное окно для заявки
        const modal = new ModalBuilder()
            .setCustomId('application_modal')
            .setTitle('Заявка в Hurricane FamQ');
        
        const nameInput = new TextInputBuilder()
            .setCustomId('name')
            .setLabel('Ваше имя и фамилия (RP)')
            .setPlaceholder('Например: Ivan Ivanov')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(50);
        
        const ageInput = new TextInputBuilder()
            .setCustomId('age')
            .setLabel('Возраст персонажа')
            .setPlaceholder('Например: 25')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(3);
        
        const experienceInput = new TextInputBuilder()
            .setCustomId('experience')
            .setLabel('Опыт игры на сервере')
            .setPlaceholder('Расскажите о вашем опыте игры в GTA 5 RP')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(500);
        
        const whyFamilyInput = new TextInputBuilder()
            .setCustomId('why_family')
            .setLabel('Почему хотите вступить в Hurricane FamQ?')
            .setPlaceholder('Расскажите, почему выбрали именно нашу семью')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(500);
        
        const aboutYourselfInput = new TextInputBuilder()
            .setCustomId('about_yourself')
            .setLabel('Расскажите о себе')
            .setPlaceholder('Немного о вас и вашем персонаже')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(500);
        
        const firstRow = new ActionRowBuilder().addComponents(nameInput);
        const secondRow = new ActionRowBuilder().addComponents(ageInput);
        const thirdRow = new ActionRowBuilder().addComponents(experienceInput);
        const fourthRow = new ActionRowBuilder().addComponents(whyFamilyInput);
        const fifthRow = new ActionRowBuilder().addComponents(aboutYourselfInput);
        
        modal.addComponents(firstRow, secondRow, thirdRow, fourthRow, fifthRow);
        
        await interaction.showModal(modal);
    },
};
