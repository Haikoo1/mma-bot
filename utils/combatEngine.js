const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const roleConfig = require('../config/roles');
const luckyUsersConfig = require('../config/luckyUsers');

function validateUserRole(member, attribute, level) {
    if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;
    if (roleConfig.adminRoleId && member.roles.cache.has(roleConfig.adminRoleId)) return true;

    const requiredRoleId = roleConfig[attribute]?.[level];
    return Boolean(requiredRoleId && member.roles.cache.has(requiredRoleId));
}

// Bônus dinâmico e sutil para usuários pré-definidos (aplicado apenas internamente ao roll)
function getLuckyRollBonus(userId) {
    if (!userId || !luckyUsersConfig.ids.includes(userId)) return 0;

    const { skipChance, min, max } = luckyUsersConfig.bonus;
    if (Math.random() < skipChance) return 0;

    return min + Math.floor(Math.random() * (max - min + 1));
}

function processRoll(effectiveLevel, userId) {
    const roll = Math.floor(Math.random() * 100) + 1;
    const adjustedRoll = Math.min(100, roll + getLuckyRollBonus(userId));

    if (effectiveLevel >= 5) {
        if (adjustedRoll <= 10) return 'MISS';
        if (adjustedRoll <= 40) return 'STAR';
        if (adjustedRoll <= 75) return 'STAR2';
        return 'GEM';
    } else if (effectiveLevel === 4) {
        if (adjustedRoll <= 15) return 'MISS';
        if (adjustedRoll <= 55) return 'STAR';
        return 'STAR2';
    } else if (effectiveLevel === 3) {
        if (adjustedRoll <= 30) return 'MISS';
        if (adjustedRoll <= 75) return 'STAR';
        return 'STAR2';
    } else if (effectiveLevel === 2) {
        if (adjustedRoll <= 45) return 'MISS';
        if (adjustedRoll <= 85) return 'STAR';
        return 'STAR2';
    } else {
        if (adjustedRoll <= 60) return 'MISS';
        if (adjustedRoll <= 92) return 'STAR';
        return 'STAR2';
    }
}

function buildAttackEmbed(data) {
    const { attacker, moveName, level, effectiveLevel, outcomeData, alertMessage, isCounter } = data;

    const rawNarrative = outcomeData.texts[Math.floor(Math.random() * outcomeData.texts.length)];
    const narrative = rawNarrative.replace(/{attacker}/g, `<@${attacker.id}>`);

    let levelDisplay = `\`Nível ${level}/5\``;
    if (effectiveLevel < level) {
        levelDisplay = `\`Nível ${level}\` *(Cansaço/Penalidade: Nível ${effectiveLevel})*`;
    } else if (effectiveLevel > level) {
        levelDisplay = `\`Nível ${level}\` *(⚡ Contragolpe Ativo: Nível ${effectiveLevel})*`;
    }

    const embed = new EmbedBuilder()
        .setAuthor({ 
            name: `Ação RP • ${moveName.toUpperCase()}${isCounter ? ' [CONTRAGOLPE]' : ''}`, 
            iconURL: attacker.displayAvatarURL() 
        })
        .setTitle(`${outcomeData.emoji} ${outcomeData.title}`)
        .setColor(outcomeData.color)
        .setDescription(`>>> ${narrative}`)
        .addFields(
            { name: '🥊 Lutador', value: `<@${attacker.id}>`, inline: true },
            { name: '📊 Nível Executado', value: levelDisplay, inline: true }
        )
        .setFooter({ text: 'MMA RP • Sistema Narrativo Oficial' })
        .setTimestamp();

    if (alertMessage) {
        embed.addFields({ name: '🚨 Estado de Perigo', value: alertMessage });
    }

    return embed;
}

module.exports = { validateUserRole, processRoll, buildAttackEmbed };