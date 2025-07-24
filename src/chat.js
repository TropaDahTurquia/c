document.addEventListener('DOMContentLoaded', () => {
  const messageForm = document.getElementById('message-form');
  const messagesContainer = document.getElementById('messages');
  
  if (messageForm && messagesContainer) {
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
            <div class="message">
              <span class="username">${msg.username}</span>: 
              <span>${msg.message}</span>
              <div class="timestamp">${new Date(msg.timestamp).toLocaleString()}</div>
            </div>
          `).join('');
          
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    }
    
    // Envia mensagem
    messageForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const messageInput = document.getElementById('message-input');
      const message = messageInput.value.trim();
      
      if (message && currentUser) {
        try {
          const response = await fetch('/.netlify/functions/chat', {
            method: 'POST',
            body: JSON.stringify({ 
              action: 'send', 
              message, 
              username: currentUser.username 
            }),
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (response.ok) {
            messageInput.value = '';
            loadMessages();
          }
        } catch (error) {
          console.error('Error sending message:', error);
        }
      }
    });
    
    // Atualiza mensagens periodicamente
    loadMessages();
    setInterval(loadMessages, 5000);
  }
});