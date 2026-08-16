const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'joelhada',
    attribute: 'striking',
    staminaCost: 4,
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'JOELHADA VOADORA BRUTAL',
            color: 0x9b59b6,
            texts: [
                "{attacker} salta no ar e explode uma Joelhada Voadora brutal na cabeça do oponente! Apagão imediato!",
                "{attacker} grampeia a nuca no clinch de Muay Thai e crava a joelhada no queixo do adversário!",
                "{attacker} se lança para a frente e acerta um joelho voador devastador no nariz do oponente!",
                "{attacker} projeta o joelho no plexo do adversário enquanto ele entrava no double leg! Queda instantânea!"
            ],
        },
        STAR2: {
            emoji: '🌟',
            title: 'JOELHADA POTENTE NO CORPO/ROSTO',
            color: 0xf1c40f,
            texts: [
                "{attacker} acerta uma joelhada seca nas costelas do oponente durante a aproximação.",
                "{attacker} sobe o joelho em cheio na boca do estômago do adversário.",
                "{attacker} domina a nuca do oponente e aplica joelhadas fortes na linha de cintura!",
                "{attacker} lança a joelhada no queixo do rival, fazendo a cabeça dele chicotear para trás!"
            ],
        },
        STAR: {
            emoji: '⭐',
            title: 'JOELHADA PARCIAL',
            color: 0x2ecc71,
            texts: [
                "{attacker} lança a joelhada no clinch, mas acerta as coxas do oponente.",
                "{attacker} acerta a joelhada de leve na guarda alta do adversário.",
                "{attacker} sobe o joelho, mas atinge apenas o braço de proteção do oponente."
            ],
        },
        MISS: {
            emoji: '❌',
            title: 'JOELHADA BLOQUEADO OU DEFENDIDA',
            color: 0xe74c3c,
            texts: [
                "{attacker} tenta a joelhada voadora, mas o oponente se esquiva e o faz cair no vácuo.",
                "{attacker} sobe o joelho sem força e toma um contra-golpe em seguida.",
                "{attacker} erra a joelhada e o oponente aproveita para cinturar pelas costas."
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

        const hitResult = FightManager.registerHit(message.channel, attacker, 'Joelhada', level, null, true, 'Striking', this.staminaCost);
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

        if (hitResult) {
            await FightManager.sendHitResult(message.channel, hitResult);

            if (hitResult.pendingFinish) {
                await FightManager.executeFinish(message.channel, hitResult.fight, hitResult.pendingFinish);
            }
        }
    }
};