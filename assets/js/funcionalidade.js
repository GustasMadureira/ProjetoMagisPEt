const dadosEventos = {};
const replit = 'https://e638a33f-632f-4094-9417-d318625fdd11-00-zxrkllekyax9.kirk.replit.dev/';
const url = replit + "eventos/";

// ========== CADASTRO DE EVENTO (POST) ==========
document.addEventListener('DOMContentLoaded', () => {
  const sendButton = document.getElementById('send_button');

  if (sendButton) {
    sendButton.addEventListener('click', (event) => {
      event.preventDefault();

      const nomeEvento = document.getElementById('nome-evento').value;
      const dataEvento = document.getElementById('data-evento').value;
      const horarioEvento = document.getElementById('hora-evento').value;
      const localEvento = document.getElementById('local-evento').value;
      const descricaoComp = document.getElementById('descricao-completa').value;
      const descricaoCurta = document.getElementById('descricao-curta').value;
      const linkBanner = document.getElementById('link-banner').value;

      const postData = {
        "nome-evento": nomeEvento,
        "data-evento": dataEvento,
        "hora-evento": horarioEvento,
        "local-evento": localEvento,
        "descricao-comp": descricaoComp,
        "descricao-curta": descricaoCurta,
        "link-banner": linkBanner
      };

      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify(postData),
      })
        .then(response => response.json())
        .then(data => {
          alert('Evento cadastrado com sucesso!');
          location.reload();
        })
        .catch(error => console.error('Erro:', error));
    });
  }
});

// ========== MODAL DE DETALHES ==========
function mostrarDetalhes(card) {
  const { titulo, data, horario, local, descricao, imagem, id } = card.dataset;

  const modal = document.createElement("div");
  modal.classList.add("modal-overlay");

  const modalCard = document.createElement("div");
  modalCard.classList.add("modal-card");

  modalCard.innerHTML = `
    <button class="btn-fechar-modal" onclick="fecharModal()">×</button>
    <img src="${imagem}" alt="${titulo}" />
    <div class="modal-conteudo">
      <h2>${titulo}</h2>
      <div class="info-detalhada">
        <div class="info-detalhada-item"><strong>📅 Data:</strong><span>${data}</span></div>
        <div class="info-detalhada-item"><strong>🕐 Horário:</strong><span>${horario}</span></div>
        <div class="info-detalhada-item"><strong>📍 Local:</strong><span>${local}</span></div>
      </div>
      <div class="descricao-completa"><p>${descricao}</p></div>

      <div class="modal-acoes">
        <button class="btn-salvar" onclick="editarEvento('${id}')">Editar</button>
        <button class="btn-cancelar" onclick="excluirEvento('${id}')">Excluir</button>
      </div>

      <div class="secao-avaliacao">
        <h3>Avalie este evento</h3>
        <div class="stars" id="stars-${titulo.replace(/\s/g, '-')}">
          ${[1, 2, 3, 4, 5].map(i => `<span class="star" data-value="${i}">★</span>`).join('')}
        </div>
      </div>

      <div class="secao-comentarios">
        <h3>Comentários</h3>
        <form class="form-comentario" onsubmit="adicionarComentario(event, '${titulo}')">
          <input type="text" class="input-nome" placeholder="Seu nome" required />
          <textarea class="textarea-comentario" placeholder="Seu comentário" required></textarea>
          <button type="submit" class="btn-enviar-comentario">Enviar comentário</button>
        </form>
        <div id="comentarios-${titulo.replace(/\s/g, '-')}" class="lista-comentarios"></div>
      </div>
    </div>
  `;

  modal.appendChild(modalCard);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) fecharModal();
  });

  document.body.appendChild(modal);

  const starsContainer = document.getElementById(`stars-${titulo.replace(/\s/g, '-')}`);
  const evento = dadosEventos[titulo] || { avaliacaoTotal: 0, numeroAvaliacoes: 0, comentarios: [] };
  const media = evento.numeroAvaliacoes > 0 ? Math.round(evento.avaliacaoTotal / evento.numeroAvaliacoes) : 0;

  starsContainer.querySelectorAll('.star').forEach((star, index) => {
    star.classList.toggle('active', index < media);
    star.addEventListener('click', () => {
      avaliarEvento(titulo, parseInt(star.dataset.value), starsContainer);
    });
  });

  const listaComentarios = document.getElementById(`comentarios-${titulo.replace(/\s/g, '-')}`);
  if (listaComentarios && evento.comentarios.length > 0) {
    listaComentarios.innerHTML = evento.comentarios.map(c => `
      <div class="comentario-item">
        <div class="comentario-header">
          <span class="comentario-autor">${c.nome}</span>
          <span class="comentario-data">${c.data}</span>
        </div>
        <p class="comentario-texto">${c.texto}</p>
      </div>
    `).join('');
  }
}

function fecharModal() {
  const modal = document.querySelector(".modal-overlay");
  if (modal) modal.remove();
}

// ========== AVALIAÇÃO ==========
function avaliarEvento(titulo, valor, starsContainer) {
  if (!dadosEventos[titulo]) {
    dadosEventos[titulo] = { avaliacaoTotal: 0, numeroAvaliacoes: 0, comentarios: [] };
  }

  dadosEventos[titulo].avaliacaoTotal += valor;
  dadosEventos[titulo].numeroAvaliacoes += 1;

  const media = Math.round(dadosEventos[titulo].avaliacaoTotal / dadosEventos[titulo].numeroAvaliacoes);
  starsContainer.querySelectorAll('.star').forEach((star, index) => {
    star.classList.toggle('active', index < media);
  });
}

// ========== COMENTÁRIOS ==========
function adicionarComentario(event, titulo) {
  event.preventDefault();

  const form = event.target;
  const nome = form.querySelector('.input-nome').value.trim();
  const texto = form.querySelector('.textarea-comentario').value.trim();

  if (!nome || !texto) {
    alert('Por favor, preencha todos os campos.');
    return;
  }

  if (!dadosEventos[titulo]) {
    dadosEventos[titulo] = { avaliacaoTotal: 0, numeroAvaliacoes: 0, comentarios: [] };
  }

  const agora = new Date();
  const dataFormatada = agora.toLocaleDateString('pt-BR') + ' às ' + agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const novoComentario = { nome, texto, data: dataFormatada };
  dadosEventos[titulo].comentarios.push(novoComentario);

  const listaComentarios = document.getElementById(`comentarios-${titulo.replace(/\s/g, '-')}`);
  if (listaComentarios) {
    listaComentarios.innerHTML = dadosEventos[titulo].comentarios.map(c => `
      <div class="comentario-item">
        <div class="comentario-header">
          <span class="comentario-autor">${c.nome}</span>
          <span class="comentario-data">${c.data}</span>
        </div>
        <p class="comentario-texto">${c.texto}</p>
      </div>
    `).join('');
  }

  form.reset();
}

// ========== EDITAR EVENTO (PUT) ==========
function editarEvento(id) {
  const nomeEvento = prompt("Novo nome do evento:");
  const dataEvento = prompt("Nova data (YYYY-MM-DD):");
  const horarioEvento = prompt("Novo horário:");
  const localEvento = prompt("Novo local:");
  const descricaoCurta = prompt("Nova descrição curta:");
  const descricaoComp = prompt("Nova descrição completa:");
  const linkBanner = prompt("Novo link da imagem:");

  const dadosAtualizados = {
    "nome-evento": nomeEvento,
    "data-evento": dataEvento,
    "hora-evento": horarioEvento,
    "local-evento": localEvento,
    "descricao-curta": descricaoCurta,
    "descricao-comp": descricaoComp,
    "link-banner": linkBanner
  };

  fetch(`${url}${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dadosAtualizados)
  })
    .then(res => res.json())
    .then(data => {
      alert("Evento atualizado com sucesso!");
      location.reload();
    })
    .catch(err => {
      console.error("Erro ao atualizar evento:", err);
      alert("Erro ao atualizar evento.");
    });
}

// ========== EXCLUIR EVENTO (DELETE) ==========
function excluirEvento(id) {
  if (!confirm("Tem certeza que deseja excluir este evento?")) return;

  fetch(`${url}${id}`, {
    method: "DELETE"
  })
    .then(() => {
      alert("Evento excluído com sucesso!");
      location.reload();
    })
    .catch(err => {
      console.error("Erro ao excluir evento:", err);
      alert("Erro ao excluir evento.");
    });
}
