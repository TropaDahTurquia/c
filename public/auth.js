let authToken = null;

async function login(username, password) {
  try {
    const response = await fetch('/.netlify/functions/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'login', username, password }),
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();

    if (response.ok) {
      authToken = data.token;
      localStorage.setItem('chatToken', authToken);
      return data.role;
    } else {
      throw new Error(data.error || 'Erro no login');
    }
  } catch (error) {
    alert(error.message);
    return null;
  }
}

// Nova função login aprimorada
async function login(username, password) {
  if (!username || !password) {
    alert('Por favor, preencha todos os campos');
    return null;
  }

  try {
    const response = await fetch('/.netlify/functions/auth', {
      method: 'POST',
      body: JSON.stringify({ 
        action: 'login', 
        username: username.trim(), 
        password: password.trim() 
      }),
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro no login');
    }
    
    return data;
  } catch (error) {
    alert(error.message);
    console.error('Login error:', error);
    return null;
  }
}

// Verifica se já está logado
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
    return data.valid ? { role: data.role, token } : false;
  } catch (error) {
    return false;
  }
}

// Configura o login
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const role = await login(username, password);
  if (role) {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('chat').style.display = 'block';
    startChat();
  }
});

// Verifica login ao carregar a página
window.addEventListener('DOMContentLoaded', async () => {
  const auth = await checkAuth();
  if (auth) {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('chat').style.display = 'block';
    authToken = auth.token;
    startChat();
  }
});

// No HTML, garanta que o placeholder oriente para números, se desejar.
// Nenhuma alteração de lógica JS necessária para aceitar números como usuário/senha.
