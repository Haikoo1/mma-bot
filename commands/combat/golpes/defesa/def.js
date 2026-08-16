const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'def',
    attribute: 'defesa',
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'DEFESA IMPENETRÁVEL / ESQUIVA PERFEITA',
            color: 0x2ecc71,
            texts: [
                "{attacker} ergue uma guarda dupla perfeita, absorve toda a pressão sem sofrer danos e encontra brecha para o contra-ataque!",
                "{attacker} realiza pendulos espetaculares no tempo exato, fazendo o golpe do oponente cortar apenas o ar!",
                "{attacker} antecipa o ataque do adversário, fecha os braços em carapaça e rebate a investida sem hesitar!",
                "{attacker} lê o movimento ofensivo, bloqueia o impacto no centro da base e mantém o controle total da distância!"
            ],
        },
        STAR2: {
            emoji: '🌟',
            title: 'BLOQUEIO EFICIENTE',
            color: 0x3498db,
            texts: [
                "{attacker} fecha os antebraços no centro do rosto e absorve o impacto com total controle de base.",
                "{attacker} recua um passo no tempo exato e frustra a intenção de ataque do oponente.",
                "{attacker} amortece a pressão nas luvas, mantendo a postura defensiva intacta.",
                "{attacker} ergue o escudo de braço e bloqueia com firmeza a investida adversária."
            ],
        },
        STAR: {
            emoji: '⭐',
            title: 'DEFESA PARCIAL',
            color: 0xf1c40f,
            texts: [
                "{attacker} amortece o impacto com as luvas, mas ainda sente a pressão da investida.",
                "{attacker} esquiva atrasado, evitando o golpe direto mas mantendo-se acuado.",
                "{attacker} absorve parte do ataque na guarda, mas perde o equilíbrio momentaneamente."
            ],
        },
        MISS: {
            emoji: '❌',
            title: 'GUARDA VAZADA',
            color: 0xe74c3c,
            texts: [
                "{attacker} tenta se defender, mas deixa uma brecha aberta no centro da guarda!",
                "{attacker} hesita no movimento de esquiva e fica vulnerável.",
                "{attacker} ergue os braços fora do tempo e deixa a linha de ataque desprotegida."
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
        let alertMessage = null;

        if (fight) {
            const attObj = fight.fighters.find(f => f.id === attacker.id);
            if (attObj && (attObj.stamina < 35 || attObj.hasWeightPenalty)) {
                effectiveLevel = Math.max(1, level - 1);
            }
        }

        const tier = processRoll(effectiveLevel);
        const outcomeData = this.outcomes[tier];

        // ⚡ Ativa a janela de contragolpe caso tire tiragem GEM
        if (fight) {
            const attObj = fight.fighters.find(f => f.id === attacker.id);
            if (attObj && tier === 'GEM') {
                attObj.counterWindow = true;
                alertMessage = `⚡ **CONTRAGOLPE ATIVO:** ${attObj.mention} abriu a brecha perfeita e terá **+1 Nível Efetivo** no próximo ataque!`;
            }
        }

        const embed = buildAttackEmbed({
            attacker,
            moveName: 'Postura Defensiva',
            level,
            effectiveLevel,
            outcomeData,
            alertMessage
        });

        return message.reply({ embeds: [embed] });
    }
};