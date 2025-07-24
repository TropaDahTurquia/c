const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Configuração de usuários (melhor prática: usar variáveis de ambiente)
const USERS = {
  admin: {
    passwordHash: process.env.ADMIN_PASSWORD_HASH,
    role: 'admin'
  },
  user: {
    passwordHash: process.env.USER_PASSWORD_HASH,
    role: 'user'
  }
};

let sessions = {};

exports.handler = async (event, context) => {
  // Verifica se o método é POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { action, username, password, token } = JSON.parse(event.body);

    // Login
    if (action === 'login') {
      if (!username || !password) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Usuário e senha são obrigatórios' }) };
      }

      const user = USERS[username];
      
      // Verifica se usuário existe e se a senha está correta
      if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
        return { statusCode: 401, body: JSON.stringify({ error: 'Credenciais inválidas' }) };
      }

      // Cria sessão
      const sessionToken = uuidv4();
      sessions[sessionToken] = {
        username,
        role: user.role,
        expires: Date.now() + 3600000 // 1 hora
      };

      return {
        statusCode: 200,
        body: JSON.stringify({
          token: sessionToken,
          role: user.role,
          username
        })
      };
    }

    // Verificação de sessão
    if (action === 'check') {
      if (!token) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Token não fornecido' }) };
      }

      const session = sessions[token];
      const isValid = session && session.expires > Date.now();

      return {
        statusCode: 200,
        body: JSON.stringify({
          valid: isValid,
          role: isValid ? session.role : null,
          username: isValid ? session.username : null
        })
      };
    }

    return { statusCode: 400, body: JSON.stringify({ error: 'Ação inválida' }) };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Erro interno no servidor',
        details: error.message
      })
    };
  }
};