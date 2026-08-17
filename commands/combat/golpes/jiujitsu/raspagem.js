const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'raspagem',
    attribute: 'jiujitsu',
    staminaCost: 4,
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'RASPAGEM ESPETACULAR (SWEEP PERFEITO)',
            color: 0x9b59b6,
            texts: [
                "{attacker} usa uma alavanca de guarda espetacular, capota o oponente e cai montado por cima com autoridade!",
                "{attacker} executa uma raspagem limpa e veloz, invertendo o combate e assumindo a posição superior!",
                "{attacker} projeta o quadril com precisão milimétrica, tomba o adversário e consolida o domínio no chão!",
                "{attacker} arma o ganchinho perfeito na guarda, raspa o rival com facilidade e assume o topo!"
            ],
        },
        STAR2: {
            emoji: '🌟',
            title: 'RASPAGEM BEM SUCEDIDA',
            color: 0xf1c40f,
            texts: [
                "{attacker} ganha os ganchos da guarda de laço/de la riva e tomba o oponente para o lado.",
                "{attacker} desequilibra a base do adversário e fica por cima no solo.",
                "{attacker} troca as pegadas no calção e consegue a inversão segura de posição.",
                "{attacker} empurra o joelho do rival com o pé e garante a raspagem limpa."
            ],
        },
        STAR: {
            emoji: '⭐',
            title: 'DESEQUILÍBRIO NA GUARDA',
            color: 0x2ecc71,
            texts: [
                "{attacker} balança o oponente na guarda, que precisa apoiar a mão no chão para não ser raspado.",
                "{attacker} força o desequilíbrio e melhora o ângulo da guarda.",
                "{attacker} engata a alavanca de raspagem, mas o oponente abre a base e se segura."
            ],
        },
        MISS: {
            emoji: '❌',
            title: 'RASPAGEM DEFENDIDA',
            color: 0xe74c3c,
            texts: [
                "{attacker} tenta a raspagem, mas o oponente pesa a base e bloqueia a inversão.",
                "{attacker} perde o gancho de perna durante a tentativa de sweep.",
                "{attacker} força o balanço por baixo, mas escorrega a pegada e fica em posição vulnerável."
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

        const hitResult = FightManager.registerHit(message.channel, attacker, 'Raspagem', level, null, false, 'BJJ', this.staminaCost);
        if (hitResult && hitResult.isFoul) return;

        const embed = buildAttackEmbed({
            attacker,
            moveName: 'Raspagem (Inversão da Guarda)',
            level,
            effectiveLevel,
            outcomeData,
            alertMessage: hitResult ? hitResult.alertMessage : null
        });

        await message.reply({ embeds: [embed] });


    }
};