const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'controle',
    attribute: 'wrestling',
    staminaCost: 3,
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'CONTROLE TOTAL DE SOLO (HEAVY TOP CONTROL)',
            color: 0x9b59b6,
            texts: [
                "{attacker} coloca uma pressão sufocante de quadril por cima, imobiliza o oponente e castiga sem dar espaço de fuga!",
                "{attacker} gasta o tempo com um domínio absoluto no chão, deixando o adversário totalmente preso e sem ação!",
                "{attacker} amassa o oponente por cima com o peso do corpo, anulando qualquer tentativa de levantada!",
                "{attacker} estabiliza a posição de forma perfeita, mantendo o oponente pregado no tatame sob pressão implacável!"
            ],
        },
        STAR2: {
            emoji: '🌟',
            title: 'DOMÍNIO FIRME POR CIMA',
            color: 0xf1c40f,
            texts: [
                "{attacker} estabelece a meia-guarda/montada por cima e mantém a cabeça do oponente colada no solo.",
                "{attacker} usa o peso do corpo para travar os quadris do adversário e dominar a posição.",
                "{attacker} pesa por cima, controla a cabeça e os braços do oponente, mantendo a liderança do chão.",
                "{attacker} assegura a posição dominante no solo com boa distribuição de peso."
            ],
        },
        STAR: {
            emoji: '⭐',
            title: 'CONTROLE BÁSICO',
            color: 0x2ecc71,
            texts: [
                "{attacker} segura a postura por cima na guarda, garantindo o tempo de domínio.",
                "{attacker} consegue reter o oponente no chão após ele tentar se levantar.",
                "{attacker} mantém o controle básico por cima, amassando a guarda sem arriscar muito."
            ],
        },
        MISS: {
            emoji: '❌',
            title: 'PERDA DE POSTURA / RASPAGEM',
            color: 0xe74c3c,
            texts: [
                "{attacker} perde a postura por cima e o oponente consegue se levantar rápido!",
                "{attacker} vacila no peso do quadril e permite ao adversário fazer a ponte e escapar da posição.",
                "{attacker} tenta segurar no chão, mas o oponente esgrima o braço e reverte o controle."
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

        const hitResult = FightManager.registerHit(message.channel, attacker, 'Controle de Solo', level, null, false, 'Wrestling', this.staminaCost);
        if (hitResult && hitResult.isFoul) return;

        const embed = buildAttackEmbed({
            attacker,
            moveName: 'Controle de Solo',
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