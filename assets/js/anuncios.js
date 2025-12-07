// URL base da API Replit
const API_URL = "https://cc20c04c-918d-4941-adea-327d532368d2-00-3p832i6nen4dl.riker.replit.dev";

/* ===========================================================
   FUNÇÕES AUXILIARES
   =========================================================== */

function getURLParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  const value = urlParams.get(param);
  console.log(`📌 Parâmetro '${param}' da URL:`, value);
  return value ? parseInt(value) : null;
}

function getPaginaAtual() {
  const path = window.location.pathname;
  console.log('=== Detectando página ===');
  console.log('Caminho completo:', path);
  
  if (path.includes('anuncios.html')) {
    console.log('Página detectada: ANUNCIOS');
    return 'anuncios';
  }
  if (path.includes('perfil-animal.html')) {
    console.log('Página detectada: PERFIL');
    return 'perfil';
  }
  
  console.log('Página NÃO reconhecida');
  return null;
}

/* ===========================================================
   MÓDULO: ANÚNCIOS (lista de animais)
   =========================================================== */

const Anuncios = {
  lista: null,
  filtroTipo: null,
  filtroIdade: null,
  filtroPorte: null,
  btnBuscar: null,
  animais: [],

  init() {
    console.log('=== ANÚNCIOS: Iniciando ===');
    
    this.lista = document.getElementById("lista-animais");
    this.filtroTipo = document.getElementById("filtro-tipo");
    this.filtroIdade = document.getElementById("filtro-idade");
    this.filtroPorte = document.getElementById("filtro-porte");
    this.btnBuscar = document.getElementById("btn-buscar");
    
    if (!this.lista) {
      console.error('❌ Elemento lista-animais não encontrado!');
      return;
    }

    console.log('✅ Elementos encontrados, carregando animais...');
    this.carregarAnimais();
    this.configurarFiltros();
  },

  async carregarAnimais() {
    try {
      const url = `${API_URL}/animais`;
      console.log("📄 Buscando dados em:", url);

      const response = await fetch(url);
      console.log("📡 Status da resposta:", response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log("📦 Dados recebidos (tipo):", typeof data);
      console.log("📦 Dados recebidos (conteúdo):", data);

      // Verifica se é um array direto ou se tem a propriedade "animais"
      if (Array.isArray(data)) {
        this.animais = data;
        console.log("✅ Dados são array direto");
      } else if (data.animais && Array.isArray(data.animais)) {
        this.animais = data.animais;
        console.log("✅ Dados têm propriedade 'animais'");
      } else {
        this.animais = [];
        console.warn("⚠️ Formato de dados não reconhecido");
      }

      console.log("✅ Total de animais:", this.animais.length);
      console.log("📋 Animais:", this.animais);
      this.renderizarCards(this.animais);
    } catch (erro) {
      console.error("❌ ERRO AO BUSCAR:", erro);
      this.lista.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading">Erro ao carregar os animais</h4>
            <p>Não foi possível conectar ao servidor.</p>
            <hr>
            <p class="mb-0"><strong>Erro:</strong> ${erro.message}</p>
            <p class="mb-0">Verifique:</p>
            <ul>
              <li>Se o servidor Replit está rodando</li>
              <li>Se a URL está correta: <code>${API_URL}/animais</code></li>
              <li>O console do navegador (F12) para mais detalhes</li>
            </ul>
          </div>
        </div>
      `;
    }
  },

  renderizarCards(listaAnimais) {
    this.lista.innerHTML = "";

    if (!listaAnimais || listaAnimais.length === 0) {
      this.lista.innerHTML = `
        <div class="col-12">
          <div class="alert alert-info text-center" role="alert">
            <i class="bi bi-info-circle fs-1"></i>
            <p class="mt-3 mb-0">Nenhum animal encontrado com os filtros selecionados.</p>
          </div>
        </div>
      `;
      return;
    }

    listaAnimais.forEach((animal) => {
      const vacinadoIcon = animal.vacinado === "Sim" ? '✅' : '❌';
      const castradoIcon = animal.castrado === "Sim" ? '✅' : '❌';
      
      // Usa 'imagem' ou 'foto' dependendo do que está disponível
      const imagemUrl = animal.imagem || animal.foto || 'https://via.placeholder.com/400x250?text=Sem+Imagem';

      const cardHTML = `
        <div class="col-md-6 col-lg-4">
          <div class="card h-100 shadow-sm animal-card">
            <img src="${imagemUrl}" class="card-img-top"
                 onerror="this.src='https://via.placeholder.com/400x250?text=Sem+Imagem'"
                 alt="${animal.nome}"
                 style="height: 250px; object-fit: cover;">

            <div class="card-body d-flex flex-column">
              <h5 class="fw-bold" style="color:#751a24;">${animal.nome}</h5>

              <p class="text-muted small">
                <strong>Raça:</strong> ${animal.raca}<br>
                <strong>Idade:</strong> ${animal.idade}<br>
                <strong>Porte:</strong> ${animal.porte || 'Não informado'}
              </p>

              <div class="mb-2">
                <span class="badge bg-success me-1">${vacinadoIcon} Vacinado</span>
                <span class="badge bg-info text-dark">${castradoIcon} Castrado</span>
              </div>

              <p class="text-muted flex-grow-1" style="font-size:0.9rem;">
                ${animal.resumo || animal.descricao || "Sem descrição disponível."}
              </p>

              <a href="perfil-animal.html?id=${animal.id}"
                 class="btn mt-auto w-100"
                 style="background:#751a24; color:white;">
                 Ver perfil completo
              </a>
            </div>
          </div>
        </div>
      `;

      this.lista.innerHTML += cardHTML;
    });

    console.log(`✅ ${listaAnimais.length} cards renderizados`);
  },

  configurarFiltros() {
    if (this.btnBuscar) {
      this.btnBuscar.addEventListener("click", () => this.aplicarFiltros());
    }

    // Permite filtrar ao pressionar Enter nos campos
    [this.filtroTipo, this.filtroIdade, this.filtroPorte].forEach((filtro) => {
      if (filtro) {
        filtro.addEventListener("keypress", (e) => {
          if (e.key === "Enter") this.aplicarFiltros();
        });
      }
    });
  },

  aplicarFiltros() {
    let filtrados = this.animais;

    const tipo = this.filtroTipo ? this.filtroTipo.value.toLowerCase().trim() : '';
    const idade = this.filtroIdade ? this.filtroIdade.value.toLowerCase().trim() : '';
    const porte = this.filtroPorte ? this.filtroPorte.value.toLowerCase().trim() : '';

    console.log("🔍 Aplicando filtros:", { tipo, idade, porte });

    // Filtro por raça
    if (tipo) {
      filtrados = filtrados.filter((a) => a.raca.toLowerCase().includes(tipo));
    }

    // Filtro por idade
    if (idade) {
      filtrados = filtrados.filter((a) => a.idade.toLowerCase().includes(idade));
    }

    // Filtro por porte
    if (porte) {
      filtrados = filtrados.filter((a) => a.porte && a.porte.toLowerCase() === porte);
    }

    console.log(`✅ ${filtrados.length} animais após filtros`);
    this.renderizarCards(filtrados);
  }
};

/* ===========================================================
   MÓDULO: PERFIL ANIMAL (página de detalhes)
   =========================================================== */

const PerfilAnimal = {
  animalId: null,
  todosAnimais: [],

  init() {
    console.log('=== PERFIL ANIMAL: Iniciando ===');
    console.log('🌐 URL completa:', window.location.href);
    console.log('🔗 Search params:', window.location.search);
    
    this.animalId = getURLParam('id');
    console.log('🆔 Animal ID da URL:', this.animalId, '(tipo:', typeof this.animalId, ')');
    
    if (!this.animalId) {
      console.error('❌ Animal ID não encontrado na URL!');
      alert('Animal não encontrado! Redirecionando para a lista de anúncios.');
      window.location.href = 'anuncios.html';
      return;
    }

    console.log('✅ Carregando dados do animal ID:', this.animalId);
    this.carregarAnimal();
  },

  async carregarAnimal() {
    console.log('=== TENTATIVA 1: Buscar animal específico ===');
    const urlEspecifico = `${API_URL}/animais/${this.animalId}`;
    console.log('📡 URL da requisição:', urlEspecifico);
    
    try {
      const response = await fetch(urlEspecifico);
      console.log('📡 Status da resposta:', response.status, response.statusText);
      
      if (response.ok) {
        const animal = await response.json();
        console.log('✅ Animal carregado (específico):', animal);
        this.exibirAnimal(animal);
        return;
      }
      
      console.warn('⚠️ Endpoint específico não funcionou, tentando buscar todos...');
    } catch (error) {
      console.warn('⚠️ Erro no endpoint específico:', error.message);
    }

    // PLANO B: Buscar todos os animais e filtrar
    console.log('=== TENTATIVA 2: Buscar todos e filtrar ===');
    try {
      const urlTodos = `${API_URL}/animais`;
      console.log('📡 URL da requisição (todos):', urlTodos);
      
      const response = await fetch(urlTodos);
      console.log('📡 Status da resposta:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Dados recebidos (tipo):', typeof data);
      console.log('📦 Dados recebidos:', data);

      // Identifica a estrutura dos dados
      if (Array.isArray(data)) {
        this.todosAnimais = data;
      } else if (data.animais && Array.isArray(data.animais)) {
        this.todosAnimais = data.animais;
      } else {
        throw new Error('Formato de dados não reconhecido');
      }

      console.log('📋 Total de animais disponíveis:', this.todosAnimais.length);
      console.log('🔍 Procurando animal com ID:', this.animalId);

      // Busca o animal pelo ID
      const animal = this.todosAnimais.find(a => {
        console.log(`   Comparando: ${a.id} (${typeof a.id}) === ${this.animalId} (${typeof this.animalId})`);
        return a.id == this.animalId; // usa == para comparar número com string
      });

      if (!animal) {
        console.error('❌ Animal não encontrado na lista!');
        console.log('📋 IDs disponíveis:', this.todosAnimais.map(a => a.id));
        throw new Error('Animal não encontrado');
      }

      console.log('✅ Animal encontrado:', animal);
      this.exibirAnimal(animal);

    } catch (error) {
      console.error('❌ ERRO ao carregar animal:', error);
      alert(`Erro ao carregar informações do animal.\n\nDetalhes: ${error.message}\n\nVerifique o console (F12) para mais informações.`);
      
      // Aguarda 3 segundos antes de redirecionar
      setTimeout(() => {
        window.location.href = 'anuncios.html';
      }, 3000);
    }
  },

  exibirAnimal(animal) {
    console.log('=== EXIBINDO ANIMAL ===');
    console.log('Animal recebido:', animal);

    // Atualiza título da página
    document.title = `${animal.nome} - MagisPet`;

    // Foto do animal
    const foto = document.getElementById('animal-foto');
    if (foto) {
      const imagemUrl = animal.imagem || animal.foto || 'assets/img/cachorro.jpg';
      foto.src = imagemUrl;
      foto.alt = animal.nome;
      console.log('✅ Foto atualizada:', imagemUrl);
    } else {
      console.warn('⚠️ Elemento animal-foto não encontrado');
    }

    // Nome e tipo
    this.atualizarElemento('animal-nome', animal.nome);
    this.atualizarElemento('animal-tipo', animal.tipo || animal.raca || 'Não informado');
    
    // Badge de porte
    const porteBadge = document.getElementById('animal-porte');
    if (porteBadge) {
      porteBadge.textContent = animal.porte || 'Não informado';
      porteBadge.className = 'badge text-dark';
      
      if (animal.porte) {
        const porteNormalizado = animal.porte.toLowerCase();
        if (porteNormalizado === 'pequeno') {
          porteBadge.classList.add('bg-info');
        } else if (porteNormalizado.includes('medio') || porteNormalizado.includes('médio')) {
          porteBadge.classList.add('bg-warning');
        } else if (porteNormalizado === 'grande') {
          porteBadge.classList.add('bg-success');
        }
      }
      console.log('✅ Badge de porte atualizada');
    }

    // Informações detalhadas
    this.atualizarElemento('animal-raca', animal.raca || 'Não informado');
    this.atualizarElemento('animal-idade', animal.idade || 'Não informado');
    this.atualizarElemento('animal-sexo', animal.sexo || 'Não informado');
    this.atualizarElemento('animal-porte-texto', animal.porte || 'Não informado');
    
    // Vacinado e Castrado
    const vacinadoTexto = (animal.vacinado === "Sim" || animal.vacinado === true) ? '✅ Sim' : '❌ Não';
    const castradoTexto = (animal.castrado === "Sim" || animal.castrado === true) ? '✅ Sim' : '❌ Não';
    
    this.atualizarElemento('animal-vacinado', vacinadoTexto);
    this.atualizarElemento('animal-castrado', castradoTexto);
    
    // Descrição
    const descricao = animal.resumo || animal.descricao || 'Nenhuma descrição disponível.';
    this.atualizarElemento('animal-descricao', descricao);

    console.log('✅ Todas as informações foram atualizadas');

    // Botão de chat
    const btnChat = document.getElementById('btn-chat');
    if (btnChat) {
      console.log('✅ Configurando botão de chat para animal ID:', this.animalId);
      
      // Remove listeners antigos
      const novoBotao = btnChat.cloneNode(true);
      btnChat.parentNode.replaceChild(novoBotao, btnChat);
      
      // Adiciona novo listener
      novoBotao.addEventListener('click', () => {
        console.log('🖱️ Botão clicado! Redirecionando para chat do animal:', this.animalId);
        window.location.href = `chat.html?animal=${this.animalId}`;
      });
    } else {
      console.error('❌ Botão btn-chat não encontrado!');
    }
  },

  atualizarElemento(id, conteudo) {
    const elemento = document.getElementById(id);
    if (elemento) {
      elemento.textContent = conteudo;
      console.log(`   ✓ ${id}:`, conteudo);
    } else {
      console.warn(`   ⚠️ Elemento #${id} não encontrado`);
    }
  }
};

/* ===========================================================
   INICIALIZAÇÃO AUTOMÁTICA
   =========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 DOM carregado, iniciando aplicação...');
  
  const paginaAtual = getPaginaAtual();
  console.log('📄 Página atual:', paginaAtual);

  switch(paginaAtual) {
    case 'anuncios':
      console.log('▶️ Inicializando módulo ANÚNCIOS');
      Anuncios.init();
      break;
    case 'perfil':
      console.log('▶️ Inicializando módulo PERFIL');
      PerfilAnimal.init();
      break;
    default:
      console.log('ℹ️ Página não reconhecida ou não requer inicialização');
  }
});