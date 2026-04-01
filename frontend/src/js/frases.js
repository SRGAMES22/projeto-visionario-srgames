async function carregarFrases() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/frases', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Erro ao carregar');

        const frases = await response.json();
        const container = document.getElementById('frases-container');
        if (!container) return;

        container.innerHTML = '';

        const isAdmin = window.currentUser && window.currentUser.role === 'admin';

        frases.forEach(frase => {
            const li = document.createElement('li');
            li.className = 'cartao-frase';
            li.innerHTML = `
                <div class="informacoes">
                    <span>${frase.titulo}</span>
                </div>
                <p class="descricao">${frase.texto}</p>
                ${isAdmin ? `
                <div class="frase-actions">
                    <button class="delete-btn" data-id="${frase.id}">🗑 Deletar</button>
                </div>` : ''}
            `;
            container.appendChild(li);
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deletarFrase(btn.dataset.id));
        });

    } catch (error) {
        console.error('Erro ao carregar frases:', error);
        const container = document.getElementById('frases-container');
        if (container) container.innerHTML = '<p style="color: red; text-align: center;">Erro ao carregar frases.</p>';
    }
}

async function deletarFrase(fraseId) {
    if (!confirm('Tem certeza que deseja deletar esta frase?')) return;

    try {
        const response = await fetch(`http://127.0.0.1:5000/api/frases/${fraseId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.ok) {
            alert('Frase deletada!');
            carregarFrases();
        } else {
            alert('Erro ao deletar');
        }
    } catch (error) {
        alert('Erro de conexão');
    }
}

document.addEventListener('DOMContentLoaded', carregarFrases);
window.carregarFrases = carregarFrases;