const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'users.json');
const seedPath = path.join(__dirname, 'users.seed.json');

function normalizeUser(u, nextIdFn) {
  return {
    id: typeof u.id === 'number' ? u.id : nextIdFn(),
    username: u.username,
    password: typeof u.password === 'string' ? u.password : (u.passwordHash ? '' : ''),
    isAdmin: !!u.isAdmin
  };
}

function readJson(fp, fallback = []) {
  if (!fs.existsSync(fp)) return fallback;
  try {
    const txt = fs.readFileSync(fp, 'utf8').trim();
    return txt ? JSON.parse(txt) : fallback;
  } catch {
    return fallback;
  }
}

function nextIdOf(arr) {
  return arr.length ? Math.max(...arr.map(u => u.id || 0)) + 1 : 1;
}

function load() {
  if (fs.existsSync(dataPath)) {
    try {
      const arr = readJson(dataPath, []);
      return Array.isArray(arr) ? arr : [];
    } catch {
    }
  }

  const seedArr = readJson(seedPath, []);
  let users = Array.isArray(seedArr) ? seedArr : [];
  const tmp = [];
  const nextIdFn = () => nextIdOf(tmp);
  for (const u of users) tmp.push(normalizeUser(u, nextIdFn));
  users = tmp;

  fs.writeFileSync(dataPath, JSON.stringify(users, null, 2));
  return users;
}

let users = load();

function save() {
  fs.writeFileSync(dataPath, JSON.stringify(users, null, 2));
}

function nextId() {
  return nextIdOf(users);
}

module.exports = {
  getAll: () => users,
  findByUsername: (username) => users.find(u => u.username === username),
  create: ({ username, password, isAdmin = false }) => {
    const newUser = { id: nextId(), username, password, isAdmin: !!isAdmin };
    users.push(newUser);
    save();
    return newUser;
  },
  clear: () => {
    users = [];
    save();
  }
};
