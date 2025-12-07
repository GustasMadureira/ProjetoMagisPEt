// URL base da API - Configuração semelhante ao exemplo de notícias
const replit = 'https://193e17b0-cc94-4970-9aa4-e8dd78be56b9-00-241nvxr31ia42.picard.replit.dev/';
const API_URL = replit + "animais";

let animais = [];
let animalEditandoId = null;

// Sistema de autenticação simples
let usuarioLogado = null;

// Inicializa a página
document.addEventListener('DOMContentLoaded', () => {
    verificarLogin();
    buscarAnimais();
    inicializarEventos();
    atualizarInterfaceLogin();
});

// Inicializa eventos do formulário e busca
function inicializarEventos() {
    const form = document.getElementById('form-animal');
    const btnCancelar = document.getElementById('btn-cancelar');
    const inputBusca = document.getElementById('buscar');
    const btnLogin = document.querySelector('.btn-login');
    const btnRegistrar = document.querySelector('.btn-registrar');

    if (form) {
        form.addEventListener('submit', handleSubmitForm);
    }

    if (btnCancelar) {
        btnCancelar.addEventListener('click', limparFormulario);
    }

    if (inputBusca) {
        inputBusca.addEventListener('input', filtrarAnimais);
    }

    // Configura redirecionamento dos botões
    if (btnLogin) {
        btnLogin.addEventListener('click', () => {
            if (!usuarioLogado) {
                window.location.href = 'login.html'; // Redireciona para página de login
            }
        });
    }

    if (btnRegistrar) {
        btnRegistrar.addEventListener('click', () => {
            if (!usuarioLogado) {
                window.location.href = 'registro.html'; // Redireciona para página de registro
            }
        });
    }
}

// GET: Buscar todos os animais
async function buscarAnimais() {
    const container = document.getElementById("lista-animais");
    
    try {
        container.innerHTML = '<p class="loading">Carregando animais...</p>';
        
        await fetch(API_URL)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao buscar animais');
                }
                return response.json();
            })
            .then(json => {
                animais = json;
                apresentarAnimais(animais);
            })
            .catch(error => {
                console.error("Erro ao buscar animais:", error);
                container.innerHTML = '<p class="loading" style="color: #f44336;">❌ Erro ao carregar animais. Verifique a conexão com a API.</p>';
            });
        
    } catch (error) {
        console.error("Erro ao buscar animais:", error);
        container.innerHTML = '<p class="loading" style="color: #f44336;">❌ Erro ao carregar animais. Verifique a conexão com a API.</p>';
    }
}

// Apresenta os animais na tela
function apresentarAnimais(listaAnimais = animais) {
    const container = document.getElementById("lista-animais");
    container.innerHTML = "";

    if (listaAnimais.length === 0) {
        container.innerHTML = '<p class="loading">Nenhum animal cadastrado ainda.</p>';
        return;
    }

    listaAnimais.forEach(animal => {
        const cartao = document.createElement("div");
        cartao.className = "animal-card";

        const imagemHTML = animal.imagem 
            ? `<img src="${animal.imagem}" alt="${animal.nome}" class="animal-imagem" onerror="this.src='https://via.placeholder.com/300x200?text=Sem+Imagem'">`
            : `<div class="animal-imagem" style="background-color: #e0e0e0; display: flex; align-items: center; justify-content: center; color: #999;">Sem imagem</div>`;

        cartao.innerHTML = `
            ${imagemHTML}
            <div class="animal-info">
                <h4>🐾 ${animal.nome}</h4>
                <div class="animal-detalhes">
                    <p><strong>Raça:</strong> ${animal.raca}</p>
                    <p><strong>Idade:</strong> ${animal.idade}</p>
                    <p><strong>Sexo:</strong> ${animal.sexo}</p>
                    <p><strong>Porte:</strong> ${animal.porte}</p>
                    <p><strong>Temperamento:</strong> ${animal.temperamento}</p>
                </div>
                <div style="margin: 10px 0;">
                    <span class="badge-status ${animal.vacinado === 'Sim' ? 'badge-sim' : 'badge-nao'}">
                        ${animal.vacinado === 'Sim' ? '✓' : '✗'} Vacinado
                    </span>
                    <span class="badge-status ${animal.castrado === 'Sim' ? 'badge-sim' : 'badge-nao'}">
                        ${animal.castrado === 'Sim' ? '✓' : '✗'} Castrado
                    </span>
                    <span class="badge-status ${animal.vermifugado === 'Sim' ? 'badge-sim' : 'badge-nao'}">
                        ${animal.vermifugado === 'Sim' ? '✓' : '✗'} Vermifugado
                    </span>
                </div>
                ${animal.resumo ? `<p class="animal-resumo">${animal.resumo}</p>` : ''}
                <div class="animal-acoes">
                    <button class="btn-editar" data-id="${animal.id}">✏️ Editar</button>
                    <button class="btn-excluir" data-id="${animal.id}">🗑️ Excluir</button>
                </div>
            </div>
        `;

        container.appendChild(cartao);
    });

    // Adiciona event listeners DEPOIS de criar os cards
    adicionarEventListenersCards();
}

// Adiciona event listeners para os botões de editar e excluir
function adicionarEventListenersCards() {
    // Botões de editar
    const botoesEditar = document.querySelectorAll('.btn-editar');
    botoesEditar.forEach(botao => {
        botao.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            console.log('ID capturado para editar:', id, 'Tipo:', typeof id);
            editarAnimal(id);
        });
    });

    // Botões de excluir
    const botoesExcluir = document.querySelectorAll('.btn-excluir');
    botoesExcluir.forEach(botao => {
        botao.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            console.log('ID capturado para excluir:', id, 'Tipo:', typeof id);
            excluirAnimal(id);
        });
    });
}

// Filtrar animais pela busca
function filtrarAnimais(event) {
    const termo = event.target.value.toLowerCase();
    
    const animaisFiltrados = animais.filter(animal => {
        return animal.nome.toLowerCase().includes(termo) ||
               animal.raca.toLowerCase().includes(termo) ||
               animal.temperamento.toLowerCase().includes(termo);
    });
    
    apresentarAnimais(animaisFiltrados);
}

// POST ou PUT: Salvar animal
async function handleSubmitForm(event) {
    event.preventDefault();
    
    // Verifica se está logado antes de salvar
    if (!verificarAutenticacao()) {
        return;
    }
    
    const formData = new FormData(event.target);
    const dados = {
        nome: formData.get('nome'),
        raca: formData.get('raca'),
        temperamento: formData.get('temperamento'),
        idade: formData.get('idade'),
        sexo: formData.get('sexo'),
        porte: formData.get('porte'),
        vacinado: formData.get('vacinado'),
        castrado: formData.get('castrado'),
        vermifugado: formData.get('vermifugado'),
        imagem: formData.get('imagem') || '',
        resumo: formData.get('resumo') || ''
    };

    await salvarAnimal(dados, animalEditandoId);
}

async function salvarAnimal(dados, id = null) {
    const url = id ? `${API_URL}/${id}` : API_URL;
    const metodo = id ? "PUT" : "POST";

    console.log('Salvando animal - URL:', url, 'Método:', metodo, 'ID:', id);

    try {
        await fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        })
        .then(response => {
            console.log('Resposta do servidor:', response.status);
            if (!response.ok) {
                throw new Error('Erro ao salvar animal');
            }
            return response.json();
        })
        .then(() => {
            alert(id ? "✅ Animal atualizado com sucesso!" : "✅ Animal cadastrado com sucesso!");
            limparFormulario();
            buscarAnimais();
            
            // Scroll para a lista
            document.getElementById('lista-animais').scrollIntoView({ behavior: 'smooth' });
        })
        .catch(error => {
            console.error("Erro ao salvar animal:", error);
            alert("❌ Erro ao salvar animal. Tente novamente.");
        });
        
    } catch (error) {
        console.error("Erro ao salvar animal:", error);
        alert("❌ Erro ao salvar animal. Tente novamente.");
    }
}

// DELETE: Excluir animal
async function excluirAnimal(id) {
    if (!confirm("⚠️ Tem certeza que deseja excluir este animal?")) return;

    console.log("Tentando excluir animal - ID:", id, "Tipo:", typeof id);
    console.log("URL completa:", `${API_URL}/${id}`);

    try {
        await fetch(`${API_URL}/${id}`, { 
            method: "DELETE" 
        })
        .then(response => {
            console.log("Status da resposta DELETE:", response.status);
            if (!response.ok) {
                throw new Error(`Erro ao excluir animal - Status: ${response.status}`);
            }
            alert("🗑️ Animal excluído com sucesso!");
            buscarAnimais();
        })
        .catch(error => {
            console.error("Erro ao excluir animal:", error);
            alert("❌ Erro ao excluir animal. Tente novamente.");
        });
        
    } catch (error) {
        console.error("Erro ao excluir animal:", error);
        alert("❌ Erro ao excluir animal. Tente novamente.");
    }
}

// GET por ID: Carregar dados para edição
async function editarAnimal(id) {
    // Verifica se está logado antes de editar
    if (!verificarAutenticacao()) {
        return;
    }
    
    console.log("Tentando editar animal - ID:", id, "Tipo:", typeof id);
    console.log("URL completa:", `${API_URL}/${id}`);
    
    try {
        await fetch(`${API_URL}/${id}`)
            .then(response => {
                console.log("Status da resposta GET:", response.status);
                if (!response.ok) {
                    throw new Error(`Erro ao buscar animal - Status: ${response.status}`);
                }
                return response.json();
            })
            .then(animal => {
                console.log("Dados do animal recebidos:", animal);
                
                // Preenche o formulário
                document.getElementById('nome').value = animal.nome || '';
                document.getElementById('raca').value = animal.raca || '';
                document.getElementById('temperamento').value = animal.temperamento || '';
                document.getElementById('idade').value = animal.idade || '';
                document.getElementById('sexo').value = animal.sexo || '';
                document.getElementById('porte').value = animal.porte || '';
                document.getElementById('imagem').value = animal.imagem || '';
                document.getElementById('resumo').value = animal.resumo || '';
                
                // Marca os radio buttons
                const radioVacinado = document.querySelector(`input[name="vacinado"][value="${animal.vacinado}"]`);
                const radioCastrado = document.querySelector(`input[name="castrado"][value="${animal.castrado}"]`);
                const radioVermifugado = document.querySelector(`input[name="vermifugado"][value="${animal.vermifugado}"]`);
                
                if (radioVacinado) radioVacinado.checked = true;
                if (radioCastrado) radioCastrado.checked = true;
                if (radioVermifugado) radioVermifugado.checked = true;
                
                // Atualiza o estado de edição (mantém como string!)
                animalEditandoId = id;
                
                console.log("animalEditandoId definido como:", animalEditandoId);
                
                // Atualiza o botão
                const btnSalvar = document.getElementById('btn-salvar');
                btnSalvar.innerHTML = '✏️ Atualizar Animal';
                
                // Scroll para o formulário
                document.querySelector('.secao-formulario').scrollIntoView({ behavior: 'smooth' });
            })
            .catch(error => {
                console.error("Erro ao carregar animal para edição:", error);
                alert("❌ Erro ao carregar dados do animal.");
            });
        
    } catch (error) {
        console.error("Erro ao carregar animal para edição:", error);
        alert("❌ Erro ao carregar dados do animal.");
    }
}

// Limpar formulário
function limparFormulario() {
    document.getElementById('form-animal').reset();
    animalEditandoId = null;
    
    const btnSalvar = document.getElementById('btn-salvar');
    btnSalvar.innerHTML = '💾 Cadastrar Animal';
}

// ========== SISTEMA DE AUTENTICAÇÃO ==========

function verificarLogin() {
    const usuarioSalvo = localStorage.getItem('usuarioMagisPet');
    if (usuarioSalvo) {
        usuarioLogado = JSON.parse(usuarioSalvo);
    }
}

function verificarAutenticacao() {
    if (!usuarioLogado) {
        alert('⚠️ Você precisa estar logado para realizar esta ação!');
        window.location.href = 'login.html'; // Redireciona para página de login
        return false;
    }
    return true;
}

function realizarLogout() {
    if (confirm('Deseja realmente sair?')) {
        usuarioLogado = null;
        localStorage.removeItem('usuarioMagisPet');
        alert('✅ Logout realizado com sucesso!');
        atualizarInterfaceLogin();
    }
}

function atualizarInterfaceLogin() {
    const btnLogin = document.querySelector('.btn-login');
    const btnRegistrar = document.querySelector('.btn-registrar');
    
    if (usuarioLogado) {
        // Usuário logado - mostra nome e botão de logout
        btnLogin.textContent = `👤 ${usuarioLogado.nome}`;
        btnLogin.style.cursor = 'default';
        btnLogin.style.pointerEvents = 'none'; // Desabilita clique quando logado
        
        btnRegistrar.textContent = 'SAIR';
        btnRegistrar.onclick = realizarLogout;
    } else {
        // Usuário não logado - mostra botões originais
        btnLogin.textContent = 'LOGIN';
        btnLogin.style.cursor = 'pointer';
        btnLogin.style.pointerEvents = 'auto'; // Habilita clique
        btnLogin.onclick = () => window.location.href = 'login.html';
        
        btnRegistrar.textContent = 'REGISTRAR';
        btnRegistrar.onclick = () => window.location.href = 'registro.html';
    }
}

// Torna a função de logout global para ser chamada de outras páginas se necessário
window.realizarLogout = realizarLogout;