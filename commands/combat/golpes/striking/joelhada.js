const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'joelhada',
    attribute: 'striking',
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'JOELHADA VOADORA BRUTAL',
            color: 0x9b59b6,
            texts: [
                "{attacker} salta no ar e explode uma Joelhada Voadora brutal na cabeça do oponente! Apagão imediato!",
                "{attacker} grampeia a nuca no clinch de Muay Thai e crava a joelhada no queixo do adversário!"
            ],
            gifs: ["https://media.giphy.com/media/l3mZr3M8g82aB0x6E/giphy.gif"]
        },
        STAR2: {
            emoji: '🌟',
            title: 'JOELHADA POTENTE NO CORPO/ROSTO',
            color: 0xf1c40f,
            texts: [
                "{attacker} acerta uma joelhada seca nas costelas do oponente durante a aproximação.",
                "{attacker} sobe o joelho em cheio na boca do estômago do adversário."
            ],
            gifs: ["https://media.giphy.com/media/3o7TKrEzvLbsVAud8I/giphy.gif"]
        },
        STAR: {
            emoji: '⭐',
            title: 'JOELHADA PARCIAL',
            color: 0x2ecc71,
            texts: [
                "{attacker} lança a joelhada no clinch, mas acerta as coxas do oponente.",
                "{attacker} acerta a joelhada de leve na guarda alta do adversário."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        MISS: {
            emoji: '❌',
            title: 'JOELHADA BLOQUEADA OU DEFENDIDA',
            color: 0xe74c3c,
            texts: [
                "{attacker} tenta a joelhada voadora, mas o oponente se esquiva e o faz cair no vácuo.",
                "{attacker} sobe o joelho sem força e toma um contra-golpe em seguida."
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
            moveName: 'Joelhada',
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