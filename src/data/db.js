
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'products.json');
const seedPath = path.join(__dirname, 'products.seed.json');

function load() {
  if (fs.existsSync(dataPath)) {
    try {
      const txt = fs.readFileSync(dataPath, 'utf-8');
      if (txt.trim().length > 0) {
        return JSON.parse(txt);
      }
    } catch (_) {}
  }
  const seed = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
  fs.writeFileSync(dataPath, JSON.stringify(seed, null, 2));
  return seed;
}

let products = load();

function save() {
  fs.writeFileSync(dataPath, JSON.stringify(products, null, 2));
}

function nextId() {
  return products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
}

module.exports = {
  getAll: () => products,
  getById: (id) => products.find(p => p.id === id),
  create: (data) => {
    const newItem = { id: nextId(), ...data };
    products.push(newItem);
    save();
    return newItem;
  },
  update: (id, data) => {
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    products[idx] = { ...products[idx], ...data, id };
    save();
    return products[idx];
  },
  remove: (id) => {
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    products.splice(idx, 1);
    save();
    return true;
  },
  stockSummary: () => {
    const byCategory = {};
    let totalValue = 0;
    for (const p of products) {
      byCategory[p.category] = (byCategory[p.category] || 0) + p.stock;
      totalValue += p.stock * p.price;
    }
    return { byCategory, totalValue };
  }
};
