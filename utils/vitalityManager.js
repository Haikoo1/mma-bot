const fs = require('node:fs');
const path = require('node:path');

const filePath = path.join(__dirname, '../data/vitality.json');

// Garante que a pasta 'data' e o arquivo 'vitality.json' existam
function ensureFile() {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify({}), 'utf-8');
}

function loadVitality() {
    ensureFile();
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch {
        return {};
    }
}

function saveVitality(data) {
    ensureFile();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

class VitalityManager {
    static getVitality(userId) {
        const data = loadVitality();
        return data[userId] !== undefined ? data[userId] : 100;
    }

    static setVitality(userId, value) {
        const data = loadVitality();
        data[userId] = Math.min(100, Math.max(0, value));
        saveVitality(data);
        return data[userId];
    }

    static deductVitality(userId, points) {
        const current = this.getVitality(userId);
        const newVitality = Math.min(100, Math.max(0, current - points));
        return this.setVitality(userId, newVitality);
    }
}

module.exports = { VitalityManager };