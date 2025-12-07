// ========================================
// SISTEMA DE LOGIN E REGISTRO - MagisPet
// Integrado com API Replit
// USANDO SESSION STORAGE
// ========================================

const API_URL = 'https://cc20c04c-918d-4941-adea-327d532368d2-00-3p832i6nen4dl.riker.replit.dev';

document.addEventListener("DOMContentLoaded", () => {
  // Detecta qual formulário está na página
  const registroForm = document.getElementById("registro-form");
  const loginForm = document.getElementById("login-form");

  // Se estiver na página de registro
  if (registroForm) {
    inicializarRegistro();
  }

  // Se estiver na página de login
  if (loginForm) {
    inicializarLogin();
  }
});

// ========================================
// FUNÇÕES DE REGISTRO
// ========================================

function inicializarRegistro() {
  const form = document.getElementById("registro-form");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const senha = document.getElementById("senha").value;

    // Validações básicas
    if (!validarEmail(email)) {
      alert("❌ Por favor, insira um e-mail válido!");
      return;
    }

    if (senha.length < 6) {
      alert("❌ A senha deve ter pelo menos 6 caracteres!");
      return;
    }

    // Desabilita botão durante o processo
    const btnSubmit = form.querySelector(".btn-submit");
    const textoOriginal = btnSubmit.textContent;
    btnSubmit.disabled = true;
    btnSubmit.textContent = "⏳ Cadastrando...";

    try {
      // Gera um ID único para o usuário
      const id = gerarUUID();

      // Cria objeto do usuário
      const usuario = {
        id: id,
        nome: nome,
        email: email,
        telefone: telefone,
        senha: senha,
        admin: false,
      };

      console.log("📤 Enviando usuário para API:", usuario);

      // Envia para a API
      const response = await fetch(`${API_URL}/usuarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(usuario),
      });

      console.log("📡 Status da resposta:", response.status);

      if (!response.ok) {
        throw new Error("Erro ao cadastrar usuário na API");
      }

      const resultado = await response.json();
      console.log("✅ Usuário cadastrado na API:", resultado);

      alert(
        "✅ Cadastro realizado com sucesso!\n\nVocê será redirecionado para a página de login."
      );

      // Redireciona para o login após 1 segundo
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);
    } catch (error) {
      console.error("❌ Erro ao cadastrar:", error);
      alert(
        "❌ Erro ao realizar cadastro.\n\nVerifique sua conexão e tente novamente."
      );

      // Reabilita botão
      btnSubmit.disabled = false;
      btnSubmit.textContent = textoOriginal;
    }
  });
}

// ========================================
// FUNÇÕES DE LOGIN
// ========================================

function inicializarLogin() {
  const form = document.getElementById("login-form");

  if (!form) {
    console.error("❌ Formulário de login não encontrado!");
    return;
  }

  console.log("✅ Formulário de login encontrado e configurado");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Pega os valores e limpa espaços extras nas pontas
    const emailInput = document
      .getElementById("email")
      .value.trim()
      .toLowerCase(); // Força minúsculo
    const senhaInput = document.getElementById("password").value.trim(); // Remove espaços acidentais

    console.log("🔐 Tentando fazer login com:", emailInput);

    const btnSubmit = form.querySelector(".btn-submit");
    const textoOriginal = btnSubmit.textContent;
    btnSubmit.disabled = true;
    btnSubmit.textContent = "⏳ Entrando...";

    try {
      console.log("📥 Buscando usuários da API...");
      const response = await fetch(`${API_URL}/usuarios`);

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();

      // Tratamento robusto para encontrar o array de usuários
      let usuarios = [];
      if (Array.isArray(data)) {
        usuarios = data;
      } else if (data.usuarios && Array.isArray(data.usuarios)) {
        usuarios = data.usuarios;
      } else if (data.data && Array.isArray(data.data)) {
        // Algumas APIs retornam dentro de 'data'
        usuarios = data.data;
      }

      console.log(`👥 Total de usuários carregados: ${usuarios.length}`);

      // Busca usuário (Lógica Melhorada)
      const usuario = usuarios.find((u) => {
        // Garante que os dados da API existam e sejam strings antes de comparar
        const apiEmail = (u.email || "").trim().toLowerCase();
        const apiSenha = (u.senha || "").toString().trim();

        // Debug para ver comparações (opcional, remova em produção se tiver muitos usuários)
        // console.log(`Comparando: [${apiEmail}] com [${emailInput}]`);

        return apiEmail === emailInput && apiSenha === senhaInput;
      });

      if (usuario) {
        console.log("✅ Usuário encontrado:", usuario.nome);

        sessionStorage.setItem(
          "usuarioMagisPet",
          JSON.stringify({
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            telefone: usuario.telefone,
            admin: usuario.admin || false,
          })
        );

        alert(
          `✅ Login realizado com sucesso!\n\nBem-vindo(a), ${usuario.nome}!`
        );
        window.location.href = "anuncios.html";
      } else {
        console.warn("⚠️ Credenciais inválidas.");
        console.log(
          "Dica: Verifique se o usuário realmente existe no retorno da API olhando o console."
        );
        alert("❌ E-mail ou senha incorretos!\n\nTente novamente.");
      }
    } catch (error) {
      console.error("❌ Erro crítico:", error);
      alert(
        "❌ Erro de conexão com o servidor.\nVerifique o Console (F12) para detalhes."
      );
    } finally {
      // Sempre reabilita o botão, dando erro ou sucesso (se não redirecionar rápido)
      btnSubmit.disabled = false;
      btnSubmit.textContent = textoOriginal;
    }
  });
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function gerarUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ✅ FUNÇÃO DE LOGOUT - Usando sessionStorage
function realizarLogout() {
  sessionStorage.removeItem("usuarioMagisPet");
  console.log("✅ Logout realizado - sessionStorage limpo");
  alert("✅ Logout realizado com sucesso!");
  window.location.href = "home.html";
}

// ✅ FUNÇÃO PARA VERIFICAR LOGIN - Usando sessionStorage
function verificarLogin() {
  const usuario = sessionStorage.getItem("usuarioMagisPet");
  const estaLogado = usuario !== null;
  console.log("🔍 Verificando login:", estaLogado);
  return estaLogado;
}

// ✅ FUNÇÃO PARA OBTER USUÁRIO LOGADO - Usando sessionStorage
function obterUsuarioLogado() {
  const usuario = sessionStorage.getItem("usuarioMagisPet");
  if (usuario) {
    console.log("👤 Usuário logado encontrado no sessionStorage");
    return JSON.parse(usuario);
  }
  console.log("👤 Nenhum usuário logado no sessionStorage");
  return null;
}

// Exporta funções para uso global
window.realizarLogout = realizarLogout;
window.verificarLogin = verificarLogin;
window.obterUsuarioLogado = obterUsuarioLogado;

// ✅ LOG DE INICIALIZAÇÃO
console.log("🚀 Sistema de login inicializado com sessionStorage");
console.log("📝 sessionStorage expira quando a aba é fechada");
