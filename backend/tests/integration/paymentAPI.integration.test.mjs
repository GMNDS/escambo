import { assert, test, beforeEach, afterEach } from 'poku';
import { cleanTestData, validateUUID, validateDate } from './setup.mjs';

console.log('🧪 Testes de Integração - API de Pagamentos');

// Setup do servidor para testes
let app;
let server;
const PORT = 3003; // Porta diferente para evitar conflitos

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

// Setup e Cleanup
beforeEach(async () => {
    await cleanTestData();
    
    // Configurar servidor de teste se ainda não estiver rodando
    if (!server) {
        const express = (await import('express')).default;
        const cors = (await import('cors')).default;
        const { clientRoutes, userRoutes, tabRoutes, paymentRoutes } = await import('../../src/routes/index.js');
        
        app = express();
        app.use(cors());
        app.use(express.json());
        
        app.use('/api/clients', clientRoutes);
        app.use('/api/users', userRoutes);
        app.use('/api/tabs', tabRoutes);
        app.use('/api/payments', paymentRoutes);
        
        // Error handler
        app.use((err, req, res, next) => {
            console.error('Test server error:', err);
            res.status(500).json({ success: false, message: 'Internal server error' });
        });
        
        server = app.listen(PORT, () => {
            console.log(`🚀 Servidor de teste de pagamentos rodando na porta ${PORT}`);
        });
        
        // Aguardar servidor inicializar
        await new Promise(resolve => setTimeout(resolve, 1000));
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

// Teste 1: Fluxo Completo de Pagamento
test('Fluxo Completo de Pagamento via API', async () => {
    console.log('\n🧪 Testando fluxo completo de pagamento...');
    
    // 1. Criar usuário
    const userResponse = await makeRequest('POST', '/api/users', {
        username: 'testuser',
        password: 'testpass'
    });
    assert.strictEqual(userResponse.status, 201, 'Usuário deve ser criado');
    const userId = userResponse.data.data.id;
    
    // 2. Criar cliente
    const clientResponse = await makeRequest('POST', '/api/clients', {
        name: 'João Silva',
        phone_number: '11999887766'
    });
    assert.strictEqual(clientResponse.status, 201, 'Cliente deve ser criado');
    const clientId = clientResponse.data.data.id;
    
    // 3. Criar fiado
    const tabResponse = await makeRequest('POST', '/api/tabs', {
        client_id: clientId,
        description: 'Compras do mês',
        value: '200.00',
        status: 'unpaid',
        created_by: userId
    });
    assert.strictEqual(tabResponse.status, 201, 'Fiado deve ser criado');
    const tabId = tabResponse.data.data.id;
    
    // 4. Fazer primeiro pagamento parcial
    const payment1Response = await makeRequest('POST', '/api/payments', {
        tab_id: tabId,
        value: '80.00',
        description: 'Primeiro pagamento'
    });
    assert.strictEqual(payment1Response.status, 201, 'Primeiro pagamento deve ser criado');
    assert.strictEqual(payment1Response.data.success, true, 'Resposta deve ser de sucesso');
    assert(payment1Response.data.message.includes('Restam R$ 120.00'), 'Deve indicar valor restante');
    assert.strictEqual(payment1Response.data.remainingValue, 120, 'Valor restante deve ser 120');
    
    // 5. Verificar status do fiado foi atualizado para 'partial'
    const tabStatusResponse = await makeRequest('GET', `/api/tabs/${tabId}`);
    assert.strictEqual(tabStatusResponse.data.data.status, 'partial', 'Status deve ser partial');
    
    // 6. Fazer segundo pagamento parcial
    const payment2Response = await makeRequest('POST', '/api/payments', {
        tab_id: tabId,
        value: '70.00',
        description: 'Segundo pagamento'
    });
    assert.strictEqual(payment2Response.status, 201, 'Segundo pagamento deve ser criado');
    assert(payment2Response.data.message.includes('Restam R$ 50.00'), 'Deve indicar valor restante');
    
    // 7. Fazer pagamento final (quitação)
    const payment3Response = await makeRequest('POST', '/api/payments', {
        tab_id: tabId,
        value: '50.00',
        description: 'Pagamento final'
    });
    assert.strictEqual(payment3Response.status, 201, 'Pagamento final deve ser criado');
    assert(payment3Response.data.message.includes('Fiado quitado'), 'Deve indicar quitação');
    assert.strictEqual(payment3Response.data.remainingValue, 0, 'Valor restante deve ser 0');
    
    // 8. Verificar status do fiado foi atualizado para 'paid'
    const finalTabStatusResponse = await makeRequest('GET', `/api/tabs/${tabId}`);
    assert.strictEqual(finalTabStatusResponse.data.data.status, 'paid', 'Status deve ser paid');
    
    // 9. Buscar todos os pagamentos do fiado
    const paymentsResponse = await makeRequest('GET', `/api/payments/tab/${tabId}`);
    assert.strictEqual(paymentsResponse.status, 200, 'Deve buscar pagamentos');
    assert.strictEqual(paymentsResponse.data.count, 3, 'Deve ter 3 pagamentos');
    assert.strictEqual(paymentsResponse.data.totalPaid, 200, 'Total pago deve ser 200');
    
    console.log('✅ Fluxo completo de pagamento passou');
});

// Teste 2: Validações de Pagamento
test('Validações de Pagamento', async () => {
    console.log('\n🧪 Testando validações de pagamento...');
    
    // Setup: criar usuário, cliente e fiado
    const userResponse = await makeRequest('POST', '/api/users', {
        username: 'testuser2',
        password: 'testpass2'
    });
    const userId = userResponse.data.data.id;
    
    const clientResponse = await makeRequest('POST', '/api/clients', {
        name: 'Maria Santos',
        phone_number: '11888777666'
    });
    const clientId = clientResponse.data.data.id;
    
    const tabResponse = await makeRequest('POST', '/api/tabs', {
        client_id: clientId,
        description: 'Teste validações',
        value: '100.00',
        status: 'unpaid',
        created_by: userId
    });
    const tabId = tabResponse.data.data.id;
    
    // Teste 2.1: Pagamento sem tab_id
    const noTabIdResponse = await makeRequest('POST', '/api/payments', {
        value: '50.00',
        description: 'Pagamento sem tab'
    });
    assert.strictEqual(noTabIdResponse.status, 400, 'Deve retornar erro 400');
    assert.strictEqual(noTabIdResponse.data.success, false, 'Success deve ser false');
    assert(noTabIdResponse.data.message.includes('tab_id and value are required'), 'Mensagem deve indicar campos obrigatórios');
    
    // Teste 2.2: Pagamento sem valor
    const noValueResponse = await makeRequest('POST', '/api/payments', {
        tab_id: tabId,
        description: 'Pagamento sem valor'
    });
    assert.strictEqual(noValueResponse.status, 400, 'Deve retornar erro 400');
    
    // Teste 2.3: Pagamento com valor inválido
    const invalidValueResponse = await makeRequest('POST', '/api/payments', {
        tab_id: tabId,
        value: 'abc',
        description: 'Pagamento valor inválido'
    });
    assert.strictEqual(invalidValueResponse.status, 400, 'Deve retornar erro 400');
    
    // Teste 2.4: Pagamento com valor zero
    const zeroValueResponse = await makeRequest('POST', '/api/payments', {
        tab_id: tabId,
        value: '0',
        description: 'Pagamento valor zero'
    });
    assert.strictEqual(zeroValueResponse.status, 400, 'Deve retornar erro 400');
    
    // Teste 2.5: Pagamento com tab inexistente
    const invalidTabResponse = await makeRequest('POST', '/api/payments', {
        tab_id: 'tab-inexistente',
        value: '50.00',
        description: 'Pagamento tab inexistente'
    });
    assert.strictEqual(invalidTabResponse.status, 404, 'Deve retornar erro 404');
    
    // Teste 2.6: Pagamento que excede valor restante
    const excessValueResponse = await makeRequest('POST', '/api/payments', {
        tab_id: tabId,
        value: '150.00',
        description: 'Pagamento excessivo'
    });
    assert.strictEqual(excessValueResponse.status, 400, 'Deve retornar erro 400');
    assert(excessValueResponse.data.message.includes('Valor excede o saldo devedor'), 'Mensagem deve indicar excesso');
    
    console.log('✅ Validações de pagamento passaram');
});

// Teste 3: CRUD de Pagamentos
test('CRUD de Pagamentos', async () => {
    console.log('\n🧪 Testando CRUD de pagamentos...');
    
    // Setup
    const userResponse = await makeRequest('POST', '/api/users', {
        username: 'testuser3',
        password: 'testpass3'
    });
    const userId = userResponse.data.data.id;
    
    const clientResponse = await makeRequest('POST', '/api/clients', {
        name: 'Carlos Oliveira',
        phone_number: '11777666555'
    });
    const clientId = clientResponse.data.data.id;
    
    const tabResponse = await makeRequest('POST', '/api/tabs', {
        client_id: clientId,
        description: 'CRUD Test',
        value: '150.00',
        status: 'unpaid',
        created_by: userId
    });
    const tabId = tabResponse.data.data.id;
    
    // 3.1: Criar pagamento (CREATE)
    const createResponse = await makeRequest('POST', '/api/payments', {
        tab_id: tabId,
        value: '75.00',
        description: 'Pagamento teste CRUD'
    });
    assert.strictEqual(createResponse.status, 201, 'Pagamento deve ser criado');
    const paymentId = createResponse.data.data.id;
    validateUUID(paymentId, 'ID do pagamento deve ser UUID válido');
    
    // 3.2: Buscar pagamento por ID (READ)
    const readResponse = await makeRequest('GET', `/api/payments/${paymentId}`);
    assert.strictEqual(readResponse.status, 200, 'Deve buscar pagamento');
    assert.strictEqual(readResponse.data.data.id, paymentId, 'ID deve corresponder');
    assert.strictEqual(readResponse.data.data.tab_id, tabId, 'Tab ID deve corresponder');
    assert.strictEqual(readResponse.data.data.value, '75.00', 'Valor deve corresponder');
    assert.strictEqual(readResponse.data.data.description, 'Pagamento teste CRUD', 'Descrição deve corresponder');
    
    // 3.3: Atualizar pagamento (UPDATE)
    const updateResponse = await makeRequest('PUT', `/api/payments/${paymentId}`, {
        value: '80.00',
        description: 'Pagamento teste CRUD atualizado'
    });
    assert.strictEqual(updateResponse.status, 200, 'Pagamento deve ser atualizado');
    assert.strictEqual(updateResponse.data.data.value, '80.00', 'Valor deve ser atualizado');
    assert.strictEqual(updateResponse.data.data.description, 'Pagamento teste CRUD atualizado', 'Descrição deve ser atualizada');
    
    // 3.4: Buscar todos os pagamentos (READ ALL)
    const readAllResponse = await makeRequest('GET', '/api/payments');
    assert.strictEqual(readAllResponse.status, 200, 'Deve buscar todos os pagamentos');
    assert(readAllResponse.data.count >= 1, 'Deve ter pelo menos 1 pagamento');
    
    // 3.5: Deletar pagamento (DELETE)
    const deleteResponse = await makeRequest('DELETE', `/api/payments/${paymentId}`);
    assert.strictEqual(deleteResponse.status, 200, 'Pagamento deve ser deletado');
    
    // 3.6: Verificar se pagamento foi deletado
    const notFoundResponse = await makeRequest('GET', `/api/payments/${paymentId}`);
    assert.strictEqual(notFoundResponse.status, 404, 'Pagamento não deve ser encontrado');
    
    console.log('✅ CRUD de pagamentos passou');
});

// Teste 4: Endpoint específico de pagamentos por fiado
test('Endpoint de Pagamentos por Fiado', async () => {
    console.log('\n🧪 Testando endpoint de pagamentos por fiado...');
    
    // Setup
    const userResponse = await makeRequest('POST', '/api/users', {
        username: 'testuser4',
        password: 'testpass4'
    });
    const userId = userResponse.data.data.id;
    
    const clientResponse = await makeRequest('POST', '/api/clients', {
        name: 'Ana Costa',
        phone_number: '11666555444'
    });
    const clientId = clientResponse.data.data.id;
    
    // Criar dois fiados
    const tab1Response = await makeRequest('POST', '/api/tabs', {
        client_id: clientId,
        description: 'Fiado 1',
        value: '100.00',
        status: 'unpaid',
        created_by: userId
    });
    const tab1Id = tab1Response.data.data.id;
    
    const tab2Response = await makeRequest('POST', '/api/tabs', {
        client_id: clientId,
        description: 'Fiado 2',
        value: '200.00',
        status: 'unpaid',
        created_by: userId
    });
    const tab2Id = tab2Response.data.data.id;
    
    // Criar pagamentos para fiado 1
    await makeRequest('POST', '/api/payments', {
        tab_id: tab1Id,
        value: '30.00',
        description: 'Pagamento 1 do fiado 1'
    });
    
    await makeRequest('POST', '/api/payments', {
        tab_id: tab1Id,
        value: '20.00',
        description: 'Pagamento 2 do fiado 1'
    });
    
    // Criar pagamento para fiado 2
    await makeRequest('POST', '/api/payments', {
        tab_id: tab2Id,
        value: '100.00',
        description: 'Pagamento 1 do fiado 2'
    });
    
    // 4.1: Buscar pagamentos do fiado 1
    const tab1PaymentsResponse = await makeRequest('GET', `/api/payments/tab/${tab1Id}`);
    assert.strictEqual(tab1PaymentsResponse.status, 200, 'Deve buscar pagamentos do fiado 1');
    assert.strictEqual(tab1PaymentsResponse.data.count, 2, 'Fiado 1 deve ter 2 pagamentos');
    assert.strictEqual(tab1PaymentsResponse.data.totalPaid, 50, 'Total pago do fiado 1 deve ser 50');
    
    // 4.2: Buscar pagamentos do fiado 2
    const tab2PaymentsResponse = await makeRequest('GET', `/api/payments/tab/${tab2Id}`);
    assert.strictEqual(tab2PaymentsResponse.status, 200, 'Deve buscar pagamentos do fiado 2');
    assert.strictEqual(tab2PaymentsResponse.data.count, 1, 'Fiado 2 deve ter 1 pagamento');
    assert.strictEqual(tab2PaymentsResponse.data.totalPaid, 100, 'Total pago do fiado 2 deve ser 100');
    
    // 4.3: Buscar pagamentos de fiado inexistente
    const invalidTabPaymentsResponse = await makeRequest('GET', '/api/payments/tab/tab-inexistente');
    assert.strictEqual(invalidTabPaymentsResponse.status, 200, 'Deve retornar sucesso para fiado inexistente');
    assert.strictEqual(invalidTabPaymentsResponse.data.count, 0, 'Deve retornar 0 pagamentos');
    assert.strictEqual(invalidTabPaymentsResponse.data.totalPaid, 0, 'Total pago deve ser 0');
    
    // 4.4: Buscar pagamentos sem tab_id
    const noTabIdResponse = await makeRequest('GET', '/api/payments/tab/');
    assert.strictEqual(noTabIdResponse.status, 404, 'Deve retornar 404 para rota inválida');
    
    console.log('✅ Endpoint de pagamentos por fiado passou');
});

// Teste 5: Validações de Atualização e Deleção
test('Validações de Atualização e Deleção', async () => {
    console.log('\n🧪 Testando validações de atualização e deleção...');
    
    // 5.1: Atualizar pagamento inexistente
    const updateInvalidResponse = await makeRequest('PUT', '/api/payments/payment-inexistente', {
        value: '50.00'
    });
    assert.strictEqual(updateInvalidResponse.status, 404, 'Deve retornar 404 para pagamento inexistente');
    
    // 5.2: Atualizar sem ID
    const updateNoIdResponse = await makeRequest('PUT', '/api/payments/', {
        value: '50.00'
    });
    assert.strictEqual(updateNoIdResponse.status, 404, 'Deve retornar 404 para rota sem ID');
    
    // 5.3: Deletar pagamento inexistente
    const deleteInvalidResponse = await makeRequest('DELETE', '/api/payments/payment-inexistente');
    assert.strictEqual(deleteInvalidResponse.status, 404, 'Deve retornar 404 para pagamento inexistente');
    
    // 5.4: Buscar pagamento inexistente
    const getInvalidResponse = await makeRequest('GET', '/api/payments/payment-inexistente');
    assert.strictEqual(getInvalidResponse.status, 404, 'Deve retornar 404 para pagamento inexistente');
    
    console.log('✅ Validações de atualização e deleção passaram');
});

console.log('\n🎉 Todos os testes de integração da API de Pagamentos passaram!');
