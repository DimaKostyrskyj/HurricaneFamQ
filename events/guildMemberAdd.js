const { EmbedBuilder } = require('discord.js');
const config = require('../config.railway.js');
const { sendLog } = require('../utils/logger');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client) {
        // Выдаем роль Guest новому участнику
        try {
            const guestRole = member.guild.roles.cache.get(config.roles.guest);
            
            if (guestRole) {
                await member.roles.add(guestRole);
                console.log(`✅ Роль Guest выдана пользователю ${member.user.tag}`);
            } else {
                console.error('❌ Роль Guest не найдена в конфигурации!');
            }
        } catch (error) {
            console.error('❌ Ошибка при выдаче роли Guest:', error);
        }
        
        // Отправляем приветственное сообщение в канал
        const welcomeChannel = member.guild.channels.cache.get(config.channels.welcome);
        
        if (!welcomeChannel) {
            console.error('❌ Канал приветствий не найден!');
            return;
        }
        
        const embed = new EmbedBuilder()
            .setTitle('🌊 Добро пожаловать в Hurricane FamQ!')
            .setDescription(
                `Приветствуем тебя, ${member}!\n\n` +
                `🏝️ **Hurricane FamQ** — это семья в GTA 5 RP, где царит атмосфера братства и взаимопомощи.\n\n` +
                `📝 Хочешь присоединиться к нам? Перейди в <#${config.channels.apply}> и подай заявку!\n\n` +
                `💎 Мы ждем именно тебя в наших рядах!`
            )
            .setColor(config.colors.primary)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ 
                text: 'Hurricane FamQ | GTA 5 RP',
                iconURL: member.guild.iconURL({ dynamic: true })
            })
            .setTimestamp();
        
        try {
            await welcomeChannel.send({ embeds: [embed] });
            
            // Логирование
            await sendLog(client, 'info', 'Новый участник', 
                `${member.user.tag} присоединился к серверу`, member.user);
        } catch (error) {
            console.error('❌ Ошибка отправки приветствия:', error);
        }
    },
};