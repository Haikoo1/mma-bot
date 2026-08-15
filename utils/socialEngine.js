require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function generateSocialComments({ author, postText, popLevel, popBadge }) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.warn("⚠️ [MMA-X AI] GEMINI_API_KEY não encontrada no arquivo .env.");
        return getFallbackComments(author, postText);
    }

    const modelsToTry = [
        "gemini-3.6-flash",
        "gemini-3.5-flash",
        "gemini-flash-latest"
    ];
    
    const genAI = new GoogleGenerativeAI(apiKey);

    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ 
                model: modelName,
                generationConfig: { responseMimeType: "application/json" }
            });

            const prompt = `Você é um gerador de reações do Twitter/X para um RP de MMA no Brasil.

DADOS DO POST:
- Autor: @${author}
- Texto: "${postText}"
- Popularidade: ${popBadge}

INSTRUÇÕES DE VARIABILIDADE DOS ARROBAS (@):
- NUNCA use os mesmos usernames. INVENTE 3 arrobas completamente diferentes para cada post!
- Crie variações como:
  * Perfis de Mídia/Memes: @combate_news, @ufc_resenha, @mma_portal_br, @octogono_depre, @sexto_round_fan
  * Fãs e Torcedores: @cria_do_ufc, @ze_do_kickbox, @lucas_mma99, @fa_de_nocaute, @lutador_sofa
  * Haters e Trolls: @hater_de_plantao, @sofa_critic, @analista_de_boteco, @bagre_hunter
  * Perfis de MMA fictícios aleatórios: @sp_fight_club, @mma_brasil_zone, @tatame_news

REGRAS DO CONTEÚDO:
- Reaja DIRETAMENTE ao texto "${postText}".
- Se for saudação ("oi amigos"), deboche do lutador mandar isso em vez de focar no treino.
- Use gírias de internet BR (amasso, bagre, joga nada, 💀, 🥊, tmnc, cria, esquece).
- Cada comentário deve ter de 4 a 10 palavras.
- NÃO use aspas duplas dentro dos comentários.

FORMATO OBRIGATÓRIO (Array JSON puro de strings com @handles inventados por você):
[
  "• **@arroba_inventado_1:** comentário reativo",
  "• **@arroba_inventado_2:** comentário reativo",
  "• **@arroba_inventado_3:** comentário reativo"
]`;

            const result = await model.generateContent(prompt);
            let text = result.response.text().trim();
            text = text.replace(/```json/gi, '').replace(/```/gi, '').trim();

            let comments;
            try {
                comments = JSON.parse(text);
            } catch (jsonErr) {
                const extracted = text.match(/•\s*\*\*@[^:]+:\*\*[^\n\r"]+/g);
                if (extracted) comments = extracted;
            }

            if (Array.isArray(comments) && comments.length > 0) {
                return comments;
            }
        } catch (error) {
            console.error(`❌ [MMA-X AI] Falha no modelo ${modelName}:`, error.message);
        }
    }

    return getFallbackComments(author, postText);
}

// Fallback dinâmico para não repetir arrobas caso a API caia
function getFallbackComments(author, postText) {
    const handlesMedia = ['@ufc_depre', '@combate_zone', '@mma_br_news', '@tatame_br'];
    const handlesFans = ['@fa_de_mma_99', '@cria_do_octogono', '@kickboxer_sp', '@mma_fanatico'];
    const handlesHaters = ['@hater_do_rp', '@analista_de_sofa', '@critic_mma', '@bagre_tracker'];

    const pick = arr => arr[Math.floor(Math.random() * arr.length)];

    return [
        `• **${pick(handlesMedia)}:** O @${author} postou '${postText}'... o que isso afeta o Grêmio?`,
        `• **${pick(handlesFans)}:** Massa demais! Mas e o foco pro próximo card? 🥊`,
        `• **${pick(handlesHaters)}:** Postando isso enquanto os rivais tão treinando de verdade kkkk 💀`
    ];
}

module.exports = { generateSocialComments };