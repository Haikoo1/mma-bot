const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'cruzado',
    attribute: 'striking',
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'CRUZADO BRUTAL',
            color: 0x9b59b6,
            texts: [
                "{attacker} solta um Cruzado violento no mandíbula do oponente, que perde o equilíbrio na hora!",
                "{attacker} entra com um Cruzado de esquerda espetacular na têmpora do adversário!"
            ],
            gifs: ["https://media.giphy.com/media/l3mZr3M8g82aB0x6E/giphy.gif"]
        },
        STAR2: {
            emoji: '🌟',
            title: 'CRUZADO LIMPO',
            color: 0xf1c40f,
            texts: [
                "{attacker} roda a cintura e acerta um Cruzado pesado na bochecha do oponente!",
                "{attacker} surpreende com um Cruzado curvo que contorna a guarda do adversário."
            ],
            gifs: ["https://media.giphy.com/media/3o7TKrEzvLbsVAud8I/giphy.gif"]
        },
        STAR: {
            emoji: '⭐',
            title: 'CRUZADO PARCIAL',
            color: 0x2ecc71,
            texts: [
                "{attacker} acerta a ponta da luva no rosto do adversário durante a trocação.",
                "{attacker} lança o Cruzado, rasgando o ar e tocando levemente a orelha do oponente."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        MISS: {
            emoji: '❌',
            title: 'CRUZADO NO VAZIO',
            color: 0xe74c3c,
            texts: [
                "{attacker} lança um Cruzado muito aberto e o oponente dá um passo para trás sem perigo.",
                "{attacker} tenta o golpe, mas fica no vácuo e exposto ao contragolpe."
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
            moveName: this.name,
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