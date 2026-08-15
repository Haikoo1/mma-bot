// config/roles.js
// Substitua os IDs abaixo pelos IDs reais dos cargos do seu servidor
//
// Cada golpe com nível exige o cargo da disciplina correspondente:
//   striking  -> comandos de trocação (-jab, -direto, -uppercut, ...)
//   wrestling -> comandos de quedas/controle (-single, -clinch, -scramble, ...)
//   jiujitsu  -> comandos de finalização (-armlock, -kimura, -triangulo, ...)
//   defesa    -> comandos defensivos (-def, -esquiva)

module.exports = {

    // Cargo de Staff/Admin (usado em -luta, -pesagem, -vitalidade e bypass de golpes)
    adminRoleId: "ID_DO_CARGO_ADMIN_AQUI",

    // Trocação (Striking) - Níveis 1 a 5
    striking: {
        1: "1513026855844843551",
        2: "1513026942025334835",
        3: "1513027018617389187",
        4: "1513027096073605122",
        5: "1513027132928819200"
    },

    // Wrestling / Quedas - Níveis 1 a 5
    wrestling: {
        1: "1513027296821510184",
        2: "1513027378803380316",
        3: "1513027430799904889",
        4: "1513027506729648238",
        5: "1513027672056402012"
    },

    // Jiu-Jitsu / Finalizações - Níveis 1 a 5
    jiujitsu: {
        1: "1513027748089664512",
        2: "1513027863077589062",
        3: "1513027919465812120",
        4: "1513028001154207884",
        5: "1513028048541319239"
    },

    // Defesa e Tática (def / esquiva) - Níveis 1 a 5
    defesa: {
        1: "1514645421119766691",
        2: "1514645504095682711",
        3: "1514645528082649240",
        4: "1515052101921935532",
        5: "1515055050714779780"
    }
};