const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'mataleao',
    attribute: 'jiujitsu',
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'MATA-LEÃO JUSTO! APAGOU / TAPOUT!',
            color: 0x9b59b6,
            texts: [
                "{attacker} pega as costas, ajusta os ganchos e passa o braço por baixo do queixo! O oponente bate três vezes desesperadamente!",
                "{attacker} encaixa o Mata-Leão com pressão total nas carótidas! Sem espaço para respirar, o adversário apaga no solo!"
            ],
            gifs: ["https://media.giphy.com/media/3o7TKrEzvLbsVAud8I/giphy.gif"]
        },
        STAR2: {
            emoji: '🌟',
            title: 'ENCAIXE PERIGOSO DE COSTAS',
            color: 0xf1c40f,
            texts: [
                "{attacker} grampeia as costas do oponente e fecha o cinto de segurança, pressionando o pescoço!",
                "{attacker} passa o braço em volta do pescoço e força o adversário a gastar energia na defesa de mão."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        STAR: {
            emoji: '⭐',
            title: 'DOMÍNIO DE COSTAS PARCIAL',
            color: 0x2ecc71,
            texts: [
                "{attacker} ganha as costas, mas o oponente segura o pulso para evitar o estrangulamento.",
                "{attacker} coloca um dos ganchos e busca a brecha no pescoço do adversário."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        MISS: {
            emoji: '❌',
            title: 'DEFESA DE COSTAS / ESCAPADA',
            color: 0xe74c3c,
            texts: [
                "{attacker} tenta passar o braço no pescoço, mas o oponente escorrega o quadril e gira para dentro da guarda!",
                "{attacker} perde os ganchos e o adversário consegue colocar as costas no chão para se safar."
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
            moveName: 'Mata-Leão',
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