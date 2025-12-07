console.log("✅ JavaScript de eventos carregado!");

/* ===========================================================
   CONFIGURAÇÃO DA API
   =========================================================== */
const API_URL =
  "https://cc20c04c-918d-4941-adea-327d532368d2-00-3p832i6nen4dl.riker.replit.dev";

/* ===========================================================
   INICIALIZAÇÃO
   =========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Iniciando carregamento de eventos...");
  carregarEventos();
});

/* ===========================================================
   CARREGAR E RENDERIZAR EVENTOS
   =========================================================== */
async function carregarEventos() {
  const grid =
    document.getElementById("listaEventos") ||
    document.querySelector(".grid-eventos");

  if (!grid) {
    console.error("❌ Container de eventos não encontrado!");
    return;
  }

  // Mostra loading
  grid.innerHTML =
    '<p style="text-align: center; padding: 40px; color: #751a24;">⏳ Carregando eventos...</p>';

  try {
    const url = `${API_URL}/eventos`;
    console.log("📡 Buscando eventos em:", url);

    const response = await fetch(url);
    console.log("📡 Status:", response.status);

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log("📦 Dados recebidos:", data);

    // Identifica a estrutura dos dados
    let eventos = [];
    if (Array.isArray(data)) {
      eventos = data;
    } else if (data.eventos && Array.isArray(data.eventos)) {
      eventos = data.eventos;
    }

    // Filtra eventos válidos (remove eventos com campos null)
    eventos = eventos.filter(
      (evento) =>
        evento["nome-evento"] && evento["data-evento"] && evento["local-evento"]
    );

    console.log("✅ Total de eventos válidos:", eventos.length);

    // Limpa o container
    grid.innerHTML = "";

    if (eventos.length === 0) {
      grid.innerHTML =
        '<p style="text-align: center; padding: 40px; color: #666;">📅 Nenhum evento disponível no momento.</p>';
      return;
    }

    // Cria os cards
    eventos.forEach((evento) => {
      const card = criarCardEvento(evento);
      grid.appendChild(card);
    });

    console.log(`✅ ${eventos.length} cards de eventos renderizados`);
  } catch (error) {
    console.error("❌ Erro ao carregar eventos:", error);
    grid.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <p style="color: #d32f2f; font-size: 18px; margin-bottom: 10px;">❌ Erro ao carregar eventos</p>
        <p style="color: #666; font-size: 14px; margin-bottom: 20px;">${error.message}</p>
        <button onclick="carregarEventos()" style="padding: 12px 24px; background: #751a24; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; transition: background 0.3s;">
          🔄 Tentar novamente
        </button>
      </div>
    `;
  }
}

/* ===========================================================
   CRIAR CARD DE EVENTO
   =========================================================== */
function criarCardEvento(evento) {
  const card = document.createElement("div");
  card.classList.add("card-evento");

  // Armazena dados no card para uso posterior
  card.dataset.id = evento.id;
  card.dataset.titulo = evento["nome-evento"];
  card.dataset.data = evento["data-evento"];
  card.dataset.horario = evento["hora-evento"] || "Horário não informado";
  card.dataset.local = evento["local-evento"];
  card.dataset.descricao =
    evento["descricao-Comp"] ||
    evento["descricao-comp"] ||
    "Descrição não disponível.";
  card.dataset.descricaoCurta = evento["descricao-curta"] || "";
  card.dataset.imagem =
    evento["link-banner"] ||
    "https://via.placeholder.com/600x300?text=Sem+Imagem";

  // Cria descrição curta se não existir
  let descCurta = card.dataset.descricaoCurta;
  if (!descCurta && card.dataset.descricao) {
    descCurta =
      card.dataset.descricao.length > 100
        ? card.dataset.descricao.substring(0, 100) + "..."
        : card.dataset.descricao;
  }

  card.innerHTML = `
    <img src="${card.dataset.imagem}" 
         alt="${card.dataset.titulo}"
         onerror="this.src='https://via.placeholder.com/600x300?text=Sem+Imagem'" />
    <div class="conteudo-evento">
      <h3>${card.dataset.titulo}</h3>
      <div class="info-evento">
        <div class="info-item">
          <strong>📅 Data:</strong> ${formatarData(card.dataset.data)}
        </div>
        <div class="info-item">
          <strong>🕐 Horário:</strong> ${card.dataset.horario}
        </div>
        <div class="info-item">
          <strong>📍 Local:</strong> ${card.dataset.local}
        </div>
      </div>
      <p>${descCurta || "Clique para ver mais detalhes."}</p>
    </div>
  `;

  // Adiciona evento de clique
  card.addEventListener("click", () => mostrarDetalhes(card));

  // Adiciona efeito hover
  card.style.cursor = "pointer";
  card.style.transition = "all 0.3s ease";

  card.addEventListener("mouseenter", () => {
    card.style.transform = "translateY(-5px)";
    card.style.boxShadow = "0 8px 20px rgba(117, 26, 36, 0.2)";
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "translateY(0)";
    card.style.boxShadow = "";
  });

  return card;
}

/* ===========================================================
   MODAL DE DETALHES DO EVENTO
   =========================================================== */
async function mostrarDetalhes(card) {
  const id = card.dataset.id;

  if (!id) {
    console.error("❌ Card sem ID!");
    alert("Erro: Evento sem ID.");
    return;
  }

  // Dados básicos vindos do card (dataset)
  const dadosIniciais = {
    titulo: card.dataset.titulo,
    data: card.dataset.data,
    horario: card.dataset.horario,
    local: card.dataset.local,
    descricao: card.dataset.descricao,
    imagem: card.dataset.imagem,
  };

  // Busca dados completos (avaliações e comentários) na API
  let evento = { ratings: [], comments: [] };
  try {
    const response = await fetch(`${API_URL}/eventos/${id}`);
    if (response.ok) {
      evento = await response.json();
      // Garante que usamos os dados mais frescos da API se disponíveis
      if (evento.titulo)
        dadosIniciais.titulo = evento.titulo || evento["nome-evento"];
      if (evento.descricao)
        dadosIniciais.descricao = evento.descricao || evento["descricao-comp"];
    }
    if (!evento.ratings) evento.ratings = [];
    if (!evento.comments) evento.comments = [];
  } catch (error) {
    console.error("Erro ao buscar detalhes completos:", error);
  }

  // Cria o modal
  const modal = document.createElement("div");
  modal.classList.add("modal-overlay");

  const modalCard = document.createElement("div");
  modalCard.classList.add("modal-card");

  // HTML DO MODAL
  modalCard.innerHTML = `
    <button class="btn-fechar-modal" onclick="document.body.removeChild(this.closest('.modal-overlay'))">×</button>
    
    <div id="modal-content-${id}">
        <img src="${dadosIniciais.imagem}" alt="${
    dadosIniciais.titulo
  }" id="img-detalhe-${id}"
             onerror="this.src='https://via.placeholder.com/600x300?text=Sem+Imagem'" />
        
        <div class="modal-conteudo">
        
          <div class="evento-acoes-admin">
            <button class="btn-editar-evento" onclick="habilitarEdicaoEvento('${id}')">
              ✏️ Editar Evento
            </button>
            <button class="btn-excluir-evento" onclick="deletarEvento('${id}')">
              🗑️ Excluir Evento
            </button>
          </div>

          <h2 id="titulo-detalhe-${id}">${dadosIniciais.titulo}</h2>
          
          <div class="info-detalhada">
            <div class="info-detalhada-item">
              <strong>📅 Data:</strong>
              <span id="data-detalhe-${id}">${formatarData(
    dadosIniciais.data
  )}</span>
            </div>
            <div class="info-detalhada-item">
              <strong>🕐 Horário:</strong>
              <span id="horario-detalhe-${id}">${dadosIniciais.horario}</span>
            </div>
            <div class="info-detalhada-item">
              <strong>📍 Local:</strong>
              <span id="local-detalhe-${id}">${dadosIniciais.local}</span>
            </div>
          </div>
          
          <div class="descricao-completa">
            <p id="desc-detalhe-${id}">${dadosIniciais.descricao}</p>
          </div>

          <div class="secao-avaliacao">
            <h3> Avalie este evento</h3>
            <div class="stars" id="stars-${id}">
              ${[1, 2, 3, 4, 5]
                .map((i) => `<span class="star" data-value="${i}">★</span>`)
                .join("")}
            </div>
            <p class="texto-avaliacao" id="texto-avaliacao-${id}"></p>
          </div>

          <div class="secao-comentarios">
            <h3> Comentários</h3>
            <form class="form-comentario" onsubmit="adicionarComentario(event, '${id}')">
              <input type="text" class="input-nome" placeholder="Seu nome" required />
              <textarea class="textarea-comentario" placeholder="Seu comentário" required></textarea>
              <button type="submit" class="btn-enviar-comentario">Enviar comentário</button>
            </form>
            <div id="comentarios-${id}" class="lista-comentarios"></div>
          </div>
        </div>
    </div>
  `;

  modal.appendChild(modalCard);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) document.body.removeChild(modal);
  });

  document.body.appendChild(modal);

  // Inicializa funcionalidades
  configurarEstrelas(id, evento.ratings);
  renderizarComentarios(
    document.getElementById(`comentarios-${id}`),
    evento.comments,
    id
  );
}

/* ===========================================================
   SISTEMA DE AVALIAÇÃO (ESTRELAS)
   =========================================================== */
function configurarEstrelas(eventoId, avaliacoes) {
  const starsContainer = document.getElementById(`stars-${eventoId}`);
  const textoAvaliacao = document.getElementById(`texto-avaliacao-${eventoId}`);

  if (!starsContainer) return;

  // Calcula média
  const media =
    avaliacoes.length > 0
      ? Math.round(
          avaliacoes.reduce((acc, val) => acc + val, 0) / avaliacoes.length
        )
      : 0;

  // Atualiza texto
  if (textoAvaliacao) {
    if (avaliacoes.length > 0) {
      textoAvaliacao.textContent = `Média: ${media}/5  (${avaliacoes.length} ${
        avaliacoes.length === 1 ? "avaliação" : "avaliações"
      })`;
    } else {
      textoAvaliacao.textContent = "Seja o primeiro a avaliar!";
    }
  }

  // Configura estrelas
  const stars = starsContainer.querySelectorAll(".star");
  stars.forEach((star, index) => {
    star.classList.toggle("active", index < media);

    star.addEventListener("click", () => {
      avaliarEvento(
        eventoId,
        parseInt(star.dataset.value),
        starsContainer,
        avaliacoes
      );
    });
  });
}

async function avaliarEvento(
  eventoId,
  valor,
  starsContainer,
  avaliacoesAtuais
) {
  try {
    console.log(" Avaliando evento", eventoId, "com", valor, "estrelas");

    const novasAvaliacoes = [...avaliacoesAtuais, valor];

    const response = await fetch(`${API_URL}/eventos/${eventoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ratings: novasAvaliacoes }),
    });

    if (!response.ok) {
      throw new Error("Falha ao enviar avaliação.");
    }

    console.log("✅ Avaliação enviada com sucesso!");

    // Atualiza UI
    const media = Math.round(
      novasAvaliacoes.reduce((acc, val) => acc + val, 0) /
        novasAvaliacoes.length
    );
    const stars = starsContainer.querySelectorAll(".star");
    stars.forEach((star, index) => {
      star.classList.toggle("active", index < media);
    });

    // Atualiza texto
    const textoAvaliacao = document.getElementById(
      `texto-avaliacao-${eventoId}`
    );
    if (textoAvaliacao) {
      textoAvaliacao.textContent = `Média: ${media}/5  (${
        novasAvaliacoes.length
      } ${novasAvaliacoes.length === 1 ? "avaliação" : "avaliações"})`;
    }

    // Atualiza array local
    avaliacoesAtuais.push(valor);
  } catch (error) {
    console.error("❌ Erro ao avaliar:", error);
    alert("Erro ao salvar sua avaliação. Tente novamente.");
  }
}

/* ===========================================================
   SISTEMA DE COMENTÁRIOS
   =========================================================== */
function renderizarComentarios(container, comentarios, eventoId) {
  if (!container) return;

  if (comentarios.length === 0) {
    container.innerHTML =
      '<p class="sem-comentarios">💭 Seja o primeiro a comentar!</p>';
    return;
  }

  // Ordena por ID (mais recentes primeiro)
  try {
    comentarios.sort((a, b) => (b.id || 0) - (a.id || 0));
  } catch (e) {
    console.warn("Erro ao ordenar comentários", e);
  }

  container.innerHTML = comentarios
    .map((c) => {
      const comentarioId =
        c.id || `old_${c.nome.replace(/\s/g, "-")}_${c.data}`;
      const domId = String(comentarioId).replace(/['"]/g, "");

      return `
      <div class="comentario-item" id="comentario-item-${domId}">
        <div class="comentario-header">
          <span class="comentario-autor">👤 ${c.nome}</span>
          <span class="comentario-data">🕐 ${c.data}</span>
        </div>
        
        <div class="comentario-texto-wrapper" id="comentario-texto-wrapper-${domId}">
          <p class="comentario-texto">${c.texto}</p>
        </div>

        <div class="comentario-acoes" id="comentario-acoes-${domId}">
          <button class="btn-editar-comentario" onclick="editarComentario('${eventoId}', '${comentarioId}')">
            ✏️ Editar
          </button>
          <button class="btn-apagar-comentario" onclick="deletarComentario('${eventoId}', '${comentarioId}')">
            🗑️ Apagar
          </button>
        </div>
      </div>
    `;
    })
    .join("");
}

async function adicionarComentario(event, eventoId) {
  event.preventDefault();

  const form = event.target;
  const nome = form.querySelector(".input-nome").value.trim();
  const texto = form.querySelector(".textarea-comentario").value.trim();

  if (!nome || !texto) {
    alert("Por favor, preencha todos os campos.");
    return;
  }

  console.log(" Adicionando comentário ao evento:", eventoId);

  const agora = new Date();
  const dataFormatada =
    agora.toLocaleDateString("pt-BR") +
    " às " +
    agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const novoComentario = {
    id: Date.now(),
    nome,
    texto,
    data: dataFormatada,
  };

  try {
    // Busca comentários atuais
    const resGet = await fetch(`${API_URL}/eventos/${eventoId}`);
    if (!resGet.ok)
      throw new Error("Não foi possível buscar comentários atuais.");

    const evento = await resGet.json();
    const comentariosAtuais = evento.comments || [];
    const novosComentarios = [...comentariosAtuais, novoComentario];

    // Salva comentários
    const resPatch = await fetch(`${API_URL}/eventos/${eventoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comments: novosComentarios }),
    });

    if (!resPatch.ok) {
      throw new Error("Falha ao enviar comentário.");
    }

    console.log("✅ Comentário adicionado com sucesso!");

    // Atualiza UI
    const listaComentarios = document.getElementById(`comentarios-${eventoId}`);
    renderizarComentarios(listaComentarios, novosComentarios, eventoId);

    form.reset();
  } catch (error) {
    console.error("❌ Erro ao adicionar comentário:", error);
    alert("Erro ao salvar seu comentário. Tente novamente.");
  }
}

async function editarComentario(eventoId, comentarioId) {
  console.log("✏️ Editando comentário:", comentarioId);

  const domId = String(comentarioId).replace(/['"]/g, "");
  const wrapper = document.getElementById(`comentario-texto-wrapper-${domId}`);
  const acoes = document.getElementById(`comentario-acoes-${domId}`);

  if (!wrapper || !acoes) {
    console.error("❌ Elementos não encontrados para editar");
    return;
  }

  const textoAtual = wrapper.querySelector(".comentario-texto").innerText;

  wrapper.innerHTML = `
    <textarea class="textarea-comentario-edit" id="textarea-edit-${domId}">${textoAtual}</textarea>
  `;

  acoes.innerHTML = `
    <button class="btn-salvar-edicao" onclick="salvarEdicao('${eventoId}', '${comentarioId}')">
      ✓ Salvar
    </button>
    <button class="btn-cancelar-edicao" onclick="cancelarEdicao('${eventoId}')">
      × Cancelar
    </button>
  `;
}

async function salvarEdicao(eventoId, comentarioId) {
  console.log("💾 Salvando edição do comentário:", comentarioId);

  const domId = String(comentarioId).replace(/['"]/g, "");
  const textarea = document.getElementById(`textarea-edit-${domId}`);
  const novoTexto = textarea.value.trim();

  if (!novoTexto) {
    alert("O comentário não pode ficar vazio.");
    return;
  }

  try {
    const resGet = await fetch(`${API_URL}/eventos/${eventoId}`);
    if (!resGet.ok) throw new Error("Não foi possível buscar o evento.");

    const evento = await resGet.json();
    const comentariosAtuais = evento.comments || [];

    // Atualiza o comentário
    const novosComentarios = comentariosAtuais.map((c) => {
      const idParaChecar = c.id
        ? c.id
        : `old_${c.nome.replace(/\s/g, "-")}_${c.data}`;
      if (String(idParaChecar) === String(comentarioId)) {
        c.texto = novoTexto;
      }
      return c;
    });

    const resPatch = await fetch(`${API_URL}/eventos/${eventoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comments: novosComentarios }),
    });

    if (!resPatch.ok) {
      throw new Error("Falha ao salvar a edição.");
    }

    console.log("✅ Edição salva com sucesso!");

    // Atualiza UI
    const listaComentarios = document.getElementById(`comentarios-${eventoId}`);
    renderizarComentarios(listaComentarios, novosComentarios, eventoId);
  } catch (error) {
    console.error("❌ Erro ao salvar edição:", error);
    alert("Erro ao salvar sua edição. Tente novamente.");
  }
}

async function cancelarEdicao(eventoId) {
  console.log("❌ Cancelando edição");

  try {
    const resGet = await fetch(`${API_URL}/eventos/${eventoId}`);
    if (!resGet.ok) throw new Error("Não foi possível buscar o evento.");

    const evento = await resGet.json();

    const listaComentarios = document.getElementById(`comentarios-${eventoId}`);
    renderizarComentarios(listaComentarios, evento.comments || [], eventoId);
  } catch (error) {
    console.error("❌ Erro ao cancelar edição:", error);
    alert("Erro ao recarregar comentários.");
  }
}

async function deletarComentario(eventoId, comentarioId) {
  if (!confirm("Tem certeza que deseja deletar este comentário?")) {
    return;
  }

  console.log("🗑️ Deletando comentário:", comentarioId);

  try {
    const resGet = await fetch(`${API_URL}/eventos/${eventoId}`);
    if (!resGet.ok) throw new Error("Não foi possível buscar o evento.");

    const evento = await resGet.json();
    const comentariosAtuais = evento.comments || [];

    // Remove o comentário
    const novosComentarios = comentariosAtuais.filter((c) => {
      const idParaChecar = c.id
        ? c.id
        : `old_${c.nome.replace(/\s/g, "-")}_${c.data}`;
      return String(idParaChecar) !== String(comentarioId);
    });

    const resPatch = await fetch(`${API_URL}/eventos/${eventoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comments: novosComentarios }),
    });

    if (!resPatch.ok) {
      throw new Error("Falha ao deletar o comentário.");
    }

    console.log("✅ Comentário deletado com sucesso!");

    // Atualiza UI
    const listaComentarios = document.getElementById(`comentarios-${eventoId}`);
    renderizarComentarios(listaComentarios, novosComentarios, eventoId);
  } catch (error) {
    console.error("❌ Erro ao deletar comentário:", error);
    alert("Erro ao deletar seu comentário. Tente novamente.");
  }
}

/* ===========================================================
   NOVA FUNCIONALIDADE: DELETAR E ATUALIZAR EVENTOS
   =========================================================== */

// 1. Função para EXCLUIR o evento inteiro
async function deletarEvento(id) {
  if (
    !confirm(
      "⚠️ Tem certeza que deseja excluir este evento permanentemente?\nEsta ação não pode ser desfeita."
    )
  ) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/eventos/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      alert("Evento excluído com sucesso!");
      document.querySelector(".modal-overlay").remove(); // Fecha modal
      carregarEventos(); // Recarrega a lista
    } else {
      throw new Error("Erro ao excluir no servidor.");
    }
  } catch (error) {
    console.error(error);
    alert("Erro ao excluir o evento.");
  }
}

// 2. Função para HABILITAR O MODO DE EDIÇÃO (Transforma texto em input)
async function habilitarEdicaoEvento(id) {
  // Pega os elementos atuais
  const tituloEl = document.getElementById(`titulo-detalhe-${id}`);
  const descEl = document.getElementById(`desc-detalhe-${id}`);
  const localEl = document.getElementById(`local-detalhe-${id}`);

  // Salva valores atuais
  const tituloAtual = tituloEl.innerText;
  const descAtual = descEl.innerText;
  const localAtual = localEl.innerText;

  // Substitui por inputs
  tituloEl.innerHTML = `<input type="text" id="edit-titulo-${id}" class="input-edit-evento" value="${tituloAtual}">`;
  descEl.innerHTML = `<textarea id="edit-desc-${id}" class="textarea-edit-evento" rows="5">${descAtual}</textarea>`;
  localEl.innerHTML = `<input type="text" id="edit-local-${id}" class="input-edit-evento" value="${localAtual}">`;

  // Altera os botões de ação para Salvar/Cancelar
  const containerAcoes = document.querySelector(".evento-acoes-admin");
  containerAcoes.innerHTML = `
    <button class="btn-salvar-evento" onclick="salvarEdicaoEvento('${id}')">
      💾 Salvar Alterações
    </button>
    <button class="btn-cancelar-evento" onclick="document.querySelector('.modal-overlay').remove(); mostrarDetalhes(document.querySelector('[data-id=\\u0022${id}\\u0022]'))">
      ❌ Cancelar
    </button>
  `;
}

// 3. Função para SALVAR AS ALTERAÇÕES (PATCH)
async function salvarEdicaoEvento(id) {
  const novoTitulo = document.getElementById(`edit-titulo-${id}`).value;
  const novaDesc = document.getElementById(`edit-desc-${id}`).value;
  const novoLocal = document.getElementById(`edit-local-${id}`).value;

  if (!novoTitulo || !novaDesc) {
    alert("Título e Descrição são obrigatórios.");
    return;
  }

  try {
    const dadosAtualizados = {
      "nome-evento": novoTitulo, // Atualiza para manter compatibilidade com seu JSON
      titulo: novoTitulo,
      "descricao-comp": novaDesc,
      descricao: novaDesc,
      "local-evento": novoLocal,
      local: novoLocal,
    };

    const response = await fetch(`${API_URL}/eventos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosAtualizados),
    });

    if (response.ok) {
      alert("Evento atualizado com sucesso!");
      document.querySelector(".modal-overlay").remove(); // Fecha modal
      carregarEventos(); // Recarrega a lista para mostrar novos dados

      // Reabre o modal com os dados novos (opcional, ou apenas recarrega a lista)
      setTimeout(() => {
        // Precisamos encontrar o card novo para reabrir o modal,
        // mas como recarregamos a lista, é mais seguro deixar o usuário clicar de novo
        // ou apenas fechar o modal.
      }, 500);
    } else {
      throw new Error("Erro ao atualizar.");
    }
  } catch (error) {
    console.error(error);
    alert("Erro ao salvar alterações.");
  }
}

/* ===========================================================
   FUNÇÕES AUXILIARES
   =========================================================== */
function formatarData(dataString) {
  if (!dataString) return "Data não informada";

  try {
    const data = new Date(dataString + "T00:00:00");
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (e) {
    return dataString;
  }
}
