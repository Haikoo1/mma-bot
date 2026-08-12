const fs = require('node:fs');
const path = require('node:path');

const filePath = path.join(__dirname, '../data/weight.json');

function ensureFile() {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify({}), 'utf-8');
}

function loadWeightData() {
    ensureFile();
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
        return {};
    }
}

function saveWeightData(data) {
    ensureFile();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

class WeightManager {
    static getStatus(userId) {
        const data = loadWeightData();
        return data[userId] || null;
    }

    static setStatus(userId, status, roll) {
        const data = loadWeightData();
        data[userId] = {
            status, // SUCESSO, CORTE_DIFICIL, PESO_NAO_BATIDO
            roll,
            date: new Date().toISOString()
        };
        saveWeightData(data);
        return data[userId];
    }

    static clearStatus(userId) {
        const data = loadWeightData();
        delete data[userId];
        saveWeightData(data);
    }
}

module.exports = { WeightManager };