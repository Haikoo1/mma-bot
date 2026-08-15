const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'queda',
    attribute: 'wrestling',
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'QUEDA ESPETACULAR (SLAM)',
            color: 0x9b59b6,
            texts: [
                "{attacker} mergulha no tempo perfeito, ergue o oponente no ar e o crava com violência no solo do octógono!",
                "{attacker} encaixa uma queda devastadora, deixando o adversário atordoado ao bater de costas no chão!",
                "{attacker} aplica um suplex/slam brutal, erguendo o rival do solo e enterrando-o com impacto total!",
                "{attacker} pega a cintura do oponente, levanta-o no ar e o projeta no chão de forma espetacular!"
            ],
            gifs: ["https://media.giphy.com/media/3o7TKrEzvLbsVAud8I/giphy.gif"]
        },
        STAR2: {
            emoji: '🌟',
            title: 'TAKEDOWN LIMPO',
            color: 0xf1c40f,
            texts: [
                "{attacker} muda de nível, grampeia a perna e derruba o adversário com autoridade.",
                "{attacker} arrasta o oponente para o chão, caindo em posição de controle por cima!",
                "{attacker} executa um takedown preciso, tirando a base do rival e estabelecendo o chão.",
                "{attacker} aproveita o momento de trocação para mergulhar nos pés do adversário e levá-lo ao solo!"
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        STAR: {
            emoji: '⭐',
            title: 'QUEDA PARCIAL / DESEQUILÍBRIO',
            color: 0x2ecc71,
            texts: [
                "{attacker} desequilibra o oponente e o leva ao solo, mas ele logo busca a guarda.",
                "{attacker} força a entrada de queda e consegue derrubar de forma arrastada.",
                "{attacker} desestabiliza o adversário e garante a queda sem grande impacto."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        MISS: {
            emoji: '❌',
            title: 'QUEDA DEFENDIDA',
            color: 0xe74c3c,
            texts: [
                "{attacker} entra na queda, mas o oponente reage rápido e aplica o sprawl perfeito!",
                "{attacker} perde o tempo de entrada e acaba grampeado na grade sem derrubar.",
                "{attacker} mergulha com pouca explosão e o adversário se afasta com facilidade."
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

        const hitResult = FightManager.registerHit(message.channel, attacker, 'Queda', level, null, false, 'Wrestling');
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