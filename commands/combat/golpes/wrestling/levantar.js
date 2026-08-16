const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'levantar',
    attribute: 'wrestling',
    staminaCost: 3,
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'LEVANTE EXPLOSIVO (STAND UP PERFEITO)',
            color: 0x9b59b6,
            texts: [
                "{attacker} explode as pernas no chão, tira o peso do oponente, se levanta instantaneamente e sepulta a luta no chão!",
                "{attacker} escala a grade com postura impecável, empurra o oponente e volta a lutar de pé totalmente livre!",
                "{attacker} dá um estouro de quadril poderoso, estica os braços e fica de pé limpando qualquer pegada do rival!",
                "{attacker} usa a explosão muscular para escapar do chão num piscar de olhos e recupera o centro do octógono!"
            ],
        },
        STAR2: {
            emoji: '🌟',
            title: 'LEVANTE LIMPO',
            color: 0xf1c40f,
            texts: [
                "{attacker} ganha a esgrima por baixo, apoia as mãos no solo e consegue se colocar de pé.",
                "{attacker} usa a grade como apoio, empurra o adversário e recupera a postura ereta.",
                "{attacker} trabalha bem a base de quatro apoios e se levanta se desvencilhando do oponente.",
                "{attacker} força a subida com a ajuda do braço de apoio e rompe a pegada do adversário!"
            ],
        },
        STAR: {
            emoji: '⭐',
            title: 'LEVANTE COM DIFICULDADE',
            color: 0x2ecc71,
            texts: [
                "{attacker} fica de joelhos e tenta subir, mas o oponente ainda mantém o grampo na cintura.",
                "{attacker} consegue ficar de pé, porém continua prensado de costas na grade.",
                "{attacker} se levanta com bastante desgaste, ainda preso nas garras do oponente."
            ],
        },
        MISS: {
            emoji: '❌',
            title: 'FALHA AO LEVANTAR-SE',
            color: 0xe74c3c,
            texts: [
                "{attacker} tenta se levantar, mas o oponente puxa suas pernas e o derruba de volta no solo.",
                "{attacker} abre brecha ao tentar subir e continua sob domínio por baixo.",
                "{attacker} força a subida sem postura e é amassado de volta contra o chão."
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

        const hitResult = FightManager.registerHit(message.channel, attacker, 'Levantar', level, null, false, 'Wrestling', this.staminaCost);
        if (hitResult && hitResult.isFoul) return;

        const embed = buildAttackEmbed({
            attacker,
            moveName: 'Levantar (Escapada de Pé)',
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