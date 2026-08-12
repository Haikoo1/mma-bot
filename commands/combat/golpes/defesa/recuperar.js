const { EmbedBuilder } = require('discord.js');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'recuperar',
    noLevel: true,
    async execute(message) {
        const fight = FightManager.getFight(message.channel.id);
        if (!fight) return message.reply('❌ Nenhuma luta ativa neste canal.');

        const fighterObj = fight.fighters.find(f => f.id === message.author.id);
        if (!fighterObj) return message.reply('❌ Você não é um dos lutadores participantes desta luta.');

        if (fighterObj.recuperarUsedThisRound) {
            return message.reply('⚠️ Você já utilizou o `-recuperar` neste round! Aguarde o próximo.');
        }

        fighterObj.recuperarUsedThisRound = true;
        if (fighterObj.damage > 0) fighterObj.damage = Math.max(0, fighterObj.damage - 2);
        if (fighterObj.cuts > 0) fighterObj.cuts -= 1;
        fighterObj.stamina = Math.min(100, fighterObj.stamina + 20);

        const embed = new EmbedBuilder()
            .setTitle(`🧊 RECUPERAÇÃO EM LUTA • ${message.author.username.toUpperCase()}`)
            .setColor(0x2ecc71)
            .setDescription(`>>> O atleta respira fundo, trata seus ferimentos na brecha e recupera seu ritmo no octógono!`)
            .addFields(
                { name: '🩹 Dano Reduzido', value: '`-2 Pts`', inline: true },
                { name: '⚡ Gás Restaurado', value: '`+20% Stamina`', inline: true },
                { name: '📊 Dano Total Atual', value: `\`${fighterObj.damage} pts\``, inline: true }
            )
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }
};