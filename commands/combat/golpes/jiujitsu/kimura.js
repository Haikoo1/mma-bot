const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'kimura',
    attribute: 'jiujitsu',
    staminaCost: 4,
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'KIMURA PERFEITA! TAPOUT!',
            color: 0x9b59b6,
            texts: [
                "{attacker} trava o pulso do oponente no quatro, roda a alavanca de ombro e hiperextende a articulação! Desistência imediata!",
                "{attacker} puxa a Kimura da guarda com pressão avassaladora! O adversário bate três vezes para não quebrar o ombro!",
                "{attacker} torce a alavanca de ombro em um ângulo torcional perfeito, arrancando o tapout fulminante do rival!",
                "{attacker} encaixa a trava de figura quatro firme e força a articulação do ombro até o limite do desistimento!"
            ],
        },
        STAR2: {
            emoji: '🌟',
            title: 'CHAVE DE OMBRO AJUSTADA',
            color: 0xf1c40f,
            texts: [
                "{attacker} isola o braço do oponente na Kimura e força o ombro para trás.",
                "{attacker} ganha a pegada figura quatro e começa a torcer a articulação no solo.",
                "{attacker} traz o braço preso nas costas do oponente, impondo perigo severo à articulação.",
                "{attacker} eleva a pegada no pulso e força o ombro do adversário com firmeza."
            ],
        },
        STAR: {
            emoji: '⭐',
            title: 'PEGADA DE KIMURA PARCIAL',
            color: 0x2ecc71,
            texts: [
                "{attacker} encaixa a pegada no braço, mas o oponente esconde a mão no calção para defender.",
                "{attacker} usa a Kimura para controlar a postura do oponente no chão.",
                "{attacker} busca a rotação do pulso, porém o oponente trava o braço junto ao próprio corpo."
            ],
        },
        MISS: {
            emoji: '❌',
            title: 'KIMURA DEFENDIDA / RASPAGEM',
            color: 0xe74c3c,
            texts: [
                "{attacker} ataca na Kimura, mas o oponente roda por cima e desfaz a alavanca!",
                "{attacker} perde a pegada do pulso e fica em posição desfavorável.",
                "{attacker} força a torção do ombro sem apoio suficiente e acaba invertido no chão."
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

        const hitResult = FightManager.registerHit(message.channel, attacker, 'Kimura', level, null, false, 'BJJ', this.staminaCost);
        if (hitResult && hitResult.isFoul) return;

        const embed = buildAttackEmbed({
            attacker,
            moveName: 'Kimura (Chave de Ombro)',
            level,
            effectiveLevel,
            outcomeData,
            alertMessage: hitResult ? hitResult.alertMessage : null
        });

        await message.reply({ embeds: [embed] });


    }
};