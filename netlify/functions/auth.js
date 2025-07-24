const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Dados em memória (persistem apenas durante a execução da função)
let sessions = {};

exports.handler = async (event, context) => {
  const { action, username, password, token } = JSON.parse(event.body);

  try {
    // Verifica credenciais
    const validateCredentials = (username, password) => {
      if (username === 'admin' && bcrypt.compareSync(password, process.env.ADMIN_PASSWORD_HASH)) {
        return { role: 'admin' };
      }
      if (username === 'user' && bcrypt.compareSync(password, process.env.USER_PASSWORD_HASH)) {
        return { role: 'user' };
      }
      return null;
    };

    // Login
    if (action === 'login') {
      const user = validateCredentials(username, password);
      if (!user) {
        return { statusCode: 401, body: JSON.stringify({ error: 'Credenciais inválidas' }) };
      }

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
          role: user.role 
        }) 
      };
    }

    // Verifica sessão
    if (action === 'check') {
      const session = sessions[token];
      const isValid = session && session.expires > Date.now();

      return { 
        statusCode: 200, 
        body: JSON.stringify({ 
          valid: isValid,
          role: isValid ? session.role : null
        }) 
      };
    }

    return { statusCode: 400, body: JSON.stringify({ error: 'Ação inválida' }) };
  } catch (error) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ 
        error: error.message 
      }) 
    };
  }
};