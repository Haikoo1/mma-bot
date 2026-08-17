const { EmbedBuilder } = require('discord.js');
const { FightManager } = require('./fightManager');

async function executeMove(message, level, moveConfig) {
    const attacker = message.author;

    // 1. Registra o impacto e calcula Atk x Def no FightManager
    const result = FightManager.registerHit(
        message.channel,
        attacker,
        moveConfig.name,
        level,
        null,
        moveConfig.isCutRisk ?? true,
        moveConfig.attribute || 'Striking',
        moveConfig.staminaCost ?? 3
    );

    if (!result) {
        return message.reply('❌ Nenhuma luta ativa em andamento neste canal.');
    }

    if (result.isFoul) return;

    // 2. Classifica a intensidade do resultado
    let category = 'MISS';
    if (result.netValue >= 3) category = 'GEM';
    else if (result.netValue >= 1) category = 'STAR2';
    else if (result.netValue === 0 || result.netValue === -1) category = 'STAR';

    // 3. Sorteia uma narrativa aleatória
    const pool = moveConfig.variations[category] || [
        `{attacker} executou ${moveConfig.name} com nível ${level}!`
    ];
    const narrativeText = pool[Math.floor(Math.random() * pool.length)].replace('{attacker}', `${attacker}`);

    // 4. Envia o Embed com a narração da ação
    const actionEmbed = new EmbedBuilder()
        .setTitle(`🥊 GOLPE EXECUTADO • ${moveConfig.name.toUpperCase()} (Nível ${level})`)
        .setColor(category === 'GEM' ? 0x9b59b6 : category === 'STAR2' ? 0xf1c40f : category === 'STAR' ? 0x2ecc71 : 0xe74c3c)
        .setDescription(`>>> ${narrativeText}`)
        .setTimestamp();

    await message.channel.send({ embeds: [actionEmbed] });

    // 5. O relatório Atk x Def é exibido uma única vez por round, no fim do round
}

module.exports = { executeMove };