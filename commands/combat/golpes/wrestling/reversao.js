const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'reversao',
    attribute: 'wrestling',
    staminaCost: 4,
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'REVERSÃO PERFEITA (WRESTLING REVERSAL)',
            color: 0x9b59b6,
            texts: [
                "{attacker} estava por baixo, mas usa uma alavanca de quadril espetacular, capota o oponente e assume o topo com força!",
                "{attacker} executa uma inversão espetacular no chão, tirando o peso do oponente e o prensando de costas no solo!",
                "{attacker} encaixa a ponte perfeita, gira por cima do tronco do adversário e cai em posição dominante de controle!",
                "{attacker} usa a alavanca dos braços no momento exato e reverte o jogo completamente no chão!"
            ],
            gifs: ["https://media.giphy.com/media/3o7TKrEzvLbsVAud8I/giphy.gif"]
        },
        STAR2: {
            emoji: '🌟',
            title: 'INVERSÃO LIMPA',
            color: 0xf1c40f,
            texts: [
                "{attacker} gira a base por baixo, desequilibra o oponente e consegue ficar por cima.",
                "{attacker} trava o braço do adversário e usa a ponte para inverter a posição no chão.",
                "{attacker} faz a alavanca de quadril e consegue raspar/inverter, assumindo a posição superior.",
                "{attacker} aproveita o desequilíbrio do rival para rolar por cima e tomar o controle da luta."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        STAR: {
            emoji: '⭐',
            title: 'INVERSÃO PARCIAL / ESPAÇO CRIADO',
            color: 0x2ecc71,
            texts: [
                "{attacker} força a reversão e consegue tirar o oponente de cima, mas ambos voltam para a base em pé.",
                "{attacker} desestabiliza o peso do adversário e melhora sua posição defensiva.",
                "{attacker} tenta inverter e ganha algum espaço no solo, neutralizando o ataque do rival."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        MISS: {
            emoji: '❌',
            title: 'REVERSÃO DEFENDIDA',
            color: 0xe74c3c,
            texts: [
                "{attacker} tenta fazer a ponte para inverter, mas o oponente pesa o quadril e se mantém por cima.",
                "{attacker} gasta energia tentando a reversão e continua preso por baixo.",
                "{attacker} tenta capotar o adversário, mas se expõe e fica em posição ainda mais desconfortável."
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

        const hitResult = FightManager.registerHit(message.channel, attacker, 'Reversão', level, null, false, 'Wrestling', this.staminaCost);
        if (hitResult && hitResult.isFoul) return;

        const embed = buildAttackEmbed({
            attacker,
            moveName: 'Reversão (Inversão de Posição)',
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