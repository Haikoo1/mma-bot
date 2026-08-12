const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'jab',
    attribute: 'striking',
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'JAB PERFEITO / COUNTER',
            color: 0x9b59b6,
            texts: [
                "{attacker} entra com um Jab seco no meio da guarda! O oponente estanca imediatamente com o impacto!",
                "{attacker} lança o Jab de encontro, pegando o adversário no contra-pé com extrema precisão!"
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        STAR2: {
            emoji: '🌟',
            title: 'JAB LIMPO',
            color: 0xf1c40f,
            texts: [
                "{attacker} estica o braço e acerta um Jab firme no nariz do oponente, marcando a distância.",
                "{attacker} conecta o Jab de esquerda abrindo espaço na defesa do adversário!"
            ],
            gifs: ["https://media.giphy.com/media/3o7TKrEzvLbsVAud8I/giphy.gif"]
        },
        STAR: {
            emoji: '⭐',
            title: 'JAB PARCIAL',
            color: 0x2ecc71,
            texts: [
                "{attacker} toca o rosto do adversário com um Jab leve para medir o raio de ação.",
                "{attacker} lança o Jab raspando na testa do oponente."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        MISS: {
            emoji: '❌',
            title: 'JAB ESQUIVADO',
            color: 0xe74c3c,
            texts: [
                "{attacker} lança o Jab, mas o oponente pendula por baixo sem sofrer impacto.",
                "{attacker} erra o tempo do Jab e o adversário bloqueia com facilidade."
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