const fs = require('fs-extra');
const path = require('path');

const MESSAGES_FILE = path.join(process.cwd(), 'messages.json');

exports.handler = async (event, context) => {
  const { action, message, username } = JSON.parse(event.body);
  
  try {
    let messages = await fs.readJson(MESSAGES_FILE).catch(() => []);
    
    if (action === 'send') {
      messages.push({
        id: Date.now(),
        username,
        message,
        timestamp: new Date().toISOString()
      });
      await fs.writeJson(MESSAGES_FILE, messages);
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }
    
    if (action === 'get') {
      return { statusCode: 200, body: JSON.stringify({ messages }) };
    }
    
    return { statusCode: 400, body: JSON.stringify({ error: 'Ação inválida' }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};