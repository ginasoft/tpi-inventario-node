const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'users.json');
const seedPath = path.join(__dirname, 'users.seed.json');

function load() {
  if (fs.existsSync(dataPath)) {
    try {
      const txt = fs.readFileSync(dataPath, 'utf8');
      if (txt.trim().length) return JSON.parse(txt);
    } catch (e) {
    }
  }
  let seed = [];
  if (fs.existsSync(seedPath)) {
    seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  }
  fs.writeFileSync(dataPath, JSON.stringify(seed, null, 2));
  return seed;
}

let users = load();

function save() {
  fs.writeFileSync(dataPath, JSON.stringify(users, null, 2));
}

function nextId() {
  return users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
}

module.exports = {
  getAll: () => users,
  findByUsername: (username) => users.find(u => u.username === username),
  create: ({ username, password }) => {
    const newUser = { id: nextId(), username, password }; // password en claro
    users.push(newUser);
    save();
    return newUser;
  }
};
