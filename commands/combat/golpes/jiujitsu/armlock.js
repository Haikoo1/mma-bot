const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'armlock',
    attribute: 'jiujitsu',
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'ARMLOCK PERFEITO! TAPOUT!',
            color: 0x9b59b6,
            texts: [
                "{attacker} gira o quadril com maestria, trava a articulação do cotovelo e hiperextende o braço do oponente! Tapout inevitável!",
                "{attacker} puxa o Armlock da guarda com velocidade impressionante! O adversário bate três vezes para não lesionar o braço!",
                "{attacker} isola o braço, coloca o calcanhar na nuca e estica a alavanca de cotovelo até a desistência imediata!",
                "{attacker} aplica uma chave de braço veloz e devastadora, deixando o oponente sem opção além do batimento!"
            ],
            gifs: ["https://media.giphy.com/media/3o7TKrEzvLbsVAud8I/giphy.gif"]
        },
        STAR2: {
            emoji: '🌟',
            title: 'ALAVANCA JUSTA',
            color: 0xf1c40f,
            texts: [
                "{attacker} isola o braço do adversário, estica o corpo e deixa a alavanca no limite da resistência.",
                "{attacker} cruza as pernas sobre o peito do oponente e força a abertura da defesa de braço.",
                "{attacker} eleva o quadril com pressão na articulação do cotovelo, deixando o rival em apuros.",
                "{attacker} estica o braço do oponente com perigo extremo, gerando enorme tensão na articulação."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        STAR: {
            emoji: '⭐',
            title: 'TENTATIVA DE ARMLOCK',
            color: 0x2ecc71,
            texts: [
                "{attacker} ataca o braço, mas o oponente junta as mãos em defesa e trava a extensão.",
                "{attacker} ajusta a Posição de Armlock somando tempo de domínio no chão.",
                "{attacker} roda o quadril para o Armlock, porém o rival consegue fazer a amarração de mãos a tempo."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        MISS: {
            emoji: '❌',
            title: 'ESCAPADA DE ARMLOCK',
            color: 0xe74c3c,
            texts: [
                "{attacker} tenta a alavanca, mas o oponente gira a postura, recolhe o braço e cai por cima!",
                "{attacker} perde o controle do quadril e o adversário escapa da posição sem danos.",
                "{attacker} projeta a perna por cima da cabeça de forma desatenta e cede a passagem para o rival."
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

        const hitResult = FightManager.registerHit(message.channel, attacker, 'Armlock', level, null, false, 'BJJ');
        if (hitResult && hitResult.isFoul) return;

        const embed = buildAttackEmbed({
            attacker,
            moveName: 'Armlock (Chave de Braço)',
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