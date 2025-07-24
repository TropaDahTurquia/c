document.addEventListener('DOMContentLoaded', () => {
  const addUserForm = document.getElementById('add-user-form');
  const usersList = document.getElementById('users-list');
  const messagesList = document.getElementById('messages-list');
  const refreshBtn = document.getElementById('refresh-messages');
  
  // Carrega dados admin
  async function loadAdminData() {
    try {
      const response = await fetch('/.netlify/functions/admin');
      const data = await response.json();
      
      if (response.ok) {
        // Lista de usuários
        if (usersList) {
          usersList.innerHTML = Object.entries(data.users)
            .filter(([username]) => username !== 'admin')
            .map(([username]) => `
              <div class="user-item">
                <span>${username}</span>
                <button class="delete-btn" data-username="${username}">Remover</button>
              </div>
            `).join('');
            
          // Adiciona event listeners para botões de remover
          document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
              const username = btn.getAttribute('data-username');
              if (confirm(`Tem certeza que deseja remover o usuário ${username}?`)) {
                await removeUser(username);
              }
            });
          });
        }
        
        // Lista de mensagens
        if (messagesList) {
          messagesList.innerHTML = data.messages.map(msg => `
            <div class="message-item">
              <div>
                <strong>${msg.username}</strong>: ${msg.message}
                <div class="timestamp">${new Date(msg.timestamp).toLocaleString()}</div>
              </div>
            </div>
          `).join('');
        }
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  }
  
  // Adiciona usuário
  if (addUserForm) {
    addUserForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('new-username').value.trim();
      const password = document.getElementById('new-password').value.trim();
      
      if (username && password) {
        try {
          const response = await fetch('/.netlify/functions/admin', {
            method: 'POST',
            body: JSON.stringify({ 
              action: 'addUser', 
              username, 
              password 
            }),
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (response.ok) {
            alert('Usuário adicionado com sucesso!');
            document.getElementById('new-username').value = '';
            document.getElementById('new-password').value = '';
            loadAdminData();
          } else {
            const error = await response.json();
            throw new Error(error.error);
          }
        } catch (error) {
          alert(`Erro ao adicionar usuário: ${error.message}`);
        }
      }
    });
  }
  
  // Remove usuário
  async function removeUser(username) {
    try {
      const response = await fetch('/.netlify/functions/admin', {
        method: 'POST',
        body: JSON.stringify({ 
          action: 'removeUser', 
          username 
        }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        alert('Usuário removido com sucesso!');
        loadAdminData();
      } else {
        const error = await response.json();
        throw new Error(error.error);
      }
    } catch (error) {
      alert(`Erro ao remover usuário: ${error.message}`);
    }
  }
  
  // Botão de atualizar
  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadAdminData);
  }
  
  // Carrega dados inicialmente
  if (currentUser?.role === 'admin') {
    loadAdminData();
  }
});