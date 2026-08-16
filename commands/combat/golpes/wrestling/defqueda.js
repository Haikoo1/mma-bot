const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'defqueda',
    attribute: 'wrestling',
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'DEFESA DE QUEDA PERFEITA / CONTRA-ATAQUE',
            color: 0x9b59b6,
            texts: [
                "{attacker} manda as pernas para trás em um Sprawl brutal, esmaga a cabeça do oponente e assume o controle por cima!",
                "{attacker} bloqueia a investida de queda com maestria e inverte a posição com um giro rápido!",
                "{attacker} antecipa o mergulho, joga o quadril pesado por cima e ataca o pescoço do rival!",
                "{attacker} anula o takedown perfeitamente, faz o oponente bater no chão e ganha a posição de domínio!"
            ],
        },
        STAR2: {
            emoji: '🌟',
            title: 'SPRAWL EFICIENTE',
            color: 0xf1c40f,
            texts: [
                "{attacker} espalha o peso sobre as costas do oponente e anula completamente o takedown.",
                "{attacker} esgrima os braços, frustra a entrada e afasta o adversário com um empurrão.",
                "{attacker} reage a tempo com um sprawl limpo, mantendo a luta em pé.",
                "{attacker} bloqueia as pegadas nas pernas e empurra a cabeça do oponente para quebrar a entrada."
            ],
        },
        STAR: {
            emoji: '⭐',
            title: 'DEFESA PARCIAL',
            color: 0x2ecc71,
            texts: [
                "{attacker} segura a cabeça do oponente e evita ir direto para o chão, ficando travado na grade.",
                "{attacker} consegue se manter de pé a custo de bastante esforço físico.",
                "{attacker} equilibra na perna de apoio e defende a queda na raça após alguns segundos de incerteza."
            ],
        },
        MISS: {
            emoji: '❌',
            title: 'DEFESA FALHOU',
            color: 0xe74c3c,
            texts: [
                "{attacker} tenta fazer o sprawl atrasado e acaba caindo de costas no solo!",
                "{attacker} perde a base e é derrubado facilmente pelo oponente.",
                "{attacker} hesita no tempo de reação e é levado ao chão sem conseguir espalhar o peso."
            ],
        }
    },

    async execute(message, level) {
        const attacker = message.author;
        if (!validateUserRole(message.member, this.attribute, level)) {
            return message.reply(`❌ Você precisa do cargo de **${this.attribute.toUpperCase()} Nível ${level}**.`);
        }

        const fight = FightManager.getFight(message.channel.id);
        let effectiveLevel = level;

        if (fight) {
            const attObj = fight.fighters.find(f => f.id === attacker.id);
            if (attObj && (attObj.stamina < 35 || attObj.hasWeightPenalty)) {
                effectiveLevel = Math.max(1, level - 1);
            }
        }

        const tier = processRoll(effectiveLevel);
        const outcomeData = this.outcomes[tier];

        const embed = buildAttackEmbed({
            attacker,
            moveName: 'Defesa de Queda',
            level,
            effectiveLevel,
            outcomeData
        });

        return message.reply({ embeds: [embed] });
    }
};