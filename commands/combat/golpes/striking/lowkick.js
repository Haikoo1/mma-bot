const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'lowkick',
    attribute: 'striking',
    staminaCost: 3,
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'LOWKICK DEVASTADOR NA COXA',
            color: 0x9b59b6,
            texts: [
                "{attacker} desfere um Lowkick estalando na coxa do adversário! O oponente quase cai e passa a mancar na hora!",
                "{attacker} acerta a canela na panturrilha do oponente com tanta força que ele perde a base do pé!",
                "{attacker} aplica um Lowkick brutal no nervo fibular! A perna do adversário adormece e dobra!",
                "{attacker} vira o quadril com violência e estoura a coxa do oponente, que urra com a dor do impacto!"
            ],
            gifs: ["https://media.giphy.com/media/3o7TKrEzvLbsVAud8I/giphy.gif"]
        },
        STAR2: {
            emoji: '🌟',
            title: 'LOWKICK FIRME',
            color: 0xf1c40f,
            texts: [
                "{attacker} gira a perna e acerta um Lowkick seco na coxa do oponente!",
                "{attacker} castiga a perna de apoio do adversário com um chute baixo de muita precisão!",
                "{attacker} conecta um Lowkick firme na panturrilha, desequilibrando o rival momentaneamente.",
                "{attacker} acerta a canela na parte interna da coxa do adversário com ótima velocidade!"
            ],
            gifs: ["https://media.giphy.com/media/3o7TKrEzvLbsVAud8I/giphy.gif"]
        },
        STAR: {
            emoji: '⭐',
            title: 'LOWKICK PARCIAL',
            color: 0x2ecc71,
            texts: [
                "{attacker} chuta baixo e raspa no joelho do oponente.",
                "{attacker} toca a coxa do adversário sem pegar com o osso da canela cheio.",
                "{attacker} acerta a ponta do pé na perna do adversário com baixo impacto."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        MISS: {
            emoji: '❌',
            title: 'LOWKICK CHECADO (CHECK)',
            color: 0xe74c3c,
            texts: [
                "{attacker} lança o Lowkick, mas o oponente ergue o joelho e faz o check (bloqueio de canela)!",
                "{attacker} erra a distância do chute e o adversário recolhe a perna a tempo.",
                "{attacker} tenta o Lowkick, mas o oponente esquiva o passo para trás e o chute corta apenas o ar."
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

        const hitResult = FightManager.registerHit(message.channel, attacker, 'Lowkick', level, null, true, 'Striking', this.staminaCost);
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

        if (hitResult) {
            await FightManager.sendHitResult(message.channel, hitResult);

            if (hitResult.pendingFinish) {
                await FightManager.executeFinish(message.channel, hitResult.fight, hitResult.pendingFinish);
            }
        }
    }
};