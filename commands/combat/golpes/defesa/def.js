const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');

module.exports = {
    name: 'def',
    attribute: 'defesa',
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'DEFENSE IMPENETRÁVEL / ESQUIVA PERFEITA',
            color: 0x2ecc71,
            texts: [
                "{attacker} ergue uma guarda dupla perfeita, absorve toda a pressão sem sofrer danos e encontra brecha para o contra-ataque!",
                "{attacker} realiza pendulos espetaculares no tempo exato, fazendo o golpe do oponente cortar apenas o ar!"
            ],
            gifs: ["https://media.giphy.com/media/26bgQ8O2K8Tsm0JDW/giphy.gif"]
        },
        STAR2: {
            emoji: '🌟',
            title: 'BLOQUEIO EFICIENTE',
            color: 0x3498db,
            texts: [
                "{attacker} fecha os antebraços no centro do rosto e absorve o impacto com total controle de base.",
                "{attacker} recua um passo no tempo exato e frustra a intenção de ataque do oponente."
            ],
            gifs: ["https://media.giphy.com/media/26bgQ8O2K8Tsm0JDW/giphy.gif"]
        },
        STAR: {
            emoji: '⭐',
            title: 'DEFENSE PARCIAL',
            color: 0xf1c40f,
            texts: [
                "{attacker} amortece o impacto com as luvas, mas ainda sente a pressão da investida.",
                "{attacker} esquiva atrasado, evitando o golpe direto mas mantendo-se acuado."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        MISS: {
            emoji: '❌',
            title: 'GUARDA VAZADA',
            color: 0xe74c3c,
            texts: [
                "{attacker} tenta se defender, mas deixa uma brecha aberta no centro da guarda!",
                "{attacker} hesita no movimento de esquiva e fica vulnerável."
            ],
            gifs: ["https://media.giphy.com/media/l3mZr3M8g82aB0x6E/giphy.gif"]
        }
    },

    async execute(message, level) {
        const attacker = message.author;
        if (!validateUserRole(message.member, this.attribute, level)) {
            return message.reply(`❌ Você precisa do cargo de **${this.attribute.toUpperCase()} Nível ${level}**.`);
        }

        const tier = processRoll(level);
        const outcomeData = this.outcomes[tier];

        const embed = buildAttackEmbed({
            attacker,
            moveName: 'Postura Defensiva',
            level,
            effectiveLevel: level,
            outcomeData
        });

        return message.reply({ embeds: [embed] });
    }
};