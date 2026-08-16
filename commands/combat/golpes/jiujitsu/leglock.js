const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'leglock',
    attribute: 'jiujitsu',
    staminaCost: 4,
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'LEGLOCK / HEEL HOOK DEVASTADOR! TAPOUT!',
            color: 0x9b59b6,
            texts: [
                "{attacker} entra na chave de calcanhar/joelho, torce a articulação inferior e faz o oponente gritar de dor batendo três vezes!",
                "{attacker} encaixa um Leglock brutal no tornozelo! O adversário dá o tapout imediato para evitar lesão grave!",
                "{attacker} isola o calcanhar com a chave de calcanhar (Heel Hook) ajustada, hiperextendendo os ligamentos até a desistência!",
                "{attacker} trava a botinha de reta de pé com pressão cirúrgica e força o batimento instantâneo!"
            ],
        },
        STAR2: {
            emoji: '🌟',
            title: 'CHAVE DE PERNA JUSTA',
            color: 0xf1c40f,
            texts: [
                "{attacker} domina a perna do oponente, cruza os pés no quadril e começa a esticar a articulação.",
                "{attacker} ataca a chave de pé reta com forte pressão de alavanca.",
                "{attacker} captura o tornozelo do rival e aplica força contínua no peito do pé.",
                "{attacker} encaixa o emaranhado de pernas no Knee Bar e gera enorme tensão no joelho do oponente."
            ],
        },
        STAR: {
            emoji: '⭐',
            title: 'ENTRADA NA PERNA',
            color: 0x2ecc71,
            texts: [
                "{attacker} busca o domínio da perna por baixo, mantendo o oponente sob constante ameaça.",
                "{attacker} engancha o tornozelo do adversário para desequilibrá-lo.",
                "{attacker} tenta ajustar a pegada no calcanhar, mas o rival defende escondendo o pé."
            ],
        },
        MISS: {
            emoji: '❌',
            title: 'DEFESA DE LEGLOCK',
            color: 0xe74c3c,
            texts: [
                "{attacker} ataca a perna, mas o oponente escorrega o calcanhar e toma o controle por cima!",
                "{attacker} perde a trava de joelho e fica vulnerável ao Ground and Pound.",
                "{attacker} afoba-se na busca do pé e cede a passagem de guarda sem oferecer perigo real."
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

        const tier = processRoll(effectiveLevel, attacker.id);
        const outcomeData = this.outcomes[tier];

        const hitResult = FightManager.registerHit(message.channel, attacker, 'Leglock', level, null, false, 'BJJ', this.staminaCost);
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

        if (hitResult) {
            await FightManager.sendHitResult(message.channel, hitResult);

            if (hitResult.pendingFinish) {
                await FightManager.executeFinish(message.channel, hitResult.fight, hitResult.pendingFinish);
            }
        }
    }
};