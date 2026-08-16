const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'guilhotina',
    attribute: 'jiujitsu',
    staminaCost: 3,
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'GUILHOTINA FATAL! TAPOUT!',
            color: 0x9b59b6,
            texts: [
                "{attacker} abraça a cabeça na guilhotina, puxa para a guarda e fecha o quadril com extrema pressão! O oponente bate instantaneamente!",
                "{attacker} pega a guilhotina de pé durante a entrada de queda do oponente e o faz desistir antes mesmo de tocar o solo!",
                "{attacker} engata a guilhotina dez dedos com arrocho absoluto! O adversário bate no desespero para não apagar!",
                "{attacker} passa o braço fundo pelo pescoço, fecha a guarda e espreme até o oponente pedir para parar!"
            ],
        },
        STAR2: {
            emoji: '🌟',
            title: 'GUILHOTINA ENCAIXADA',
            color: 0xf1c40f,
            texts: [
                "{attacker} trava o pescoço do adversário na guilhotina e começa a arrochar a pegada no chão.",
                "{attacker} ajusta o braço por baixo da garganta do oponente, criando grande perigo na posição.",
                "{attacker} fecha o cinto de braço na garganta do rival e eleva os cotovelos gerando sufoco.",
                "{attacker} captura a cabeça do adversário e mantém a pressão forte na respiração."
            ],
        },
        STAR: {
            emoji: '⭐',
            title: 'PRESSÃO NO PESCOÇO',
            color: 0x2ecc71,
            texts: [
                "{attacker} encaixa a pegada no pescoço, mas o oponente consegue apoiar a mão para aliviar a respiração.",
                "{attacker} tenta arrochar a guilhotina sem fechar a guarda por completo.",
                "{attacker} envolve a cabeça do adversário, porém ele coloca a mão no quadril para aliviar o aperto."
            ],
        },
        MISS: {
            emoji: '❌',
            title: 'CABEÇA FORA / PASSAGEM DE GUARDA',
            color: 0xe74c3c,
            texts: [
                "{attacker} tenta a guilhotina, mas o oponente tira a cabeça e cai passado no lado oposto!",
                "{attacker} perde a pegada no pescoço e fica por baixo no solo.",
                "{attacker} afoba-se no bote da guilhotina, escorrega a mão e acaba aceitando a pressão por baixo."
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

        const hitResult = FightManager.registerHit(message.channel, attacker, 'Guilhotina', level, null, false, 'BJJ', this.staminaCost);
        if (hitResult && hitResult.isFoul) return;

        const embed = buildAttackEmbed({
            attacker,
            moveName: 'Guilhotina',
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