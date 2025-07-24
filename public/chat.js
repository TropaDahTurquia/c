function startChat() {
  const messagesContainer = document.getElementById('messages');
  const messageForm = document.getElementById('message-form');

  // Carrega mensagens
  async function loadMessages() {
    try {
      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        body: JSON.stringify({ action: 'get' }),
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (response.ok) {
        messagesContainer.innerHTML = data.messages.map(msg => `
          <div style="margin-bottom: 10px;">
            <strong>${msg.username}</strong>: ${msg.message}
            <div style="font-size: 0.8em; color: #666;">${new Date(msg.timestamp).toLocaleString()}</div>
          </div>
        `).join('');

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  }

  // Envia mensagem
  messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('message-input');
    const message = input.value.trim();

    if (message) {
      try {
        await fetch('/.netlify/functions/chat', {
          method: 'POST',
          body: JSON.stringify({ 
            action: 'send', 
            message,
            username: 'user' // Substitua por username real se tiver
          }),
          headers: { 'Content-Type': 'application/json' }
        });

        input.value = '';
        loadMessages();
      } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
      }
    }
  });

  // Atualiza mensagens a cada 3 segundos
  loadMessages();
  setInterval(loadMessages, 3000);
}
