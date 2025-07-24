const bcrypt = require('bcryptjs');
const fs = require('fs-extra');
const path = require('path');

const USERS_FILE = path.join(process.cwd(), 'users.json');
const SESSIONS_FILE = path.join(process.cwd(), 'sessions.json');

// Carrega ou cria arquivo de usuários
async function loadUsers() {
  try {
    return await fs.readJson(USERS_FILE);
  } catch (e) {
    const defaultUsers = {
      admin: {
        password: bcrypt.hashSync('admin123', 10),
        role: 'admin'
      },
      user1: {
        password: bcrypt.hashSync('tropa123', 10),
        role: 'user'
      }
    };
    await fs.writeJson(USERS_FILE, defaultUsers);
    return defaultUsers;
  }
}

exports.handler = async (event, context) => {
  const { action, username, password, token } = JSON.parse(event.body);
  
  try {
    const users = await loadUsers();
    
    // Login
    if (action === 'login') {
      const user = users[username];
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return { statusCode: 401, body: JSON.stringify({ error: 'Credenciais inválidas' }) };
      }
      
      // Cria sessão
      const sessionToken = require('uuid').v4();
      const sessions = await fs.readJson(SESSIONS_FILE).catch(() => ({}));
      sessions[sessionToken] = { username, role: user.role, expires: Date.now() + 3600000 };
      await fs.writeJson(SESSIONS_FILE, sessions);
      
      return { statusCode: 200, body: JSON.stringify({ token: sessionToken, role: user.role }) };
    }
    
    // Verifica sessão
    if (action === 'check') {
      const sessions = await fs.readJson(SESSIONS_FILE).catch(() => ({}));
      const session = sessions[token];
      
      if (!session || session.expires < Date.now()) {
        return { statusCode: 401, body: JSON.stringify({ valid: false }) };
      }
      
      return { statusCode: 200, body: JSON.stringify({ valid: true, role: session.role }) };
    }
    
    return { statusCode: 400, body: JSON.stringify({ error: 'Ação inválida' }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};