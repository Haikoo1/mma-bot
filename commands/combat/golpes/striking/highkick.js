const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'highkick',
    attribute: 'striking',
    staminaCost: 5,
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'HIGHKICK NA CABEÇA (HEADKICK KO)',
            color: 0x9b59b6,
            texts: [
                "{attacker} chuta alto com flexibilidade impressionante e acerta a canela no pescoço do oponente! Queda fulminante!",
                "{attacker} esconde o chute atrás de um jab e explode um Highkick no rosto do adversário!",
                "{attacker} acerta um chute alto perfeito na têmpora, desconectando o oponente no ar!",
                "{attacker} projeta a perna com rotação total e encaixa a canela no queixo do adversário!"
            ],
        },
        STAR2: {
            emoji: '🌟',
            title: 'HIGHKICK POTENTE',
            color: 0xf1c40f,
            texts: [
                "{attacker} acerta o pé na têmpora do oponente, que sente o impacto e fica atordoado!",
                "{attacker} solta a perna com velocidade e conecta o chute alto na lateral da cabeça do adversário.",
                "{attacker} estoura a guarda alta com um Highkick forte que faz o oponente cambalear!",
                "{attacker} chuta alto e atinge a orelha do adversário com bastante explosão!"
            ],
        },
        STAR: {
            emoji: '⭐',
            title: 'HIGHKICK BLOQUEADO NA GUARDA',
            color: 0x2ecc71,
            texts: [
                "{attacker} lança o Highkick, mas o oponente ergue o antebraço a tempo para amortecer o choque.",
                "{attacker} chuta alto tocando a guarda do adversário com violência.",
                "{attacker} acerta a perna de raspão na cabeça do oponente sem o peso completo do corpo."
            ],
        },
        MISS: {
            emoji: '❌',
            title: 'HIGHKICK ESQUIVADO',
            color: 0xe74c3c,
            texts: [
                "{attacker} tenta o chute na cabeça, mas o oponente abaixa o tronco e o golpe passa no ar.",
                "{attacker} perde o equilíbrio após o Highkick errar o alvo e recua rapidamente.",
                "{attacker} lança a perna, mas o adversário dá um passo atrás e o golpe acerta o vazio."
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

        const hitResult = FightManager.registerHit(message.channel, attacker, 'Highkick', level, null, true, 'Striking', this.staminaCost);
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