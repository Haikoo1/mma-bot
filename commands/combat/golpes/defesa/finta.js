const { EmbedBuilder } = require('discord.js');
const { FightManager } = require('../../../../utils/fightManager');

module.exports = {
    name: 'finta',
    noLevel: true,
    async execute(message) {
        const fight = FightManager.getFight(message.channel.id);
        if (!fight) return message.reply('❌ Nenhuma luta ativa neste canal.');

        const fintasTexts = [
            `🎭 <@${message.author.id}> finta uma entrada de queda, fazendo o oponente abaixar a guarda em antecipação!`,
            `🎭 <@${message.author.id}> finta um Overhand pesado de direita, obrigando o adversário a encolher os ombros!`,
            `🎭 <@${message.author.id}> dá um passo em falso para a esquerda, confundindo a leitura de distância do oponente!`,
            `🎭 <@${message.author.id}> troca de base rapidamente e finta um chute baixo, medindo a reação do adversário!`,
            `🎭 <@${message.author.id}> ameça um Jab longo com o tronco e induz o adversário a pendular precocemente!`,
            `🎭 <@${message.author.id}> finge um avanço agressivo no centro do octógono, fazendo o oponente recuar defensivamente!`
        ];

        const randomFinta = fintasTexts[Math.floor(Math.random() * fintasTexts.length)];

        const embed = new EmbedBuilder()
            .setAuthor({ name: 'Ação de RP • FINTA / ENGANO', iconURL: message.author.displayAvatarURL() })
            .setColor(0x9b59b6)
            .setDescription(`>>> ${randomFinta}`)
            .setFooter({ text: 'MMA RP • Movimentação Tática' })
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }
};