const API_URL = 'https://cc20c04c-918d-4941-adea-327d532368d2-00-3p832i6nen4dl.riker.replit.dev';

/* ===========================================================
   FUNÇÕES AUXILIARES
   =========================================================== */

function getURLParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  const value = urlParams.get(param);
  console.log(`📌 Parâmetro '${param}' da URL:`, value);
  return value ? parseInt(value) : null;
}

/* ===========================================================
   MÓDULO: CHAT
   =========================================================== */

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
    console.log('=== CHAT: Iniciando ===');
    
    this.animalAtualId = getURLParam('animal');
    
    if (!this.animalAtualId) {
      console.warn('⚠️ Animal ID não fornecido, usando ID padrão: 1');
      this.animalAtualId = 1;
    }

    this.messageList = document.getElementById('message-list');
    this.messageForm = document.getElementById('message-form');
    this.messageInput = document.getElementById('message-input');
    this.sendButton = document.getElementById('send-button');

    if (!this.messageList || !this.messageForm) {
      console.error('❌ Elementos do chat não encontrados!');
      return;
    }

    console.log('✅ Animal ID atual:', this.animalAtualId);
    
    // Carrega informações do animal primeiro
    this.carregarInfoAnimal();
    
    // Depois carrega as mensagens
    this.carregarMensagens();
    
    // Configura eventos do formulário
    this.configurarEventos();
    
    // Atualiza mensagens a cada 5 segundos
    this.intervalId = setInterval(() => this.carregarMensagens(), 5000);
  },

  /* ===========================================================
     CARREGAR INFORMAÇÕES DO ANIMAL
     =========================================================== */

  async carregarInfoAnimal() {
    console.log('=== Carregando informações do animal ===');
    console.log('🆔 Animal ID:', this.animalAtualId);

    try {
      // TENTATIVA 1: Buscar animal específico
      const urlEspecifico = `${API_URL}/animais/${this.animalAtualId}`;
      console.log('📡 Tentando buscar em:', urlEspecifico);
      
      let response = await fetch(urlEspecifico);
      console.log('📡 Status:', response.status);
      
      let animal = null;
      
      if (response.ok) {
        animal = await response.json();
        console.log('✅ Animal encontrado (endpoint específico):', animal);
      } else {
        console.warn('⚠️ Endpoint específico falhou, buscando todos os animais...');
        
        // TENTATIVA 2: Buscar todos e filtrar
        const urlTodos = `${API_URL}/animais`;
        console.log('📡 Buscando em:', urlTodos);
        
        response = await fetch(urlTodos);
        
        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📦 Dados recebidos:', data);
        
        // Identifica estrutura dos dados
        let todosAnimais = [];
        if (Array.isArray(data)) {
          todosAnimais = data;
        } else if (data.animais && Array.isArray(data.animais)) {
          todosAnimais = data.animais;
        }
        
        console.log('📋 Total de animais:', todosAnimais.length);
        console.log('🔍 Procurando animal com ID:', this.animalAtualId);
        
        // Busca o animal pelo ID
        animal = todosAnimais.find(a => a.id == this.animalAtualId);
        
        if (animal) {
          console.log('✅ Animal encontrado na lista:', animal);
        } else {
          console.error('❌ Animal não encontrado!');
          console.log('📋 IDs disponíveis:', todosAnimais.map(a => a.id));
        }
      }
      
      if (animal) {
        this.exibirInfoAnimal(animal);
      } else {
        console.warn('⚠️ Usando informações padrão do animal');
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar informações do animal:', error);
      console.log('ℹ️ Usando informações padrão do HTML');
    }
  },

  exibirInfoAnimal(animal) {
    console.log('=== Exibindo informações do animal no chat ===');
    
    // Atualiza o nome do animal no cabeçalho
    const nomeElement = document.querySelector('.chat-header-info h2 strong');
    if (nomeElement) {
      nomeElement.textContent = animal.nome;
      console.log('✅ Nome atualizado:', animal.nome);
    } else {
      console.warn('⚠️ Elemento de nome não encontrado');
    }
    
    // Atualiza o avatar/foto do animal
    const avatarElement = document.querySelector('.chat-avatar');
    if (avatarElement) {
      const fotoUrl = animal.imagem || animal.foto || 'assets/img/cachorro.jpg';
      avatarElement.src = fotoUrl;
      avatarElement.alt = animal.nome;
      console.log('✅ Avatar atualizado:', fotoUrl);
    } else {
      console.warn('⚠️ Elemento de avatar não encontrado');
    }
    
    // Atualiza o título da página
    document.title = `Chat com ${animal.nome} - MagisPet`;
    console.log('✅ Título da página atualizado');
  },

  /* ===========================================================
     CRUD DE MENSAGENS
     =========================================================== */

  async criarMensagem(mensagemTexto) {
    try {
      console.log('📤 Criando nova mensagem...');
      
      const novaMensagem = {
        animal_id: this.animalAtualId,
        usuario_id: this.usuarioAtualId,
        mensagem: mensagemTexto,
        data_criacao: new Date().toISOString()
      };

      console.log('📝 Dados da mensagem:', novaMensagem);

      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaMensagem)
      });

      console.log('📡 Status:', response.status);

      if (!response.ok) {
        throw new Error('Erro ao criar mensagem');
      }

      const mensagemCriada = await response.json();
      console.log('✅ Mensagem criada:', mensagemCriada);
      
      return mensagemCriada;
    } catch (error) {
      console.error('❌ Erro ao criar mensagem:', error);
      alert('Erro ao enviar mensagem. Tente novamente.');
      return null;
    }
  },

  async carregarMensagens() {
    try {
      console.log('📥 Carregando mensagens...');
      
      const response = await fetch(`${API_URL}/chat`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar mensagens');
      }

      const data = await response.json();
      console.log('📦 Dados recebidos:', data);
      
      // Identifica estrutura dos dados
      this.mensagens = Array.isArray(data) ? data : data.chat || [];
      console.log('📋 Total de mensagens:', this.mensagens.length);
      
      // Filtra mensagens do animal atual
      this.mensagens = this.mensagens.filter(msg => msg.animal_id == this.animalAtualId);
      console.log('✅ Mensagens filtradas (animal_id=' + this.animalAtualId + '):', this.mensagens.length);
      
      this.renderizarMensagens();
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens:', error);
      if (this.messageList) {
        this.messageList.innerHTML = '<p style="text-align: center; color: #999;">Erro ao carregar mensagens.</p>';
      }
    }
  },

  async atualizarMensagem(chatId, novoTexto) {
    try {
      console.log('✏️ Atualizando mensagem ID:', chatId);
      console.log('📝 Novo texto:', novoTexto);
      
      const mensagemAtualizada = {
        mensagem: novoTexto,
        data_atualizacao: new Date().toISOString()
      };

      const url = `${API_URL}/chat/${chatId}`;
      console.log('📡 URL:', url);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mensagemAtualizada)
      });

      console.log('📡 Status:', response.status);

      if (!response.ok) {
        throw new Error('Erro ao atualizar mensagem');
      }

      const resultado = await response.json();
      console.log('✅ Mensagem atualizada:', resultado);
      
      return resultado;
    } catch (error) {
      console.error('❌ Erro ao atualizar mensagem:', error);
      alert('Erro ao editar mensagem. Tente novamente.');
      return null;
    }
  },

  async deletarMensagem(chatId) {
    try {
      console.log('🗑️ Deletando mensagem ID:', chatId);
      
      const url = `${API_URL}/chat/${chatId}`;
      console.log('📡 URL:', url);
      
      const response = await fetch(url, { method: 'DELETE' });
      console.log('📡 Status:', response.status);

      if (!response.ok) {
        throw new Error('Erro ao deletar mensagem');
      }

      console.log('✅ Mensagem deletada com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao deletar mensagem:', error);
      alert('Erro ao excluir mensagem. Tente novamente.');
      return false;
    }
  },

  /* ===========================================================
     RENDERIZAÇÃO
     =========================================================== */

  renderizarMensagens() {
    this.messageList.innerHTML = '';

    if (this.mensagens.length === 0) {
      this.messageList.innerHTML = `
        <p style="text-align: center; color: #999; margin-top: 20px;">
          Nenhuma mensagem ainda. Seja o primeiro a conversar!
        </p>
      `;
      return;
    }

    this.mensagens.forEach(msg => {
      const messageDiv = this.criarElementoMensagem(msg);
      this.messageList.appendChild(messageDiv);
    });

    // Scroll para o final
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

    // Adiciona botões de editar/excluir apenas para mensagens do usuário atual
    if (msg.usuario_id === this.usuarioAtualId) {
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'message-actions';

      const editButton = document.createElement('button');
      editButton.className = 'btn-edit';
      editButton.title = 'Editar mensagem';
      editButton.innerHTML = '';
      editButton.onclick = (e) => {
        e.preventDefault();
        this.iniciarEdicao(msgId, msg.mensagem);
      };

      const deleteButton = document.createElement('button');
      deleteButton.className = 'btn-delete';
      deleteButton.title = 'Excluir mensagem';
      deleteButton.innerHTML = '';
      deleteButton.onclick = (e) => {
        e.preventDefault();
        this.confirmarExclusao(msgId);
      };

      actionsDiv.appendChild(editButton);
      actionsDiv.appendChild(deleteButton);
      messageDiv.appendChild(actionsDiv);
    }

    return messageDiv;
  },

  /* ===========================================================
     EDIÇÃO E EXCLUSÃO
     =========================================================== */

  iniciarEdicao(chatId, mensagemTexto) {
    console.log(' Iniciando edição da mensagem:', chatId);
    
    this.editandoMensagemId = chatId;
    this.messageInput.value = mensagemTexto;
    this.messageInput.focus();
    
    // Muda visual do botão
    this.sendButton.innerHTML = 'Salvar ✓';
    this.sendButton.style.backgroundColor = '#007bff';
    
    // Remove destaque de outras mensagens
    document.querySelectorAll('.message').forEach(msg => {
      msg.classList.remove('editing');
    });
    
    // Destaca mensagem sendo editada
    const mensagemEditando = document.querySelector(`[data-chat-id="${chatId}"]`);
    if (mensagemEditando) {
      mensagemEditando.classList.add('editing');
      mensagemEditando.style.opacity = '0.6';
    }
  },

  cancelarEdicao() {
    console.log('❌ Cancelando edição');
    
    this.editandoMensagemId = null;
    this.messageInput.value = '';
    this.sendButton.innerHTML = 'Enviar <i class="fas fa-paper-plane"></i>';
    this.sendButton.style.backgroundColor = '#751a24';
    
    // Remove destaque das mensagens
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
        // Animação de saída
        mensagemElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        mensagemElement.style.opacity = '0';
        mensagemElement.style.transform = 'translateX(20px)';
        
        // Recarrega mensagens após animação
        setTimeout(() => {
          this.carregarMensagens();
        }, 300);
      }
    }
  },

  /* ===========================================================
     EVENTOS DO FORMULÁRIO
     =========================================================== */

  configurarEventos() {
    // Submit do formulário
    this.messageForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const mensagemTexto = this.messageInput.value.trim();
      
      if (!mensagemTexto) {
        alert('Por favor, digite uma mensagem!');
        return;
      }

      // Desabilita botão durante envio
      this.sendButton.disabled = true;
      const textoOriginal = this.sendButton.innerHTML;
      this.sendButton.innerHTML = 'Enviando...';

      try {
        if (this.editandoMensagemId) {
          // Modo edição
          const sucesso = await this.atualizarMensagem(this.editandoMensagemId, mensagemTexto);
          
          if (sucesso) {
            this.cancelarEdicao();
            this.messageInput.value = '';
            setTimeout(() => this.carregarMensagens(), 500);
          }
        } else {
          // Modo nova mensagem
          const novaMensagem = await this.criarMensagem(mensagemTexto);
          
          if (novaMensagem) {
            this.messageInput.value = '';
            setTimeout(() => this.carregarMensagens(), 500);
          }
        }
      } catch (error) {
        console.error('❌ Erro ao processar mensagem:', error);
        alert('Erro ao processar mensagem. Tente novamente.');
      } finally {
        this.sendButton.disabled = false;
        this.sendButton.innerHTML = textoOriginal;
      }
    });

    // Tecla ESC cancela edição
    this.messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.editandoMensagemId) {
        this.cancelarEdicao();
      }
    });
  },

  /* ===========================================================
     LIMPEZA
     =========================================================== */

  destruir() {
    console.log('🧹 Limpando intervalo de atualização');
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
};

/* ===========================================================
   INICIALIZAÇÃO
   =========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 DOM carregado, iniciando chat...');
  Chat.init();
});

// Limpa intervalos ao sair da página
window.addEventListener('beforeunload', () => {
  Chat.destruir();
});
