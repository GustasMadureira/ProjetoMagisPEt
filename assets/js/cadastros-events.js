// ========================================
// CONFIGURAÇÃO DA API
// ========================================
const API_URL = 'https://e638a33f-632f-4094-9417-d318625fdd11-00-zxrkllekyax9.kirk.replit.dev/eventos';
const VIACEP_URL = 'https://viacep.com.br/ws';

// ========================================
// INICIALIZAÇÃO
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  configurarContadores();
  configurarMascaraCEP();
  configurarPreviewImagem();
  configurarFormulario();
  carregarEventos();
});

// ========================================
// MÁSCARA DE CEP + BUSCA NA API VIACEP
// ========================================
function configurarMascaraCEP() {
  const cepInput = document.getElementById('cep-evento');
  if (!cepInput) return;

  cepInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 5) {
      value = value.replace(/^(\d{5})(\d)/, '$1-$2');
    }
    e.target.value = value.substring(0, 9);
  });

  cepInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      buscarCEP();
    }
  });
}

async function buscarCEP() {
  const cep = document.getElementById('cep-evento').value.replace(/\D/g, '');
  const loadingCep = document.getElementById('loading-cep');

  if (cep.length !== 8) {
    mostrarMensagem('Por favor, insira um CEP válido com 8 dígitos.', 'erro');
    return;
  }

  loadingCep.style.display = 'block';

  try {
    const response = await fetch(`${VIACEP_URL}/${cep}/json/`);
    const data = await response.json();

    if (data.erro) throw new Error('CEP não encontrado');

    document.getElementById('rua-evento').value = data.logradouro || '';
    document.getElementById('bairro-evento').value = data.bairro || '';
    document.getElementById('cidade-evento').value = data.localidade || '';
    document.getElementById('estado-evento').value = data.uf || '';
    document.getElementById('numero-evento').focus();

    mostrarMensagem('✅ CEP encontrado! Endereço preenchido automaticamente.', 'sucesso');
  } catch (error) {
    mostrarMensagem('❌ CEP não encontrado. Verifique e tente novamente.', 'erro');
    limparCamposEndereco();
  } finally {
    loadingCep.style.display = 'none';
  }
}

function limparCamposEndereco() {
  ['rua-evento','bairro-evento','cidade-evento','estado-evento'].forEach(id => {
    document.getElementById(id).value = '';
  });
}

// ========================================
// CRUD COM REPLIT (API_URL)
// ========================================
async function cadastrarEvento() {
  const dados = obterDadosFormulario();
  const btnSalvar = document.getElementById('btn-salvar');
  btnSalvar.disabled = true;
  btnSalvar.textContent = '⏳ Salvando...';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });

    if (!response.ok) throw new Error('Erro ao cadastrar evento');

    mostrarMensagem('✅ Evento cadastrado com sucesso!', 'sucesso');
    limparFormulario();
    carregarEventos();
  } catch (error) {
    mostrarMensagem('❌ Erro ao cadastrar evento.', 'erro');
  } finally {
    btnSalvar.disabled = false;
    btnSalvar.textContent = '✅ Cadastrar Evento';
  }
}

async function carregarEventos() {
  const listaEventos = document.getElementById('lista-eventos');
  listaEventos.innerHTML = '<p class="loading">⏳ Carregando eventos...</p>';

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Erro ao carregar eventos');

    const eventos = await response.json();
    listaEventos.innerHTML = eventos.length
      ? eventos.map(ev => criarCardEvento(ev)).join('')
      : '<p class="sem-eventos">📭 Nenhum evento cadastrado ainda.</p>';
  } catch (error) {
    listaEventos.innerHTML = '<p class="sem-eventos">❌ Erro ao carregar eventos.</p>';
  }
}

async function atualizarEvento(id) {
  const dados = obterDadosFormulario();
  const btnSalvar = document.getElementById('btn-salvar');
  btnSalvar.disabled = true;
  btnSalvar.textContent = '⏳ Atualizando...';

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });

    if (!response.ok) throw new Error('Erro ao atualizar evento');

    mostrarMensagem('✅ Evento atualizado com sucesso!', 'sucesso');
    limparFormulario();
    carregarEventos();
  } catch (error) {
    mostrarMensagem('❌ Erro ao atualizar evento.', 'erro');
  } finally {
    btnSalvar.disabled = false;
    btnSalvar.textContent = '✅ Cadastrar Evento';
  }
}

async function excluirEvento(id) {
  if (!confirm('⚠️ Tem certeza que deseja excluir este evento?')) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Erro ao excluir evento');

    mostrarMensagem('✅ Evento excluído com sucesso!', 'sucesso');
    carregarEventos();
  } catch (error) {
    mostrarMensagem('❌ Erro ao excluir evento.', 'erro');
  }
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================
function obterDadosFormulario() {
  return {
    nomeEvento: document.getElementById('nome-evento').value.trim(),
    dataEvento: document.getElementById('data-evento').value,
    horarioEvento: document.getElementById('horario-evento').value.trim(),
    cep: document.getElementById('cep-evento').value.trim(),
    rua: document.getElementById('rua-evento').value.trim(),
    numero: document.getElementById('numero-evento').value.trim(),
    bairro: document.getElementById('bairro-evento').value.trim(),
    cidade: document.getElementById('cidade-evento').value.trim(),
    estado: document.getElementById('estado-evento').value.trim(),
    complemento: document.getElementById('complemento-evento').value.trim(),
    descricaoCurta: document.getElementById('descricao-curta').value.trim(),
    descricaoComp: document.getElementById('descricao-completa').value.trim(),
    linkBanner: document.getElementById('link-banner').value.trim()
  };
}

function mostrarMensagem(texto, tipo) {
  const mensagemId = tipo === 'sucesso' ? 'mensagemSucesso' : 'mensagemErro';
  const mensagem = document.getElementById(mensagemId);
  mensagem.textContent = texto;
  mensagem.classList.add('show');
  setTimeout(() => mensagem.classList.remove('show'), 5000);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Exporta funções para o HTML
window.buscarCEP = buscarCEP;
window.carregarPreview = carregarPreview;
window.prepararEdicao = prepararEdicao;
window.excluirEvento = excluirEvento;
window.cancelarCadastro = cancelarCadastro;
