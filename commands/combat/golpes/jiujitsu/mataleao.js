const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'mataleao',
    attribute: 'jiujitsu',
    staminaCost: 3,
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'MATA-LEÃO JUSTO! APAGOU / TAPOUT!',
            color: 0x9b59b6,
            texts: [
                "{attacker} pega as costas, ajusta os ganchos e passa o braço por baixo do queixo! O oponente bate três vezes desesperadamente!",
                "{attacker} encaixa o Mata-Leão com pressão total nas carótidas! Sem espaço para respirar, o adversário apaga no solo!",
                "{attacker} esconde a mão atrás da nuca do rival e fecha o estrangulamento de costas definitivo!",
                "{attacker} grampeia as costas com triângulo de corpo e arrocha o Mata-Leão até o desmaio do adversário!"
            ],
        },
        STAR2: {
            emoji: '🌟',
            title: 'ENCAIXE PERIGOSO DE COSTAS',
            color: 0xf1c40f,
            texts: [
                "{attacker} grampeia as costas do oponente e fecha o cinto de segurança, pressionando o pescoço!",
                "{attacker} passa o braço em volta do pescoço e força o adversário a gastar energia na defesa de mão.",
                "{attacker} estabiliza os dois ganchos por trás e busca o queixo do rival com perigo.",
                "{attacker} arrocha a pressão no pescoço por trás, deixando o oponente em estado de alerta máximo!"
            ],
        },
        STAR: {
            emoji: '⭐',
            title: 'DOMÍNIO DE COSTAS PARCIAL',
            color: 0x2ecc71,
            texts: [
                "{attacker} ganha as costas, mas o oponente segura o pulso para evitar o estrangulamento.",
                "{attacker} coloca um dos ganchos e busca a brecha no pescoço do adversário.",
                "{attacker} controla a posição de costas, mas o adversário bloqueia a entrada do braço no queixo."
            ],
        },
        MISS: {
            emoji: '❌',
            title: 'DEFESA DE COSTAS / ESCAPADA',
            color: 0xe74c3c,
            texts: [
                "{attacker} tenta passar o braço no pescoço, mas o oponente escorrega o quadril e gira para dentro da guarda!",
                "{attacker} perde os ganchos e o adversário consegue colocar as costas no chão para se safar.",
                "{attacker} escorrega na tentativa de domínio de costas e cede a posição por cima ao adversário."
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

        const hitResult = FightManager.registerHit(message.channel, attacker, 'Mata-Leão', level, null, false, 'BJJ', this.staminaCost);
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

        if (hitResult) {
            await FightManager.sendHitResult(message.channel, hitResult);

            if (hitResult.pendingFinish) {
                await FightManager.executeFinish(message.channel, hitResult.fight, hitResult.pendingFinish);
            }
        }
    }
};