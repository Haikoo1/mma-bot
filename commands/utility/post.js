const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { generateSocialComments } = require('../../utils/socialEngine');

module.exports = {
    name: 'post',
    description: 'Publica uma atualização na rede social oficial do RP',
    async execute(message, args) {
        let handle = message.author.username.toLowerCase().replace(/\s+/g, '_');
        let content = args.join(' ');
        const attachment = message.attachments.first()?.url || null;

        // Se a primeira palavra começar com '@', extrai ela como o arroba do perfil
        if (args.length > 0 && args[0].startsWith('@')) {
            handle = args[0].slice(1).toLowerCase().replace(/[^a-z0-9_]/g, '');
            content = args.slice(1).join(' ');
        }

        if (!content && !attachment) {
            return message.reply('❌ Escreva um texto ou anexe uma foto/vídeo para publicar.\n\n💡 **Exemplo de uso:** `-post @josealdo_rp Treino pago hoje!` ou `-post Treino pago!`');
        }

        // Identificação por Cargo Oficial de Popularidade
        const roles = message.member.roles.cache;
        let popLevel = 1;
        let popBadge = '👤 Sem Popularidade';

        if (roles.some(r => r.name.includes('G.O.A.T'))) {
            popLevel = 4;
            popBadge = '🐐 G.O.A.T';
        } else if (roles.some(r => r.name.includes('Superstar'))) {
            popLevel = 3;
            popBadge = '🌟 Superstar';
        } else if (roles.some(r => r.name.includes('Prospecto'))) {
            popLevel = 2;
            popBadge = '⭐ Prospecto';
        }

        // Cálculo de Engajamento e Métricas
        let likes = 0, retweets = 0, commentsCount = 0;

        switch (popLevel) {
            case 4: // G.O.A.T
                likes = Math.floor(Math.random() * 250000) + 50000;
                retweets = Math.floor(likes * 0.18);
                commentsCount = Math.floor(likes * 0.05);
                break;
            case 3: // Superstar
                likes = Math.floor(Math.random() * 35000) + 5000;
                retweets = Math.floor(likes * 0.12);
                commentsCount = Math.floor(likes * 0.04);
                break;
            case 2: // Prospecto
                likes = Math.floor(Math.random() * 1800) + 200;
                retweets = Math.floor(likes * 0.08);
                commentsCount = Math.floor(likes * 0.03);
                break;
            default: // Sem Popularidade
                likes = Math.floor(Math.random() * 85) + 5;
                retweets = Math.floor(Math.random() * 8);
                commentsCount = Math.floor(Math.random() * 5) + 1;
                break;
        }

        // Formatação de Números
        const formatNum = num => num >= 1000 ? (num / 1000).toFixed(1) + 'K' : num.toString();

        // Gera comentários contextualizados
        const comments = await generateSocialComments({
            author: handle,
            postText: content || 'imagem',
            popLevel,
            popBadge
        });

        const embed = new EmbedBuilder()
            .setAuthor({ 
                name: `📱 MMA-X • @${handle}`, 
                iconURL: message.author.displayAvatarURL() 
            })
            .setColor(popLevel === 4 ? 0xf1c40f : popLevel === 3 ? 0x9b59b6 : 0x1da1f2)
            .setDescription(content || '*(Mídia anexada)*')
            .addFields(
                { 
                    name: '📊 Métricas da Publicação', 
                    value: `💬 \`${formatNum(commentsCount)}\`  •  🔁 \`${formatNum(retweets)}\`  •  ❤️ \`${formatNum(likes)}\``, 
                    inline: false 
                },
                { 
                    name: '💬 Principais Reações', 
                    value: comments.join('\n'), 
                    inline: false 
                }
            )
            .setFooter({ text: `Status do Perfil: ${popBadge} • MMA-X Mobile` })
            .setTimestamp();

        if (attachment) embed.setImage(attachment);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('like').setLabel(`❤️ ${formatNum(likes)}`).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('repost').setLabel(`🔁 ${formatNum(retweets)}`).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('reply').setLabel('💬 Comentar').setStyle(ButtonStyle.Primary)
        );

        await message.delete().catch(() => {});
        return message.channel.send({ embeds: [embed], components: [row] });
    }
};