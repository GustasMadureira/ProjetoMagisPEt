const API_URL = 'https://cc20c04c-918d-4941-adea-327d532368d2-00-3p832i6nen4dl.riker.replit.dev/';

console.log('🚀 Script de parcerias carregado');
console.log('📡 API URL:', API_URL);

/* ========================================
   FUNÇÕES DE CRUD
   ======================================== */

// GET - Buscar todas as parcerias
const fetchPartners = async () => {
    const tableBody = document.getElementById('partners-table-body');
    
    try {
        console.log('📥 Buscando parcerias da API...');
        
        const response = await fetch(API_URL);
        console.log('📡 Status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📦 Dados recebidos:', data);
        console.log('📦 Tipo de dados:', typeof data);
        
        // Identifica a estrutura dos dados
        let partners = [];
        if (Array.isArray(data)) {
            partners = data;
            console.log('✅ Dados são array direto');
        } else if (data.parcerias && Array.isArray(data.parcerias)) {
            partners = data.parcerias;
            console.log('✅ Dados têm propriedade "parcerias"');
        }
        
        console.log('📋 Total de parcerias:', partners.length);
        console.log('📋 Parcerias:', partners);
        
        // Renderiza a tabela
        renderTable(partners);
        
    } catch (error) {
        console.error('❌ Erro ao buscar parcerias:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger">
                    ❌ Erro ao carregar as parcerias.<br>
                    Verifique se a API está rodando em: <code>${API_URL}</code><br>
                    Erro: ${error.message}
                </td>
            </tr>
        `;
    }
};

// Renderizar tabela
const renderTable = (partners) => {
    const tableBody = document.getElementById('partners-table-body');
    tableBody.innerHTML = '';
    
    if (partners.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    📋 Nenhuma parceria cadastrada ainda.
                </td>
            </tr>
        `;
        return;
    }
    
    partners.forEach(partner => {
        console.log('Renderizando parceria:', partner);
        
        const row = document.createElement('tr');
        
        // Nome da empresa
        const cellNome = document.createElement('td');
        cellNome.textContent = partner['nome-empresa'] || partner.nomeEmpresa || '-';
        cellNome.setAttribute('data-label', 'Nome da Empresa');
        
        // Tipo de parceria
        const cellTipo = document.createElement('td');
        cellTipo.textContent = partner['tipo-parceria'] || partner.tipoParceria || '-';
        cellTipo.setAttribute('data-label', 'Tipo');
        
        // Telefone
        const cellTelefone = document.createElement('td');
        cellTelefone.textContent = partner.telefone || '-';
        cellTelefone.setAttribute('data-label', 'Telefone');
        
        // Tipo de contrato
        const cellContrato = document.createElement('td');
        cellContrato.textContent = partner['tipo-contrato'] || partner.tipoContrato || '-';
        cellContrato.setAttribute('data-label', 'Tipo de Contrato');
        
        // Website
        const cellWebsite = document.createElement('td');
        if (partner.website) {
            const link = document.createElement('a');
            link.href = partner.website;
            link.textContent = '🔗 Visitar';
            link.target = '_blank';
            link.className = 'text-primary';
            cellWebsite.appendChild(link);
        } else {
            cellWebsite.textContent = '-';
        }
        cellWebsite.setAttribute('data-label', 'Website');
        
        // Ações
        const cellAcoes = document.createElement('td');
        cellAcoes.setAttribute('data-label', 'Ações');
        
        const btnEdit = document.createElement('button');
        btnEdit.textContent = '✏️ Editar';
        btnEdit.className = 'btn btn-edit btn-sm me-1';
        btnEdit.onclick = () => prepareEdit(partner.id);
        
        const btnDelete = document.createElement('button');
        btnDelete.textContent = '🗑️ Excluir';
        btnDelete.className = 'btn btn-delete btn-sm';
        btnDelete.onclick = () => deletePartner(partner.id);
        
        cellAcoes.appendChild(btnEdit);
        cellAcoes.appendChild(btnDelete);
        
        // Adiciona células à linha
        row.appendChild(cellNome);
        row.appendChild(cellTipo);
        row.appendChild(cellTelefone);
        row.appendChild(cellContrato);
        row.appendChild(cellWebsite);
        row.appendChild(cellAcoes);
        
        tableBody.appendChild(row);
    });
    
    console.log('✅ Tabela renderizada com', partners.length, 'parcerias');
};

// POST - Adicionar parceria
const addPartner = async (partnerData) => {
    try {
        console.log('📤 Enviando nova parceria:', partnerData);
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(partnerData)
        });
        
        console.log('📡 Status da resposta:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erro da API:', errorText);
            throw new Error(`Erro ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('✅ Resposta da API:', result);
        console.log('✅ Parceria adicionada com sucesso!');
        
        alert('✅ Parceria cadastrada com sucesso!');
        
        clearForm();
        fetchPartners();
        
    } catch (error) {
        console.error('❌ Erro ao adicionar parceria:', error);
        alert(`❌ Erro ao adicionar a parceria.\n\nDetalhes: ${error.message}\n\nVerifique o console (F12) para mais informações.`);
    }
};

// PUT - Atualizar parceria
const updatePartner = async (id, partnerData) => {
    try {
        console.log('📤 Atualizando parceria ID:', id);
        console.log('📝 Dados:', partnerData);
        
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(partnerData)
        });
        
        console.log('📡 Status da resposta:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erro da API:', errorText);
            throw new Error(`Erro ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('✅ Resposta da API:', result);
        console.log('✅ Parceria atualizada com sucesso!');
        
        alert('✅ Parceria atualizada com sucesso!');
        
        clearForm();
        fetchPartners();
        
    } catch (error) {
        console.error('❌ Erro ao atualizar parceria:', error);
        alert(`❌ Erro ao atualizar a parceria.\n\nDetalhes: ${error.message}\n\nVerifique o console (F12) para mais informações.`);
    }
};

// DELETE - Excluir parceria
const deletePartner = async (id) => {
    if (!confirm('⚠️ Tem certeza que deseja excluir esta parceria?')) {
        return;
    }
    
    try {
        console.log('🗑️ Excluindo parceria ID:', id);
        
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        console.log('📡 Status da resposta:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erro da API:', errorText);
            throw new Error(`Erro ${response.status}: ${errorText}`);
        }
        
        console.log('✅ Parceria excluída com sucesso!');
        alert('✅ Parceria excluída com sucesso!');
        
        fetchPartners();
        
    } catch (error) {
        console.error('❌ Erro ao excluir parceria:', error);
        alert(`❌ Erro ao excluir a parceria.\n\nDetalhes: ${error.message}\n\nVerifique o console (F12) para mais informações.`);
    }
};

// Preparar edição
const prepareEdit = async (id) => {
    try {
        console.log('📥 Carregando dados da parceria ID:', id);
        
        const response = await fetch(`${API_URL}/${id}`, { 
            cache: 'no-cache' 
        });
        
        console.log('📡 Status da resposta:', response.status);
        
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const partner = await response.json();
        console.log('📦 Dados recebidos:', partner);
        
        if (!partner || !partner.id) {
            throw new Error("Dados do parceiro recebidos estão vazios ou mal formatados.");
        }
        
        // Preenche o formulário
        document.getElementById('partnerId').value = partner.id;
        document.getElementById('nomeEmpresa').value = partner['nome-empresa'] || partner.nomeEmpresa || '';
        document.getElementById('telefone').value = partner.telefone || '';
        document.getElementById('tipoParceria').value = partner['tipo-parceria'] || partner.tipoParceria || '';
        document.getElementById('website').value = partner.website || '';
        document.getElementById('tipoContrato').value = partner['tipo-contrato'] || partner.tipoContrato || '';
        document.getElementById('urlLogo').value = partner['url-logo'] || partner.urlLogo || '';
        
        // Altera botões
        document.getElementById('btnAdd').classList.add('d-none');
        document.getElementById('btnSave').classList.remove('d-none');
        document.getElementById('btnCancel').classList.remove('d-none');
        
        // Scroll para o formulário
        document.getElementById('form-parceria').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
        
        console.log('✅ Formulário preenchido para edição');
        
    } catch (error) {
        console.error('❌ Erro na função prepareEdit:', error);
        alert(`❌ Erro ao carregar dados da parceria.\n\nDetalhes: ${error.message}`);
    }
};

// Limpar formulário
const clearForm = () => {
    document.getElementById('form-parceria').reset();
    document.getElementById('partnerId').value = '';
    document.getElementById('btnAdd').classList.remove('d-none');
    document.getElementById('btnSave').classList.add('d-none');
    document.getElementById('btnCancel').classList.add('d-none');
};

/* ========================================
   EVENT LISTENERS
   ======================================== */

// Aguarda o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM carregado - Inicializando sistema de parcerias');
    
    // Elementos do formulário
    const form = document.getElementById('form-parceria');
    const btnSave = document.getElementById('btnSave');
    const btnCancel = document.getElementById('btnCancel');
    
    // Verifica se os elementos existem
    if (!form) {
        console.error('❌ Formulário não encontrado!');
        return;
    }
    
    console.log('✅ Elementos encontrados');
    
    // Evento para ADICIONAR uma nova parceria
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('📝 Formulário submetido');
        
        // Pega valores do formulário
        const nomeEmpresa = document.getElementById('nomeEmpresa').value.trim();
        const telefone = document.getElementById('telefone').value.trim();
        const tipoParceria = document.getElementById('tipoParceria').value;
        const website = document.getElementById('website').value.trim();
        const tipoContrato = document.getElementById('tipoContrato').value;
        const urlLogo = document.getElementById('urlLogo').value.trim();
        
        console.log('📋 Valores capturados:', {
            nomeEmpresa,
            telefone,
            tipoParceria,
            website,
            tipoContrato,
            urlLogo
        });
        
        // Cria objeto com os nomes corretos do JSON (com hífen)
        const partnerData = {
            'nome-empresa': nomeEmpresa,
            'telefone': telefone,
            'tipo-parceria': tipoParceria,
            'website': website,
            'tipo-contrato': tipoContrato,
            'url-logo': urlLogo
        };
        
        console.log('📤 Objeto a ser enviado:', partnerData);
        
        addPartner(partnerData);
    });
    
    // Evento para SALVAR uma edição
    if (btnSave) {
        btnSave.addEventListener('click', () => {
            console.log('💾 Botão Salvar clicado');
            
            const id = document.getElementById('partnerId').value;
            
            if (!id) {
                alert('❌ Erro: ID da parceria não encontrado!');
                return;
            }
            
            const nomeEmpresa = document.getElementById('nomeEmpresa').value.trim();
            const telefone = document.getElementById('telefone').value.trim();
            const tipoParceria = document.getElementById('tipoParceria').value;
            const website = document.getElementById('website').value.trim();
            const tipoContrato = document.getElementById('tipoContrato').value;
            const urlLogo = document.getElementById('urlLogo').value.trim();
            
            const partnerData = {
                'nome-empresa': nomeEmpresa,
                'telefone': telefone,
                'tipo-parceria': tipoParceria,
                'website': website,
                'tipo-contrato': tipoContrato,
                'url-logo': urlLogo
            };
            
            console.log('📤 Atualizando ID:', id, 'com dados:', partnerData);
            
            updatePartner(id, partnerData);
        });
    }
    
    // Evento do botão Cancelar
    if (btnCancel) {
        btnCancel.addEventListener('click', () => {
            console.log('❌ Botão Cancelar clicado');
            if (confirm('Deseja cancelar a edição?')) {
                clearForm();
            }
        });
    }
    
    // Carrega as parcerias ao iniciar
    console.log('📥 Carregando parcerias iniciais...');
    fetchPartners();
});