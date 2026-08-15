const { validateUserRole, processRoll, buildAttackEmbed } = require('../../../../utils/combatEngine');
const { FightManager } = require('../../../../utils/fightManager');

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
                "{attacker} movimenta a cabeça com velocidade absurda, esquiva do golpe por milímetros e fica na posição ideal para o contragolpe!",
                "{attacker} executa um desvio lateral milimétrico, deixando a investida do rival passar no vácuo com domínio total!",
                "{attacker} flexiona os joelhos e pendula no momento exato, saindo limpo do raio de ação ofensivo!"
            ],
            gifs: ["https://media.giphy.com/media/26bgQ8O2K8Tsm0JDW/giphy.gif"]
        },
        STAR2: {
            emoji: '🌟',
            title: 'ESQUIVA EFICIENTE',
            color: 0x3498db,
            texts: [
                "{attacker} recua o tronco no tempo certo e faz a investida do oponente passar no vácuo.",
                "{attacker} dá um passo lateral (sidestep) limpo, saindo do raio de ação do ataque.",
                "{attacker} inclina a cabeça para o lado certo e evita a linha direta do golpe.",
                "{attacker} faz a leitura do ataque e esquiva com leveza sem perder a base."
            ],
            gifs: ["https://media.giphy.com/media/26bgQ8O2K8Tsm0JDW/giphy.gif"]
        },
        STAR: {
            emoji: '⭐',
            title: 'ESQUIVA PARCIAL',
            color: 0xf1c40f,
            texts: [
                "{attacker} pendula atrasado, mas consegue evitar que o golpe pegue em cheio no queixo.",
                "{attacker} raspa o rosto no golpe ao esquivar, reduzindo o impacto.",
                "{attacker} tenta a esquiva lateral, mas o ataque ainda resvala levemente em seu ombro."
            ],
            gifs: ["https://media.giphy.com/media/xT1XGzg8xM0pM8v3I4/giphy.gif"]
        },
        MISS: {
            emoji: '❌',
            title: 'ESQUIVA FALHOU',
            color: 0xe74c3c,
            texts: [
                "{attacker} tenta a esquiva para o lado errado e caminha diretamente na direção do ataque!",
                "{attacker} hesita na movimentação de cabeça e fica vulnerável.",
                "{attacker} perde o tempo do movimento e é surpreendido em plena trajetória de esquiva."
            ],
            gifs: ["https://media.giphy.com/media/l3mZr3M8g82aB0x6E/giphy.gif"]
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
                alertMessage = `⚡ **CONTRAGOLPE ATIVO:** ${attObj.mention} encaixou uma esquiva perfeita e terá **+1 Nível Efetivo** no próximo ataque!`;
            }
        }

        const embed = buildAttackEmbed({
            attacker,
            moveName: 'Esquiva / Movimentação de Cabeça',
            level,
            effectiveLevel,
            outcomeData,
            alertMessage
        });

        return message.reply({ embeds: [embed] });
    }
};