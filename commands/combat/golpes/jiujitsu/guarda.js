const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'guarda',
    attribute: 'jiujitsu',
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'GUARDA FECHADA IMPENETRÁVEL (GUARD CONTROL)',
            color: 0x9b59b6,
            texts: [
                "{attacker} fecha a guarda com firmeza, quebra a postura do oponente colando seu peito ao chão e anula todos os seus ataques por cima!",
                "{attacker} estabelece o controle total da guarda, abrindo o leque perfeito para raspagens e finalizações!"
            ],
            gifs: ["https://media.giphy.com/media/3o7TKrEzvLbsVAud8I/giphy.gif"]
        },
        STAR2: {
            emoji: '🌟',
            title: 'GUARDA RETIDA COM SUCESSO',
            color: 0xf1c40f,
            texts: [
                "{attacker} repõe a guarda de pernas flexíveis e impede o avanço do adversário.",
                "{attacker} domina as esgrimas por baixo e controla a distância do Ground and Pound."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        STAR: {
            emoji: '⭐',
            title: 'GUARDA REPOSICIONADA',
            color: 0x2ecc71,
            texts: [
                "{attacker} coloca a meia-guarda e reduz o espaço do oponente.",
                "{attacker} consegue travar o tronco do adversário na guarda aberta."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        MISS: {
            emoji: '❌',
            title: 'GUARDA PASSADA',
            color: 0xe74c3c,
            texts: [
                "{attacker} tenta reter a guarda, mas o oponente esmaga o quadril e passa para o controle lateral!",
                "{attacker} perde o controle de pernas e cede a posição por cima."
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
            moveName: 'Retenção de Guarda',
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