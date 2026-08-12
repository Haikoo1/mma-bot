const { EmbedBuilder } = require('discord.js');
const { FightManager } = require('../../utils/fightManager');

// Lista de instruções táticas aleatórias do técnico
const cornerTips = [
    "Mantenha a guarda alta! Ele está buscando o seu queixo no contragolpe!",
    "Trabalhe a distância nos golpes retos e não fique parado na frente dele!",
    "Esquiva para fora do raio de ação e entra atacando no vazio!",
    "Economize o gás neste round! Deixa ele gastar energia e trabalha na resposta!",
    "Ele sentiu o último impacto! Acelera o ritmo e busca a combinação!",
    "Cuidado com a afobação! Respira fundo, recupera a base e joga no tempo certo!",
    "Muda o nível do ataque! Varia entre a linha de cintura e a cabeça!",
    "Fica atento à movimentação dele! Não encurrale a si mesmo na grade!"
];

module.exports = {
    name: 'corner',
    async execute(message) {
        const fight = FightManager.getFight(message.channel.id);

        if (!fight) {
            return message.reply('❌ Nenhuma luta ativa neste canal.');
        }

        const fighterObj = fight.fighters.find(f => f.id === message.author.id);
        if (!fighterObj) {
            return message.reply('❌ Você não é um dos lutadores participantes desta luta.');
        }

        // Seleciona uma dica aleatória
        const randomTip = cornerTips[Math.floor(Math.random() * cornerTips.length)];

        const privateEmbed = new EmbedBuilder()
            .setTitle('🗣️ INSTRUÇÃO TÁTICA DO SEU CORNER')
            .setColor(0x3498db)
            .setDescription(`>>> *"${randomTip}"*`)
            .setFooter({ text: 'MMA RP • Dica privada da sua equipe técnica' })
            .setTimestamp();

        try {
            await message.author.send({ embeds: [privateEmbed] });
            return message.reply(`📩 <@${message.author.id}>, **seu corner gritou uma instrução no seu privado (DM)!**`);
        } catch (err) {
            return message.reply({ 
                content: `⚠️ <@${message.author.id}>, suas DMs estão fechadas! Instrução do canto:`, 
                embeds: [privateEmbed] 
            });
        }
    }
};