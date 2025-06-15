import { assert, test, beforeEach, afterEach } from 'poku';
import { cleanTestData, validateUUID, validateDate } from './setup.mjs';

console.log('🧪 Testes de Integração - Client API Endpoints');

// Importar e configurar servidor para testes
let app;
let server;
const PORT = 3001; // Porta diferente para não conflitar

// Helper para fazer requisições HTTP
async function makeRequest(method, path, body = null) {
    const baseUrl = `http://localhost:${PORT}`;
    const url = `${baseUrl}${path}`;
    
    const options = {
        method: method.toUpperCase(),
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return {
            status: response.status,
            data: data,
            ok: response.ok
        };
    } catch (error) {
        throw new Error(`Erro na requisição ${method} ${path}: ${error.message}`);
    }
}

// Setup do servidor para testes
beforeEach(async () => {
    await cleanTestData();
    
    // Configurar servidor de teste se ainda não estiver rodando
    if (!server) {
        // Importar e configurar express app
        const express = (await import('express')).default;
        const cors = (await import('cors')).default;
        const { clientRoutes } = await import('../../src/routes/index.js');
        
        app = express();
        app.use(cors());
        app.use(express.json());
        app.use('/api/clients', clientRoutes);
        
        // Error handler para testes
        app.use((err, req, res, next) => {
            console.error('Test server error:', err);
            res.status(500).json({ success: false, message: 'Internal server error' });
        });
        
        server = app.listen(PORT, () => {
            console.log(`🚀 Servidor de teste rodando na porta ${PORT}`);
        });
        
        // Aguardar servidor inicializar
        await new Promise(resolve => setTimeout(resolve, 500));
    }
});

afterEach(async () => {
    await cleanTestData();
});

// Cleanup final
process.on('exit', () => {
    if (server) {
        server.close();
    }
});

// Teste 1: GET /api/clients - Listar todos os clientes
test('GET /api/clients - Listar todos os clientes', async () => {
    console.log('\n🧪 Teste 1: GET /api/clients');
    
    // Teste com lista vazia
    console.log('📋 Testando lista vazia...');
    const emptyResponse = await makeRequest('GET', '/api/clients');
    
    assert.strictEqual(emptyResponse.status, 200, 'Status deve ser 200');
    assert.strictEqual(emptyResponse.data.success, true, 'Resposta deve indicar sucesso');
    assert.ok(Array.isArray(emptyResponse.data.data), 'Data deve ser array');
    assert.strictEqual(emptyResponse.data.count, 0, 'Count deve ser 0');
    console.log('✅ Lista vazia retornada corretamente');
    
    // Criar alguns clientes primeiro
    console.log('📝 Criando clientes para teste...');
    const client1 = await makeRequest('POST', '/api/clients', {
        name: 'João Silva',
        phone_number: '11999887766'
    });
    const client2 = await makeRequest('POST', '/api/clients', {
        name: 'Maria Santos',
        phone_number: '11888776655'
    });
    
    // Teste com lista preenchida
    console.log('📋 Testando lista com clientes...');
    const response = await makeRequest('GET', '/api/clients');
    
    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert.strictEqual(response.data.success, true, 'Resposta deve indicar sucesso');
    assert.ok(Array.isArray(response.data.data), 'Data deve ser array');
    assert.strictEqual(response.data.count, 2, 'Count deve ser 2');
    
    // Verificar estrutura dos clientes
    const clients = response.data.data;
    clients.forEach((client, index) => {
        assert.ok(validateUUID(client.id), `Cliente ${index} deve ter ID UUID válido`);
        assert.ok(typeof client.name === 'string', `Cliente ${index} deve ter nome string`);
        assert.ok(typeof client.phone_number === 'string', `Cliente ${index} deve ter telefone string`);
        assert.ok(validateDate(client.created_at), `Cliente ${index} deve ter created_at válido`);
        assert.ok(validateDate(client.updated_at), `Cliente ${index} deve ter updated_at válido`);
    });
    
    console.log('✅ Lista com clientes retornada corretamente');
});

// Teste 2: POST /api/clients - Criar novo cliente
test('POST /api/clients - Criar novo cliente', async () => {
    console.log('\n🧪 Teste 2: POST /api/clients');
    
    // Teste criação com dados válidos
    console.log('📝 Testando criação com dados válidos...');
    const clientData = {
        name: 'João Silva',
        phone_number: '11999887766'
    };
    
    const response = await makeRequest('POST', '/api/clients', clientData);
    
    assert.strictEqual(response.status, 201, 'Status deve ser 201');
    assert.strictEqual(response.data.success, true, 'Resposta deve indicar sucesso');
    assert.ok(response.data.data, 'Deve retornar dados do cliente');
    
    const client = response.data.data;
    assert.ok(validateUUID(client.id), 'Cliente deve ter ID UUID válido');
    assert.strictEqual(client.name, 'João Silva', 'Nome deve estar correto');
    assert.strictEqual(client.phone_number, '11999887766', 'Telefone deve estar correto');
    assert.ok(validateDate(client.created_at), 'created_at deve ser válido');
    assert.ok(validateDate(client.updated_at), 'updated_at deve ser válido');
    console.log('✅ Cliente criado com sucesso');
    
    // Teste criação sem nome
    console.log('❌ Testando criação sem nome...');
    const noNameResponse = await makeRequest('POST', '/api/clients', {
        phone_number: '11999887766'
    });
    
    assert.strictEqual(noNameResponse.status, 400, 'Status deve ser 400');
    assert.strictEqual(noNameResponse.data.success, false, 'Resposta deve indicar falha');
    assert.strictEqual(noNameResponse.data.message, 'Name and phone number are required');
    console.log('✅ Validação de nome funcionando');
    
    // Teste criação sem telefone
    console.log('❌ Testando criação sem telefone...');
    const noPhoneResponse = await makeRequest('POST', '/api/clients', {
        name: 'João Silva'
    });
    
    assert.strictEqual(noPhoneResponse.status, 400, 'Status deve ser 400');
    assert.strictEqual(noPhoneResponse.data.success, false, 'Resposta deve indicar falha');
    assert.strictEqual(noPhoneResponse.data.message, 'Name and phone number are required');
    console.log('✅ Validação de telefone funcionando');
});

// Teste 3: GET /api/clients/:id - Buscar cliente por ID
test('GET /api/clients/:id - Buscar cliente por ID', async () => {
    console.log('\n🧪 Teste 3: GET /api/clients/:id');
    
    // Criar cliente primeiro
    console.log('📝 Criando cliente para teste...');
    const createResponse = await makeRequest('POST', '/api/clients', {
        name: 'João Silva',
        phone_number: '11999887766'
    });
    const clientId = createResponse.data.data.id;
    
    // Teste busca com ID válido
    console.log('🔍 Testando busca com ID válido...');
    const response = await makeRequest('GET', `/api/clients/${clientId}`);
    
    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert.strictEqual(response.data.success, true, 'Resposta deve indicar sucesso');
    
    const client = response.data.data;
    assert.strictEqual(client.id, clientId, 'ID deve coincidir');
    assert.strictEqual(client.name, 'João Silva', 'Nome deve estar correto');
    assert.strictEqual(client.phone_number, '11999887766', 'Telefone deve estar correto');
    console.log('✅ Cliente encontrado com sucesso');
    
    // Teste busca com ID inexistente
    console.log('❌ Testando busca com ID inexistente...');
    const fakeId = '123e4567-e89b-12d3-a456-426614174000';
    const notFoundResponse = await makeRequest('GET', `/api/clients/${fakeId}`);
    
    assert.strictEqual(notFoundResponse.status, 404, 'Status deve ser 404');
    assert.strictEqual(notFoundResponse.data.success, false, 'Resposta deve indicar falha');
    assert.strictEqual(notFoundResponse.data.message, 'Client not found');
    console.log('✅ Cliente inexistente tratado corretamente');
});

// Teste 4: PUT /api/clients/:id - Atualizar cliente
test('PUT /api/clients/:id - Atualizar cliente', async () => {
    console.log('\n🧪 Teste 4: PUT /api/clients/:id');
    
    // Criar cliente primeiro
    console.log('📝 Criando cliente para teste...');
    const createResponse = await makeRequest('POST', '/api/clients', {
        name: 'João Silva',
        phone_number: '11999887766'
    });
    const clientId = createResponse.data.data.id;
    
    // Teste atualização com dados válidos
    console.log('✏️  Testando atualização com dados válidos...');
    const updateData = {
        name: 'João Santos',
        phone_number: '11888776655'
    };
    
    const response = await makeRequest('PUT', `/api/clients/${clientId}`, updateData);
    
    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert.strictEqual(response.data.success, true, 'Resposta deve indicar sucesso');
    
    const client = response.data.data;
    assert.strictEqual(client.id, clientId, 'ID deve permanecer o mesmo');
    assert.strictEqual(client.name, 'João Santos', 'Nome deve estar atualizado');
    assert.strictEqual(client.phone_number, '11888776655', 'Telefone deve estar atualizado');
    console.log('✅ Cliente atualizado com sucesso');
    
    // Verificar se foi realmente atualizado no banco
    console.log('🔍 Verificando persistência da atualização...');
    const getResponse = await makeRequest('GET', `/api/clients/${clientId}`);
    const updatedClient = getResponse.data.data;
    
    assert.strictEqual(updatedClient.name, 'João Santos', 'Nome deve persistir atualização');
    assert.strictEqual(updatedClient.phone_number, '11888776655', 'Telefone deve persistir atualização');
    console.log('✅ Atualização persistida corretamente');
    
    // Teste atualização com ID inexistente
    console.log('❌ Testando atualização com ID inexistente...');
    const fakeId = '123e4567-e89b-12d3-a456-426614174000';
    const notFoundResponse = await makeRequest('PUT', `/api/clients/${fakeId}`, updateData);
    
    assert.strictEqual(notFoundResponse.status, 404, 'Status deve ser 404');
    assert.strictEqual(notFoundResponse.data.success, false, 'Resposta deve indicar falha');
    assert.strictEqual(notFoundResponse.data.message, 'Client not found');
    console.log('✅ Cliente inexistente tratado corretamente');
});

// Teste 5: DELETE /api/clients/:id - Deletar cliente
test('DELETE /api/clients/:id - Deletar cliente', async () => {
    console.log('\n🧪 Teste 5: DELETE /api/clients/:id');
    
    // Criar cliente primeiro
    console.log('📝 Criando cliente para teste...');
    const createResponse = await makeRequest('POST', '/api/clients', {
        name: 'João Silva',
        phone_number: '11999887766'
    });
    const clientId = createResponse.data.data.id;
    
    // Verificar que cliente existe
    console.log('🔍 Verificando que cliente existe...');
    const existsResponse = await makeRequest('GET', `/api/clients/${clientId}`);
    assert.strictEqual(existsResponse.status, 200, 'Cliente deve existir antes da exclusão');
    
    // Teste exclusão com ID válido
    console.log('🗑️  Testando exclusão com ID válido...');
    const response = await makeRequest('DELETE', `/api/clients/${clientId}`);
    
    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert.strictEqual(response.data.success, true, 'Resposta deve indicar sucesso');
    assert.strictEqual(response.data.message, 'Client deleted');
    console.log('✅ Cliente deletado com sucesso');
    
    // Verificar que cliente foi realmente deletado
    console.log('🔍 Verificando que cliente foi deletado...');
    const notFoundResponse = await makeRequest('GET', `/api/clients/${clientId}`);
    assert.strictEqual(notFoundResponse.status, 404, 'Cliente não deve mais existir');
    console.log('✅ Cliente realmente removido do banco');
    
    // Teste exclusão com ID inexistente
    console.log('❌ Testando exclusão com ID inexistente...');
    const fakeId = '123e4567-e89b-12d3-a456-426614174000';
    const deleteNotFoundResponse = await makeRequest('DELETE', `/api/clients/${fakeId}`);
    
    assert.strictEqual(deleteNotFoundResponse.status, 404, 'Status deve ser 404');
    assert.strictEqual(deleteNotFoundResponse.data.success, false, 'Resposta deve indicar falha');
    assert.strictEqual(deleteNotFoundResponse.data.message, 'Client not found');
    console.log('✅ Cliente inexistente tratado corretamente');
});

// Teste 6: Fluxo Completo de CRUD via API
test('Fluxo Completo de CRUD via API', async () => {
    console.log('\n🧪 Teste 6: Fluxo Completo de CRUD via API');
    
    // 1. Verificar lista vazia inicial
    console.log('1️⃣ Verificando lista vazia inicial...');
    const initialList = await makeRequest('GET', '/api/clients');
    assert.strictEqual(initialList.data.count, 0, 'Lista deve estar vazia inicialmente');
    
    // 2. Criar múltiplos clientes
    console.log('2️⃣ Criando múltiplos clientes...');
    const clients = [
        { name: 'João Silva', phone_number: '11999887766' },
        { name: 'Maria Santos', phone_number: '11888776655' },
        { name: 'Pedro Oliveira', phone_number: '11777665544' }
    ];
    
    const createdClients = [];
    for (const clientData of clients) {
        const response = await makeRequest('POST', '/api/clients', clientData);
        assert.strictEqual(response.status, 201, 'Cliente deve ser criado');
        createdClients.push(response.data.data);
    }
    console.log(`✅ ${createdClients.length} clientes criados`);
    
    // 3. Verificar lista completa
    console.log('3️⃣ Verificando lista completa...');
    const fullList = await makeRequest('GET', '/api/clients');
    assert.strictEqual(fullList.data.count, 3, 'Lista deve ter 3 clientes');
    
    // 4. Buscar cada cliente individualmente
    console.log('4️⃣ Buscando clientes individualmente...');
    for (const client of createdClients) {
        const response = await makeRequest('GET', `/api/clients/${client.id}`);
        assert.strictEqual(response.status, 200, 'Cliente deve ser encontrado');
        assert.strictEqual(response.data.data.id, client.id, 'ID deve coincidir');
    }
    console.log('✅ Todos os clientes encontrados');
    
    // 5. Atualizar um cliente
    console.log('5️⃣ Atualizando um cliente...');
    const clientToUpdate = createdClients[0];
    const updateResponse = await makeRequest('PUT', `/api/clients/${clientToUpdate.id}`, {
        name: 'João Silva Santos',
        phone_number: '11999000111'
    });
    assert.strictEqual(updateResponse.status, 200, 'Cliente deve ser atualizado');
    
    // 6. Deletar um cliente
    console.log('6️⃣ Deletando um cliente...');
    const clientToDelete = createdClients[1];
    const deleteResponse = await makeRequest('DELETE', `/api/clients/${clientToDelete.id}`);
    assert.strictEqual(deleteResponse.status, 200, 'Cliente deve ser deletado');
    
    // 7. Verificar lista final
    console.log('7️⃣ Verificando lista final...');
    const finalList = await makeRequest('GET', '/api/clients');
    assert.strictEqual(finalList.data.count, 2, 'Lista deve ter 2 clientes restantes');
    
    console.log('✅ Fluxo completo de CRUD via API executado com sucesso');
});

console.log('🎉 Todos os testes de integração da API Client passaram!');
