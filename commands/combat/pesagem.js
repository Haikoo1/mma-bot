const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { WeightManager } = require('../../utils/weightManager');
const roleConfig = require('../../config/roles');

module.exports = {
    name: 'pesagem',
    async execute(message, args) {
        let targetUser = message.author;
        let isStaffAction = false;

        // Se houver menção, valida se quem digitou é Staff
        if (message.mentions.users.first()) {
            const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator) ||
                (roleConfig.adminRoleId && message.member.roles.cache.has(roleConfig.adminRoleId));

            if (!isAdmin) {
                return message.reply('❌ Apenas a Staff pode realizar a pesagem em nome de outro atleta.');
            }
            targetUser = message.mentions.users.first();
            isStaffAction = true;
        }

        // Roll 1d100
        const roll = Math.floor(Math.random() * 100) + 1;
        let status = '';
        let title = '';
        let color = 0x000000;
        let description = '';

        if (roll <= 90) {
            status = 'SUCESSO';
            title = '✅ PESO BATIDO COM SUCESSO!';
            color = 0x2ecc71;
            description = `>>> <@${targetUser.id}> cravou o peso oficial da categoria e está 100% liberado para o combate!`;
        } else if (roll <= 97) {
            status = 'CORTE_DIFICIL';
            title = '⚠️ CORTE DIFÍCIL DE PESO!';
            color = 0xf1c40f;
            description = `>>> <@${targetUser.id}> bateu o peso, porém sofreu um desgaste físico extremo no processo.\n\n**Penalidades para o Combate:**\n• Inicia a luta com **-5 de Energia/Gás**.\n• Perda de efetividade nos golpes durante a luta.\n• Desgaste de stamina acelerado em cada ataque.`;
        } else {
            status = 'PESO_NAO_BATIDO';
            title = '❌ PESO NÃO BATIDO!';
            color = 0xe74c3c;
            description = `>>> <@${targetUser.id}> ultrapassou o limite oficial de sua categoria!\n\n**Penalidades & Sanções:**\n• **-5 de Energia/Gás** e perda de efetividade nos golpes.\n• A luta **NÃO valerá cinturão**.\n• O resultado **não atualizará o ranking**.\n• Sujeito a multa contratual, perda de popularidade ou luta em Catchweight/Cancelamento.`;
        }

        WeightManager.setStatus(targetUser.id, status, roll);

        const embed = new EmbedBuilder()
            .setTitle(`⚖️ PESAGEM OFICIAL • 1d100`)
            .setColor(color)
            .setDescription(description)
            .addFields(
                { name: '🥊 Atleta', value: `<@${targetUser.id}>`, inline: true },
                { name: '🎲 Resultado', value: `\`${roll} / 100\``, inline: true },
                { name: '📌 Status', value: `\`${status.replace('_', ' ')}\``, inline: true }
            )
            .setFooter({ 
                text: isStaffAction ? 'Pesagem realizada pela Staff (Não Comparecimento)' : 'Pesagem Oficial • MMA RP' 
            })
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }
};