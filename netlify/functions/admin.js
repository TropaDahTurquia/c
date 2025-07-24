const fs = require('fs-extra');
const path = require('path');

const USERS_FILE = path.join(process.cwd(), 'users.json');
const MESSAGES_FILE = path.join(process.cwd(), 'messages.json');

exports.handler = async (event, context) => {
  try {
    if (event.httpMethod === 'GET') {
      const users = await fs.readJson(USERS_FILE);
      const messages = await fs.readJson(MESSAGES_FILE);
      
      return {
        statusCode: 200,
        body: JSON.stringify({ users, messages })
      };
    }
    
    if (event.httpMethod === 'POST') {
      const { action, username, password } = JSON.parse(event.body);
      const users = await fs.readJson(USERS_FILE);
      
      if (action === 'addUser') {
        users[username] = {
          password: require('bcryptjs').hashSync(password, 10),
          role: 'user'
        };
        await fs.writeJson(USERS_FILE, users);
        return { statusCode: 200, body: JSON.stringify({ success: true }) };
      }
      
      if (action === 'removeUser') {
        delete users[username];
        await fs.writeJson(USERS_FILE, users);
        return { statusCode: 200, body: JSON.stringify({ success: true }) };
      }
    }
    
    return { statusCode: 400, body: JSON.stringify({ error: 'Ação inválida' }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};