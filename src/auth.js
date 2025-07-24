let currentToken = null;
let currentUser = null;

async function login(username, password) {
  try {
    const response = await fetch('/.netlify/functions/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'login', username, password }),
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      currentToken = data.token;
      currentUser = { username, role: data.role };
      localStorage.setItem('chatToken', currentToken);
      return true;
    } else {
      throw new Error(data.error || 'Erro no login');
    }
  } catch (error) {
    console.error('Login error:', error);
    alert(error.message);
    return false;
  }
}

async function checkAuth() {
  const token = localStorage.getItem('chatToken');
  if (!token) return false;
  
  try {
    const response = await fetch('/.netlify/functions/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'check', token }),
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.json();
    
    if (data.valid) {
      currentToken = token;
      return true;
    } else {
      localStorage.removeItem('chatToken');
      return false;
    }
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
}

function logout() {
  currentToken = null;
  currentUser = null;
  localStorage.removeItem('chatToken');
  window.location.reload();
}

// Event listeners para login
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      const success = await login(username, password);
      if (success) {
        window.location.reload();
      }
    });
  }
  
  // Verifica autenticação ao carregar a página
  (async () => {
    const isAuthenticated = await checkAuth();
    const loginContainer = document.getElementById('login-container');
    const chatContainer = document.getElementById('chat-container');
    const adminContainer = document.getElementById('admin-container');
    const userInfo = document.getElementById('user-info');
    
    if (isAuthenticated) {
      if (loginContainer) loginContainer.classList.add('hidden');
      if (chatContainer) chatContainer.classList.remove('hidden');
      if (adminContainer) adminContainer.classList.remove('hidden');
      
      if (userInfo) {
        userInfo.innerHTML = `
          <span>Olá, ${currentUser?.username || 'Usuário'}!</span>
          <button onclick="logout()">Sair</button>
        `;
      }
    } else {
      if (loginContainer) loginContainer.classList.remove('hidden');
      if (chatContainer) chatContainer.classList.add('hidden');
      if (adminContainer) adminContainer.classList.add('hidden');
    }
  })();
});

// Expor logout globalmente
window.logout = logout;