const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');

module.exports = {
    name: 'esquiva',
    attribute: 'defesa',
    outcomes: {
        GEM: {
            emoji: '💎',
            title: 'ESQUIVA ESPETACULAR / PÊNDULO PERFEITO',
            color: 0x2ecc71,
            texts: [
                "{attacker} pendula com elegância por baixo do golpe, faz a leitura perfeita do ataque e deixa o oponente totalmente exposto no ar!",
                "{attacker} movimenta a cabeça com velocidade absurda, esquiva do golpe por milímetros e fica na posição ideal para o contragolpe!"
            ],
            gifs: ["https://media.giphy.com/media/26bgQ8O2K8Tsm0JDW/giphy.gif"]
        },
        STAR2: {
            emoji: '🌟',
            title: 'ESQUIVA EFICIENTE',
            color: 0x3498db,
            texts: [
                "{attacker} recua o tronco no tempo certo e faz a investida do oponente passar no vácuo.",
                "{attacker} da um passo lateral (sidestep) limpo, saindo do raio de ação do ataque."
            ],
            gifs: ["https://media.giphy.com/media/26bgQ8O2K8Tsm0JDW/giphy.gif"]
        },
        STAR: {
            emoji: '⭐',
            title: 'ESQUIVA PARCIAL',
            color: 0xf1c40f,
            texts: [
                "{attacker} pendula atrasado, mas consegue evitar que o golpe pegue em cheio no queixo.",
                "{attacker} raspa o rosto no golpe ao esquivar, reduzindo o impacto."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        MISS: {
            emoji: '❌',
            title: 'ESQUIVA FALHOU',
            color: 0xe74c3c,
            texts: [
                "{attacker} tenta a esquiva para o lado errado e caminha diretamente na direção do ataque!",
                "{attacker} hesita na movimentação de cabeça e fica vulnerável."
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
            moveName: 'Esquiva / Movimentação de Cabeça',
            level,
            effectiveLevel: level,
            outcomeData
        });

        return message.reply({ embeds: [embed] });
    }
};