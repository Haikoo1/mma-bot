const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const roleConfig = require('../config/roles');

function validateUserRole(member, attribute, level) {
    if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;
    if (roleConfig.adminRoleId && member.roles.cache.has(roleConfig.adminRoleId)) return true;

    const requiredRoleId = roleConfig[attribute]?.[level];
    return Boolean(requiredRoleId && member.roles.cache.has(requiredRoleId));
}

function processRoll(effectiveLevel) {
    const roll = Math.floor(Math.random() * 100) + 1;

    if (effectiveLevel >= 5) {
        if (roll <= 10) return 'MISS';
        if (roll <= 40) return 'STAR';
        if (roll <= 75) return 'STAR2';
        return 'GEM';
    } else if (effectiveLevel === 4) {
        if (roll <= 15) return 'MISS';
        if (roll <= 55) return 'STAR';
        return 'STAR2';
    } else if (effectiveLevel === 3) {
        if (roll <= 30) return 'MISS';
        if (roll <= 75) return 'STAR';
        return 'STAR2';
    } else if (effectiveLevel === 2) {
        if (roll <= 45) return 'MISS';
        if (roll <= 85) return 'STAR';
        return 'STAR2';
    } else {
        if (roll <= 60) return 'MISS';
        if (roll <= 92) return 'STAR';
        return 'STAR2';
    }
}

function buildAttackEmbed(data) {
    const { attacker, moveName, level, effectiveLevel, outcomeData, alertMessage, isCounter } = data;

    const rawNarrative = outcomeData.texts[Math.floor(Math.random() * outcomeData.texts.length)];
    const narrative = rawNarrative.replace(/{attacker}/g, `<@${attacker.id}>`);
    const gifUrl = outcomeData.gifs[Math.floor(Math.random() * outcomeData.gifs.length)];

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
        .setImage(gifUrl)
        .setFooter({ text: 'MMA RP • Sistema Narrativo Oficial' })
        .setTimestamp();

    if (alertMessage) {
        embed.addFields({ name: '🚨 Estado de Perigo', value: alertMessage });
    }

    return embed;
}

module.exports = { validateUserRole, processRoll, buildAttackEmbed };