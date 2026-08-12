const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'costas',
    attribute: 'jiujitsu',
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'TOMADA DE COSTAS ABSOLUTA (BACK TAKE & BODY TRIANGLE)',
            color: 0x9b59b6,
            texts: [
                "{attacker} ajusta os dois ganchos nas costas, fecha o triângulo de corpo e estabelece a pegada de cinto de segurança perfeita!",
                "{attacker} pega as costas com maestria e deixa o adversário sem qualquer rota de saída!"
            ],
            gifs: ["https://media.giphy.com/media/3o7TKrEzvLbsVAud8I/giphy.gif"]
        },
        STAR2: {
            emoji: '🌟',
            title: 'DOMÍNIO DE COSTAS',
            color: 0xf1c40f,
            texts: [
                "{attacker} transita para o dorso do oponente e coloca os ganchos.",
                "{attacker} moita nas costas do adversário e abre caminho para finalizações."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        STAR: {
            emoji: '⭐',
            title: 'PEGADA DE COSTAS PARCIAL',
            color: 0x2ecc71,
            texts: [
                "{attacker} encaixa apenas um gancho nas costas enquanto o oponente tenta girar.",
                "{attacker} mantêm o cinto de segurança no tronco com o oponente de lado."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        MISS: {
            emoji: '❌',
            title: 'FALHA AO PEGAR AS COSTAS',
            color: 0xe74c3c,
            texts: [
                "{attacker} tenta moitar nas costas, mas escorrega pela frente do oponente!",
                "{attacker} perde a posição e fica preso por baixo."
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
            moveName: 'Pegada de Costas',
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