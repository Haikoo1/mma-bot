const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'triangulomao',
    attribute: 'jiujitsu',
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'TRIÂNGULO DE MÃO PERFEITO! TAPOUT / APAGOU!',
            color: 0x9b59b6,
            texts: [
                "{attacker} trava a cabeça e o braço do oponente na lateral, desmonta o quadril e arrocha o Triângulo de Mão até a desistência imediata!",
                "{attacker} encaixa o Kata-gatame com pressão cirúrgica nas carótidas! O adversário não encontra ar e apaga no solo!"
            ],
            gifs: ["https://media.giphy.com/media/3o7TKrEzvLbsVAud8I/giphy.gif"]
        },
        STAR2: {
            emoji: '🌟',
            title: 'TRIÂNGULO DE MÃO ARROCHADO',
            color: 0xf1c40f,
            texts: [
                "{attacker} abraça o pescoço junto com o braço do oponente e começa a andar de lado para fechar a pressão.",
                "{attacker} trave a cabeça e o ombro do adversário no chão, aplicando forte estrangulamento."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        STAR: {
            emoji: '⭐',
            title: 'AJUSTE DE TRIÂNGULO DE MÃO',
            color: 0x2ecc71,
            texts: [
                "{attacker} ganha a pegada de Triângulo de Mão, mas o oponente cola o ombro na orelha para amortecer a pressão.",
                "{attacker} mantém o controle da cabeça e do braço no chão, somando domínio."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        MISS: {
            emoji: '❌',
            title: 'TRIÂNGULO DE MÃO DEFENDIDO',
            color: 0xe74c3c,
            texts: [
                "{attacker} tenta a trava do Triângulo de Mão, mas o oponente responde rápido, empurra o quadril e escorrega a cabeça!",
                "{attacker} perde a pegada do braço travado e cede o espaço por cima."
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
            moveName: 'Triângulo de Mão (Arm Triangle)',
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