const { EmbedBuilder } = require('discord.js');
const config = require('../config.railway.js');
const { canFinishContract } = require('../utils/permissions');
const { logContract } = require('../utils/logger');
const fs = require('fs');
const path = require('path');

module.exports = {
    customId: 'contract_finish',
    
    async execute(interaction, client) {
        // Проверяем права
        if (!canFinishContract(interaction.member)) {
            return interaction.reply({ 
                content: '❌ У вас нет прав для завершения контракта!', 
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
        contracts[messageId].status = 'finished';
        contracts[messageId].finishedBy = interaction.user.id;
        contracts[messageId].finishedAt = Date.now();
        fs.writeFileSync(contractsPath, JSON.stringify(contracts, null, 4));
        
        // Обновляем embed
        const embed = interaction.message.embeds[0];
        
        // Обновляем статус
        const statusFieldIndex = embed.fields.findIndex(field => 
            field.name.includes('Статус')
        );
        
        if (statusFieldIndex !== -1) {
            embed.fields[statusFieldIndex] = {
                name: '🔴 Статус:',
                value: '✅ Контракт завершен!',
                inline: false
            };
        }
        
        await interaction.message.edit({ embeds: [embed], components: [] });
        
        // Отправляем сообщение в тред
        if (interaction.message.thread) {
            await interaction.message.thread.send(
                `✅ Контракт завершен! Завершил: ${interaction.user}`
            );
        }
        
        // Логируем
        await logContract(client, interaction.user, 'finished', contracts[messageId].name);
        
        await interaction.reply({ 
            content: '✅ Контракт завершен!', 
            ephemeral: true 
        });
    },
};
