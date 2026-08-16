// config/luckyUsers.js
// Usuários pré-definidos que recebem um bônus sutil e dinâmico na probabilidade
// de sucesso das ações de combate.
//
// O bônus é aplicado apenas internamente, no cálculo do roll (utils/combatEngine.js),
// e NUNCA é exibido em mensagens ou eventos do chat: a saída permanece rigorosamente
// idêntica à dos demais usuários.

module.exports = {

    // Substitua pelo(s) ID(s) real(is) do(s) usuário(s) que receberão o bônus
    ids: [
        "1148763171469934602"
    ],

    // Configuração do bônus (dinâmico e sutil)
    bonus: {
        // Chance (0 a 1) de o bônus NÃO ativar em uma ação específica.
        // Mantém o resultado natural e impede que o padrão fique perceptível.
        skipChance: 0.15,

        // Faixa do bônus somado ao roll (inteiro aleatório entre min e max).
        // Valores baixos mantêm o aumento sutil e os erros ainda acontecem.
        min: 1,
        max: 6
    }
};
