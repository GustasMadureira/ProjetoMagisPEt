
const API_URL = 'https://f205a374-83ff-4f99-baa7-36e70268cfa4-00-2nt9kx0jth380.spock.replit.dev';




function getURLParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  const value = urlParams.get(param);
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
  if (path.includes('chat.html')) {
    console.log('Página detectada: CHAT');
    return 'chat';
  }
  
  console.log('Página NÃO reconhecida');
  return null;
}



const Anuncios = {
  container: null,

  init() {
    console.log('=== ANÚNCIOS: Iniciando ===');
    this.container = document.getElementById('animais-container');
    
    if (!this.container) {
      console.error('Container animais-container não encontrado!');
      return;
    }

    console.log('Container encontrado, carregando animais...');
    this.carregarAnimais();
    this.configurarFiltros();
  },

  async carregarAnimais() {
    try {
      const response = await fetch(`${API_URL}/animais`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar animais');
      }

      const animais = await response.json();
      console.log('Animais carregados:', animais);
      
      this.renderizarAnimais(animais);
    } catch (error) {
      console.error('Erro ao carregar animais:', error);
      this.container.innerHTML = `
        <div class="col-12 text-center">
          <p class="text-danger">Erro ao carregar os animais. Tente novamente mais tarde.</p>
        </div>
      `;
    }
  },

  renderizarAnimais(animais) {
    if (animais.length === 0) {
      this.container.innerHTML = `
        <div class="col-12 text-center">
          <p class="text-muted">Nenhum animal disponível para adoção no momento.</p>
        </div>
      `;
      return;
    }

    this.container.innerHTML = '';

    animais.forEach(animal => {
      const card = this.criarCardAnimal(animal);
      this.container.appendChild(card);
    });
  },

  criarCardAnimal(animal) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';

    const vacinadoIcon = animal.vacinado ? '✅' : '❌';
    const castradoIcon = animal.castrado ? '✅' : '❌';

    col.innerHTML = `
      <div class="card h-100 shadow-sm animal-card" style="cursor: pointer; transition: transform 0.3s ease;">
        <img src="${animal.foto}" class="card-img-top" alt="${animal.nome}" 
             style="height: 250px; object-fit: cover;"
             onerror="this.src='assets/img/placeholder.jpg'">
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h5 class="card-title fw-bold mb-0" style="color: #751a24;">${animal.nome}</h5>
            <span class="badge" style="background-color: #751a24;">${animal.tipo}</span>
          </div>
          
          <p class="card-text text-muted small mb-2">
            <strong>Raça:</strong> ${animal.raca}<br>
            <strong>Idade:</strong> ${animal.idade}<br>
            <strong>Porte:</strong> ${animal.porte || 'Não informado'}
          </p>

          <div class="mb-3">
            <span class="badge bg-success me-1">${vacinadoIcon} Vacinado</span>
            <span class="badge bg-info text-dark">${castradoIcon} Castrado</span>
          </div>

          <p class="card-text text-muted flex-grow-1" style="font-size: 0.9rem;">
            ${animal.descricao ? animal.descricao.substring(0, 80) + '...' : 'Sem descrição'}
          </p>

          <button class="btn w-100 mt-auto btn-ver-perfil" 
                  style="background-color: #751a24; color: white; border: none;"
                  data-animal-id="${animal.id}">
            Ver perfil completo
          </button>
        </div>
      </div>
    `;

    
    const btnPerfil = col.querySelector('.btn-ver-perfil');
    btnPerfil.addEventListener('click', (e) => {
      e.preventDefault();
      const animalId = e.target.dataset.animalId;
      console.log('Clicou para ver perfil do animal ID:', animalId);
      window.location.href = `perfil-animal.html?animal=${animalId}`;
    });

    
    const cardElement = col.querySelector('.animal-card');
    cardElement.addEventListener('mouseenter', () => {
      cardElement.style.transform = 'translateY(-10px)';
      cardElement.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
    });
    
    cardElement.addEventListener('mouseleave', () => {
      cardElement.style.transform = 'translateY(0)';
      cardElement.style.boxShadow = '';
    });

    return col;
  },

  configurarFiltros() {
    const btnFiltro = document.querySelector('.filter-bar button');
    if (btnFiltro) {
      btnFiltro.addEventListener('click', () => this.aplicarFiltros());
    }
  },

  aplicarFiltros() {
    
    console.log('Filtros aplicados');
  }
};



const PerfilAnimal = {
  animalId: null,

  init() {
    console.log('=== PERFIL ANIMAL: Iniciando ===');
    this.animalId = getURLParam('animal');
    console.log('Animal ID da URL:', this.animalId);
    
    if (!this.animalId) {
      console.error('Animal ID não encontrado na URL!');
      alert('Animal não encontrado!');
      window.location.href = 'anuncios.html';
      return;
    }

    console.log('Carregando dados do animal ID:', this.animalId);
    this.carregarAnimal();
  },

  async carregarAnimal() {
    console.log('=== Carregando animal da API ===');
    console.log('URL da requisição:', `${API_URL}/animais/${this.animalId}`);
    
    try {
      const response = await fetch(`${API_URL}/animais/${this.animalId}`);
      console.log('Status da resposta:', response.status);
      
      if (!response.ok) {
        throw new Error('Animal não encontrado');
      }

      const animal = await response.json();
      console.log('Animal carregado com sucesso:', animal);
      
      this.exibirAnimal(animal);
    } catch (error) {
      console.error('ERRO ao carregar animal:', error);
      alert('Erro ao carregar informações do animal.');
      window.location.href = 'anuncios.html';
    }
  },

  exibirAnimal(animal) {
    
    document.title = `${animal.nome} - MagisPet`;

    
    const foto = document.getElementById('animal-foto');
    if (foto) {
      foto.src = animal.foto;
      foto.alt = animal.nome;
    }

    
    this.atualizarElemento('animal-nome', animal.nome);
    this.atualizarElemento('animal-tipo', animal.tipo);
    
    
    const porteBadge = document.getElementById('animal-porte');
    if (porteBadge) {
      porteBadge.textContent = animal.porte || 'Não informado';
      porteBadge.className = 'badge text-dark';
      
      if (animal.porte) {
        if (animal.porte.toLowerCase() === 'pequeno') {
          porteBadge.classList.add('bg-info');
        } else if (animal.porte.toLowerCase() === 'medio') {
          porteBadge.classList.add('bg-warning');
        } else {
          porteBadge.classList.add('bg-success');
        }
      }
    }

   
    this.atualizarElemento('animal-raca', animal.raca || 'Não informado');
    this.atualizarElemento('animal-idade', animal.idade || 'Não informado');
    this.atualizarElemento('animal-sexo', animal.sexo || 'Não informado');
    this.atualizarElemento('animal-porte-texto', animal.porte || 'Não informado');
    this.atualizarElemento('animal-vacinado', animal.vacinado ? '✅ Sim' : '❌ Não');
    this.atualizarElemento('animal-castrado', animal.castrado ? '✅ Sim' : '❌ Não');
    this.atualizarElemento('animal-descricao', animal.descricao || 'Nenhuma descrição disponível.');

    
    const btnChat = document.getElementById('btn-chat');
    if (btnChat) {
      console.log('Configurando botão de chat para animal ID:', this.animalId);
      btnChat.addEventListener('click', () => {
        console.log('Botão clicado! Redirecionando para chat do animal:', this.animalId);
        window.location.href = `chat.html?animal=${this.animalId}`;
      });
    } else {
      console.error('Botão btn-chat não encontrado!');
    }
  },

  atualizarElemento(id, conteudo) {
    const elemento = document.getElementById(id);
    if (elemento) {
      elemento.textContent = conteudo;
    }
  }
};



const Chat = {
  mensagens: [],
  editandoMensagemId: null,
  usuarioAtualId: 1,
  animalAtualId: null,
  messageList: null,
  messageForm: null,
  messageInput: null,
  sendButton: null,
  intervalId: null,

  init() {
    this.animalAtualId = getURLParam('animal');
    
    if (!this.animalAtualId) {
      this.animalAtualId = 1; 
    }

    this.messageList = document.getElementById('message-list');
    this.messageForm = document.getElementById('message-form');
    this.messageInput = document.getElementById('message-input');
    this.sendButton = document.getElementById('send-button');

    if (!this.messageList || !this.messageForm) return;

    console.log('Animal ID atual:', this.animalAtualId);
    
    this.carregarInfoAnimal();
    this.carregarMensagens();
    this.configurarEventos();
    
    
    this.intervalId = setInterval(() => this.carregarMensagens(), 5000);
  },

  

  async carregarInfoAnimal() {
    try {
      const response = await fetch(`${API_URL}/animais/${this.animalAtualId}`);
      
      if (response.ok) {
        const animal = await response.json();
        
        const nomeElement = document.querySelector('.chat-header-info h2 strong');
        if (nomeElement && animal.nome) {
          nomeElement.textContent = animal.nome;
        }
        
        const avatarElement = document.querySelector('.chat-avatar');
        if (avatarElement && animal.foto) {
          avatarElement.src = animal.foto;
          avatarElement.alt = animal.nome;
        }
      }
    } catch (error) {
      console.log('Usando informações padrão do animal');
    }
  },

  

  async criarMensagem(mensagemTexto) {
    try {
      const novaMensagem = {
        animal_id: this.animalAtualId,
        usuario_id: this.usuarioAtualId,
        mensagem: mensagemTexto,
        data_criacao: new Date().toISOString()
      };

      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaMensagem)
      });

      if (!response.ok) throw new Error('Erro ao criar mensagem');

      const mensagemCriada = await response.json();
      return mensagemCriada;
    } catch (error) {
      console.error('Erro ao criar mensagem:', error);
      alert('Erro ao enviar mensagem. Tente novamente.');
      return null;
    }
  },

  async carregarMensagens() {
    try {
      console.log('Carregando mensagens...');
      const response = await fetch(`${API_URL}/chat`);
      
      if (!response.ok) throw new Error('Erro ao carregar mensagens');

      const data = await response.json();
      console.log('Dados recebidos:', data);
      
      this.mensagens = Array.isArray(data) ? data : data.chat || [];
      console.log('Total de mensagens:', this.mensagens.length);
      
      this.mensagens = this.mensagens.filter(msg => msg.animal_id === this.animalAtualId);
      console.log('Mensagens filtradas (animal_id=' + this.animalAtualId + '):', this.mensagens.length);
      
      this.renderizarMensagens();
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      if (this.messageList) {
        this.messageList.innerHTML = '<p style="text-align: center; color: #999;">Erro ao carregar mensagens.</p>';
      }
    }
  },

  async atualizarMensagem(chatId, novoTexto) {
    try {
      console.log('Atualizando mensagem ID:', chatId, 'Novo texto:', novoTexto);
      
      const mensagemAtualizada = {
        mensagem: novoTexto,
        data_atualizacao: new Date().toISOString()
      };

      const url = `${API_URL}/chat/${chatId}`;
      console.log('URL da requisição:', url);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mensagemAtualizada)
      });

      console.log('Status da resposta:', response.status);

      if (!response.ok) throw new Error('Erro ao atualizar mensagem');

      const resultado = await response.json();
      console.log('Mensagem atualizada com sucesso:', resultado);
      return resultado;
    } catch (error) {
      console.error('Erro ao atualizar mensagem:', error);
      alert('Erro ao editar mensagem. Tente novamente.');
      return null;
    }
  },

  async deletarMensagem(chatId) {
    try {
      console.log('Deletando mensagem ID:', chatId);
      
      const url = `${API_URL}/chat/${chatId}`;
      console.log('URL da requisição:', url);
      
      const response = await fetch(url, { method: 'DELETE' });

      console.log('Status da resposta:', response.status);

      if (!response.ok) throw new Error('Erro ao deletar mensagem');

      console.log('Mensagem deletada com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao deletar mensagem:', error);
      alert('Erro ao excluir mensagem. Tente novamente.');
      return false;
    }
  },

  

  renderizarMensagens() {
    this.messageList.innerHTML = '';

    if (this.mensagens.length === 0) {
      this.messageList.innerHTML = '<p style="text-align: center; color: #999; margin-top: 20px;">Nenhuma mensagem ainda. Seja o primeiro a conversar!</p>';
      return;
    }

    this.mensagens.forEach(msg => {
      const messageDiv = this.criarElementoMensagem(msg);
      this.messageList.appendChild(messageDiv);
    });

    this.messageList.scrollTop = this.messageList.scrollHeight;
  },

  criarElementoMensagem(msg) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${msg.usuario_id === this.usuarioAtualId ? 'sent' : 'received'}`;
    const msgId = msg.id || msg.chat_id;
    messageDiv.dataset.chatId = msgId;

    const messageParagraph = document.createElement('p');
    messageParagraph.textContent = msg.mensagem;
    messageDiv.appendChild(messageParagraph);

    if (msg.usuario_id === this.usuarioAtualId) {
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'message-actions';

      const editButton = document.createElement('button');
      editButton.className = 'btn-edit';
      editButton.title = 'Editar mensagem';
      editButton.onclick = (e) => {
        e.preventDefault();
        console.log('Editando mensagem ID:', msgId);
        this.iniciarEdicao(msgId, msg.mensagem);
      };

      const deleteButton = document.createElement('button');
      deleteButton.className = 'btn-delete';
      deleteButton.title = 'Excluir mensagem';
      deleteButton.onclick = (e) => {
        e.preventDefault();
        console.log('Excluindo mensagem ID:', msgId);
        this.confirmarExclusao(msgId);
      };

      actionsDiv.appendChild(editButton);
      actionsDiv.appendChild(deleteButton);
      messageDiv.appendChild(actionsDiv);
    }

    return messageDiv;
  },

  

  iniciarEdicao(chatId, mensagemTexto) {
    this.editandoMensagemId = chatId;
    this.messageInput.value = mensagemTexto;
    this.messageInput.focus();
    
    this.sendButton.innerHTML = 'Salvar ✓';
    this.sendButton.style.backgroundColor = '#007bff';
    
    document.querySelectorAll('.message').forEach(msg => {
      msg.classList.remove('editing');
    });
    
    const mensagemEditando = document.querySelector(`[data-chat-id="${chatId}"]`);
    if (mensagemEditando) {
      mensagemEditando.classList.add('editing');
      mensagemEditando.style.opacity = '0.6';
    }
  },

  cancelarEdicao() {
    this.editandoMensagemId = null;
    this.messageInput.value = '';
    this.sendButton.innerHTML = 'Enviar <i class="fas fa-paper-plane"></i>';
    this.sendButton.style.backgroundColor = '#751a24';
    
    document.querySelectorAll('.message').forEach(msg => {
      msg.classList.remove('editing');
      msg.style.opacity = '1';
    });
  },

  confirmarExclusao(chatId) {
    if (confirm('Tem certeza que deseja excluir esta mensagem?')) {
      this.excluirMensagem(chatId);
    }
  },

  async excluirMensagem(chatId) {
    const sucesso = await this.deletarMensagem(chatId);
    
    if (sucesso) {
      const mensagemElement = document.querySelector(`[data-chat-id="${chatId}"]`);
      if (mensagemElement) {
        mensagemElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        mensagemElement.style.opacity = '0';
        mensagemElement.style.transform = 'translateX(20px)';
        
        setTimeout(() => {
          this.carregarMensagens();
        }, 300);
      }
    }
  },

  

  configurarEventos() {
    this.messageForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const mensagemTexto = this.messageInput.value.trim();
      
      if (!mensagemTexto) {
        alert('Por favor, digite uma mensagem!');
        return;
      }

      this.sendButton.disabled = true;
      const textoOriginal = this.sendButton.innerHTML;
      this.sendButton.innerHTML = 'Enviando...';

      try {
        if (this.editandoMensagemId) {
          const sucesso = await this.atualizarMensagem(this.editandoMensagemId, mensagemTexto);
          
          if (sucesso) {
            this.cancelarEdicao();
            this.messageInput.value = '';
            setTimeout(() => this.carregarMensagens(), 500);
          }
        } else {
          const novaMensagem = await this.criarMensagem(mensagemTexto);
          
          if (novaMensagem) {
            this.messageInput.value = '';
            setTimeout(() => this.carregarMensagens(), 500);
          }
        }
      } catch (error) {
        console.error('Erro ao processar mensagem:', error);
        alert('Erro ao processar mensagem. Tente novamente.');
      } finally {
        this.sendButton.disabled = false;
        this.sendButton.innerHTML = textoOriginal;
      }
    });

    this.messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.editandoMensagemId) {
        this.cancelarEdicao();
      }
    });
  },

  destruir() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
};



document.addEventListener('DOMContentLoaded', () => {
  const paginaAtual = getPaginaAtual();
  
  console.log('Página atual:', paginaAtual);

  switch(paginaAtual) {
    case 'anuncios':
      Anuncios.init();
      break;
    case 'perfil':
      PerfilAnimal.init();
      break;
    case 'chat':
      Chat.init();
      break;
    default:
      console.log('Página não reconhecida');
  }
});


window.addEventListener('beforeunload', () => {
  Chat.destruir();
});