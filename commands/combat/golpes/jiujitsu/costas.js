const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'costas',
    attribute: 'jiujitsu',
    staminaCost: 4,
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'TOMADA DE COSTAS ABSOLUTA (BACK TAKE & BODY TRIANGLE)',
            color: 0x9b59b6,
            texts: [
                "{attacker} ajusta os dois ganchos nas costas, fecha o triângulo de corpo e estabelece a pegada de cinto de segurança perfeita!",
                "{attacker} pega as costas com maestria e deixa o adversário sem qualquer rota de saída!",
                "{attacker} transita como uma sombra para as costas do oponente, travando a cintura e abrindo o caminho das finalizações!",
                "{attacker} escala o tronco do rival, tranca os ganchos nas virilhas e domina as costas de forma implacável!"
            ],
        },
        STAR2: {
            emoji: '🌟',
            title: 'DOMÍNIO DE COSTAS',
            color: 0xf1c40f,
            texts: [
                "{attacker} transita para o dorso do oponente e coloca os ganchos.",
                "{attacker} moita nas costas do adversário e abre caminho para finalizações.",
                "{attacker} engata a pegada de cinto de segurança (Seatbelt) e trava o tronco por trás.",
                "{attacker} consolida o domínio de costas mantendo o oponente sob constante ameaça."
            ],
        },
        STAR: {
            emoji: '⭐',
            title: 'PEGADA DE COSTAS PARCIAL',
            color: 0x2ecc71,
            texts: [
                "{attacker} encaixa apenas um gancho nas costas enquanto o oponente tenta girar.",
                "{attacker} mantém o cinto de segurança no tronco com o oponente de lado.",
                "{attacker} alcança o dorso do oponente, mas não consegue fixar os dois ganchos firmemente."
            ],
        },
        MISS: {
            emoji: '❌',
            title: 'FALHA AO PEGAR AS COSTAS',
            color: 0xe74c3c,
            texts: [
                "{attacker} tenta moitar nas costas, mas escorrega pela frente do oponente!",
                "{attacker} perde a posição e fica preso por baixo.",
                "{attacker} projeta-se para a tomada de costas, mas o rival gira o quadril a tempo e frustra o domínio."
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

        const hitResult = FightManager.registerHit(message.channel, attacker, 'Pegada de Costas', level, null, false, 'BJJ', this.staminaCost);
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


    }
};