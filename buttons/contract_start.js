const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config.json');
const { canStartContract } = require('../utils/permissions');
const { logContract } = require('../utils/logger');
const fs = require('fs');
const path = require('path');

module.exports = {
    customId: 'contract_start',
    
    async execute(interaction, client) {
        // Проверяем права
        if (!canStartContract(interaction.member)) {
            return interaction.reply({ 
                content: '❌ У вас нет прав! Требуется роль Contract, Owner, Dep.Owner или ASS.', 
                ephemeral: true 
            });
        }
        
        const messageId = interaction.message.id;
        
        // Загружаем контракты
        const contractsPath = path.join(__dirname, '..', 'data', 'contracts.json');
        let contracts = {};
        
        if (fs.existsSync(contractsPath)) {
            contracts = JSON.parse(fs.readFileSync(contractsPath, 'utf8'));
        }
        
        if (!contracts[messageId]) {
            return interaction.reply({ 
                content: '❌ Контракт не найден!', 
                ephemeral: true 
            });
        }
        
        // Обновляем статус контракта
        contracts[messageId].status = 'started';
        contracts[messageId].startedBy = interaction.user.id;
        contracts[messageId].startedAt = Date.now();
        fs.writeFileSync(contractsPath, JSON.stringify(contracts, null, 4));
        
        // Обновляем embed
        const embed = interaction.message.embeds[0];
        
        // Обновляем статус
        const statusFieldIndex = embed.fields.findIndex(field => 
            field.name.includes('Статус')
        );
        
        if (statusFieldIndex !== -1) {
            embed.fields[statusFieldIndex] = {
                name: '🔵 Статус:',
                value: '⏳ Контракт начат!',
                inline: false
            };
        }
        
        // Создаем новую кнопку "Закончить"
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('contract_finish')
                    .setLabel('Закончить')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('⏹️')
            );
        
        await interaction.message.edit({ embeds: [embed], components: [row] });
        
        // Отправляем сообщение в тред
        if (interaction.message.thread) {
            await interaction.message.thread.send(
                `✅ Контракт начат! Начал: ${interaction.user}`
            );
        }
        
        // Логируем
        await logContract(client, interaction.user, 'started', contracts[messageId].name);
        
        await interaction.reply({ 
            content: '✅ Контракт начат!', 
            ephemeral: true 
        });
    },
};
