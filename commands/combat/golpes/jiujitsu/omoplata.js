const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'omoplata',
    attribute: 'jiujitsu',
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'OMOPLATA PERFEITA! TAPOUT!',
            color: 0x9b59b6,
            texts: [
                "{attacker} enfia a perna sobre o ombro do oponente, senta para frente e torce a articulação até o tapout inevitável!",
                "{attacker} trava o braço nas pernas em uma Omoplata fulminante! O adversário desiste de dor!"
            ],
            gifs: ["https://media.giphy.com/media/3o7TKrEzvLbsVAud8I/giphy.gif"]
        },
        STAR2: {
            emoji: '🌟',
            title: 'OMOPLATA ENCAIXADA',
            color: 0xf1c40f,
            texts: [
                "{attacker} passa a perna sobre o braço, isola o ombro e projeta o quadril para frente.",
                "{attacker} coloca o oponente de barriga no chão sob forte pressão de Omoplata."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        STAR: {
            emoji: '⭐',
            title: 'TRANSIÇÃO DE OMOPLATA',
            color: 0x2ecc71,
            texts: [
                "{attacker} tenta a Omoplata e usa o movimento para raspar e ir para cima.",
                "{attacker} engancha o ombro do adversário, gerando perigo na posição."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        MISS: {
            emoji: '❌',
            title: 'OMOPLATA CAPOTADA / ESCAPADA',
            color: 0xe74c3c,
            texts: [
                "{attacker} tenta o bote na Omoplata, mas o oponente dá um rolamento por cima e se safa!",
                "{attacker} perde o controle do quadril e cede a passagem de guarda."
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

        const hitResult = FightManager.registerHit(message.channel, attacker, tier, level, false, 'BJJ');
        if (hitResult && hitResult.isFoul) return;

        const embed = buildAttackEmbed({
            attacker,
            moveName: 'Omoplata',
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