const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function drawBar(current, max, filledEmoji, emptyEmoji, blocks = 10) {
    const percentage = Math.max(0, Math.min(1, current / max));
    const filledBlocks = Math.round(percentage * blocks);
    const emptyBlocks = blocks - filledBlocks;
    return filledEmoji.repeat(filledBlocks) + emptyEmoji.repeat(emptyBlocks);
}

function getStaminaBar(stamina) {
    const emoji = stamina > 70 ? '🟩' : stamina > 35 ? '🟨' : '🟥';
    return `[${drawBar(stamina, 100, emoji, '⬛', 10)}] \`${stamina}%\``;
}

function getDamageBar(damage, maxDamage = 10) {
    const currentDamage = Math.min(damage, maxDamage);
    return `[${drawBar(currentDamage, maxDamage, '🩸', '⬛', 10)}] \`${damage}/${maxDamage} pts\``;
}

function createBetweenRoundsButtons(disabled = false) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('btn_recuperar')
            .setLabel('🧊 Recuperar (-2 Dano / +20% Gás)')
            .setStyle(ButtonStyle.Success)
            .setDisabled(disabled),
        new ButtonBuilder()
            .setCustomId('btn_next_round')
            .setLabel('🔔 Iniciar Próximo Round')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(disabled)
    );
}

module.exports = { getStaminaBar, getDamageBar, createBetweenRoundsButtons };