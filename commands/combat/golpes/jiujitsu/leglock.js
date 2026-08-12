const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'leglock',
    attribute: 'jiujitsu',
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'LEGLOCK / HEEL HOOK DEVASTADOR! TAPOUT!',
            color: 0x9b59b6,
            texts: [
                "{attacker} entra na chave de calcanhar/joelho, torce a articulação inferior e faz o oponente gritar de dor batendo três vezes!",
                "{attacker} encaixa um Leglock brutal no tornozelo! O adversário dá o tapout imediato para evitar lesão grave!"
            ],
            gifs: ["https://media.giphy.com/media/3o7TKrEzvLbsVAud8I/giphy.gif"]
        },
        STAR2: {
            emoji: '🌟',
            title: 'CHAVE DE PERNA JUSTA',
            color: 0xf1c40f,
            texts: [
                "{attacker} domina a perna do oponente, cruza os pés no quadril e começa a esticar a articulação.",
                "{attacker} ataca a chave de pé reta com forte pressão de alavanca."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        STAR: {
            emoji: '⭐',
            title: 'ENTRADA NA PERNA',
            color: 0x2ecc71,
            texts: [
                "{attacker} busca o domínio da perna por baixo, mantendo o oponente sob constante ameaça.",
                "{attacker} engancha o tornozelo do adversário para desequilibrá-lo."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        MISS: {
            emoji: '❌',
            title: 'DEFESA DE LEGLOCK',
            color: 0xe74c3c,
            texts: [
                "{attacker} ataca a perna, mas o oponente escorrega o calcanhar e toma o controle por cima!",
                "{attacker} perde a trava de joelho e fica vulnerável ao Ground and Pound."
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
            moveName: 'Leglock (Chave de Perna/Pé)',
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