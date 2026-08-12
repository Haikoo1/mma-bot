const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'spinningback',
    attribute: 'striking',
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'GOLPE RODADO ESPETACULAR (SPINNING KO)',
            color: 0x9b59b6,
            texts: [
                "{attacker} gira o corpo 360° e acerta um Spinning Back Kick/Fist devastador na cabeça do oponente! Nocaute de filme!",
                "{attacker} surpreende com um salto e golpe rodado direto na têmpora do adversário!"
            ],
            gifs: ["https://media.giphy.com/media/l3mZr3M8g82aB0x6E/giphy.gif"]
        },
        STAR2: {
            emoji: '🌟',
            title: 'GOLPE RODADO POTENTE',
            color: 0xf1c40f,
            texts: [
                "{attacker} roda o corpo rapidamente e acerta o calcanhar/punho no tronco do oponente.",
                "{attacker} pega o oponente desprevenido com uma giratória pesada na linha de cintura."
            ],
            gifs: ["https://media.giphy.com/media/3o7TKrEzvLbsVAud8I/giphy.gif"]
        },
        STAR: {
            emoji: '⭐',
            title: 'GOLPE RODADO PARCIAL',
            color: 0x2ecc71,
            texts: [
                "{attacker} completa o giro e acerta o golpe de leve na guarda do adversário.",
                "{attacker} lança o golpe rodado, mas perde um pouco de força no momento do impacto."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        MISS: {
            emoji: '❌',
            title: 'GOLPE RODADO FALHOU',
            color: 0xe74c3c,
            texts: [
                "{attacker} tenta o golpe rodado, erra completamente o alvo e fica de costas para o oponente!",
                "{attacker} gira em falso e perde o equilíbrio no solo."
            ],
            gifs: ["https://media.giphy.com/media/26bgQ8O2K8Tsm0JDW/giphy.gif"]
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

        const hitResult = FightManager.registerHit(message.channel, attacker, tier, level, true, 'Striking');
        if (hitResult && hitResult.isFoul) return;

        const embed = buildAttackEmbed({
            attacker,
            moveName: 'Spinning Back (Golpe Rodado)',
            level,
            effectiveLevel,
            outcomeData,
            alertMessage: hitResult ? hitResult.alertMessage : null
        });

        await message.reply({ embeds: [embed] });

        if (hitResult && hitResult.pendingFinish) {
            FightManager.executeFinish(message.channel, hitResult.fight, hitResult.pendingFinish);
        }
    }
};