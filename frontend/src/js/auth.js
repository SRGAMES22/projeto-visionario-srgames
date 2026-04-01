let currentUser = null;

const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');
const userInfo = document.getElementById('user-info');
const welcomeText = document.getElementById('welcome-text');
const logoutBtn = document.getElementById('logout-btn');
const addFraseBtn = document.getElementById('add-frase-btn');

const modal = document.getElementById('add-frase-modal');
const addFraseForm = document.getElementById('add-frase-form');
const cancelBtn = document.getElementById('cancel-btn');
const fraseTituloInput = document.getElementById('frase-titulo');
const fraseTextoInput = document.getElementById('frase-texto');

function showMessage(text, color = 'white') {
    if (loginMessage) {
        loginMessage.textContent = text;
        loginMessage.style.color = color;
        setTimeout(() => loginMessage.textContent = '', 5000);
    }
}

function updateUI() {
    if (currentUser) {
        if (loginForm) loginForm.style.display = 'none';
        if (userInfo) userInfo.style.display = 'block';
        if (welcomeText) welcomeText.textContent = `Bem-vindo, ${currentUser.username} (${currentUser.role})`;
        
        if (addFraseBtn) {
            addFraseBtn.style.display = currentUser.role === 'admin' ? 'inline-block' : 'none';
        }
    } else {
        if (loginForm) loginForm.style.display = 'block';
        if (userInfo) userInfo.style.display = 'none';
        if (addFraseBtn) addFraseBtn.style.display = 'none';
    }

    window.currentUser = currentUser;
}

async function fazerLogin(username, password) {
    try {
        const response = await fetch('http://127.0.0.1:5000/login', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data;
            window.currentUser = currentUser; 
            updateUI();
            showMessage('Login realizado com sucesso!', 'lime');
            
            if (typeof carregarFrases === 'function') carregarFrases();
            if (typeof carregarVisualizacoes === 'function') carregarVisualizacoes();
        } else {
            showMessage(data.error || 'Usuário ou senha incorretos', 'red');
        }
    } catch (error) {
        showMessage('Erro de conexão com o servidor', 'red');
    }
}

async function fazerLogout() {
    try {
        await fetch('http://127.0.0.1:5000/logout', {
            method: 'POST',
            credentials: 'include'
        });
        currentUser = null;
        window.currentUser = null;
        updateUI();
        showMessage('Logout realizado com sucesso!', 'lime');
    } catch (error) {
        console.error('Erro no logout:', error);
    }
}

async function adicionarFrase(titulo, texto) {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/frases', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo, texto })
        });

        if (response.ok) {
            showMessage('Frase adicionada com sucesso!', 'lime');
            if (typeof carregarFrases === 'function') carregarFrases();
            fecharModal();
        } else {
            showMessage('Erro ao adicionar frase', 'red');
        }
    } catch (error) {
        showMessage('Erro de conexão com o servidor', 'red');
    }
}

function abrirModal() {
    if (modal) modal.style.display = 'flex';
    if (fraseTituloInput) fraseTituloInput.value = '';
    if (fraseTextoInput) fraseTextoInput.value = '';
}

function fecharModal() {
    if (modal) modal.style.display = 'none';
}

async function carregarVisualizacoes() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/views', {
            credentials: 'include'
        });
        const data = await response.json();
        
        const viewElement = document.getElementById('view-count');
        if (viewElement) {
            viewElement.textContent = data.views || 0;
        }
    } catch (error) {
        console.error('Erro ao carregar visualizações:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            if (username && password) {
                fazerLogin(username, password);
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', fazerLogout);
    }

    if (addFraseBtn) {
        addFraseBtn.addEventListener('click', abrirModal);
    }

    if (addFraseForm) {
        addFraseForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const titulo = fraseTituloInput ? fraseTituloInput.value.trim() : '';
            const texto = fraseTextoInput ? fraseTextoInput.value.trim() : '';

            if (titulo && texto) {
                adicionarFrase(titulo, texto);
            } else {
                showMessage('Preencha título e texto da frase', 'orange');
            }
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', fecharModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) fecharModal();
        });
    }

    carregarVisualizacoes();

    updateUI();
});