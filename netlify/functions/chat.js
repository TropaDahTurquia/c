// Armazenamento em memória (perdido entre execuções)
let messages = [];

exports.handler = async (event, context) => {
  const { action, message, username } = JSON.parse(event.body);

  try {
    if (action === 'send') {
      messages.push({
        id: Date.now(),
        username,
        message,
        timestamp: new Date().toISOString()
      });

      // Limita histórico para evitar consumo excessivo de memória
      if (messages.length > 100) {
        messages = messages.slice(-50);
      }

      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }

    if (action === 'get') {
      return { 
        statusCode: 200, 
        body: JSON.stringify({ 
          messages: messages.slice(-50) // Retorna apenas as últimas 50 mensagens
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