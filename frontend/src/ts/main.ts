interface Frase {
  id: number;
  titulo: string;
  texto: string;
}

async function carregarFrases() {
  try {
    const resposta = await fetch('http://127.0.0.1:5000/api/frases', {
      method: 'GET',
      credentials: 'include',  
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!resposta.ok) {
      throw new Error(`Erro na requisição: ${resposta.status}`);
    }

    const frases: Frase[] = await resposta.json();

    const container = document.querySelector('.listagem-frases') as HTMLUListElement | null;

    if (!container) {
      console.error('Elemento .listagem-frases não encontrado');
      return;
    }

    container.innerHTML = '';

    frases.forEach(frase => {
      const cartao = document.createElement('li');
      cartao.className = 'cartao-frase';

      cartao.innerHTML = `
        <div class="informacoes">
          <span>${frase.titulo}</span>
        </div>
        <p class="descricao">
          ${frase.texto}
        </p>
      `;

      container.appendChild(cartao);
    });

    console.log(`Carregou ${frases.length} frases com sucesso`);
  } catch (erro) {
    console.error('Falha ao carregar frases:', erro);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  carregarFrases();
});