import { assert, test, beforeEach, afterEach } from 'poku';
import { cleanTestData, validateUUID, validateDate } from './setup.mjs';

console.log('🧪 Testes de Integração - API Sistema Completo');

// Setup do servidor para testes
let app;
let server;
const PORT = 3002; // Porta diferente para evitar conflitos

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
        
        // Rotas
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
            console.log(`🚀 Servidor de teste completo rodando na porta ${PORT}`);
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

// Teste 1: Fluxo Completo via API - Criar Usuário, Cliente, Tab e Pagamento
test('Fluxo Completo via API', async () => {
    console.log('\n🧪 Teste 1: Fluxo Completo via API');
    
    // 1. Criar usuário
    console.log('1️⃣ Criando usuário via API...');
    const userResponse = await makeRequest('POST', '/api/users', {
        username: 'admin_test',
        password: 'senha123'
    });
    
    assert.strictEqual(userResponse.status, 201, 'Status deve ser 201');
    assert.strictEqual(userResponse.data.success, true, 'Resposta deve indicar sucesso');
    
    const user = userResponse.data.data;
    assert.ok(validateUUID(user.id), 'Usuário deve ter ID UUID válido');
    assert.strictEqual(user.username, 'admin_test', 'Username deve estar correto');
    console.log('✅ Usuário criado via API');
    
    // 2. Criar cliente
    console.log('2️⃣ Criando cliente via API...');
    const clientResponse = await makeRequest('POST', '/api/clients', {
        name: 'João Silva',
        phone_number: '11999887766'
    });
    
    assert.strictEqual(clientResponse.status, 201, 'Status deve ser 201');
    assert.strictEqual(clientResponse.data.success, true, 'Resposta deve indicar sucesso');
    
    const client = clientResponse.data.data;
    assert.ok(validateUUID(client.id), 'Cliente deve ter ID UUID válido');
    assert.strictEqual(client.name, 'João Silva', 'Nome deve estar correto');
    console.log('✅ Cliente criado via API');
    
    // 3. Criar tab
    console.log('3️⃣ Criando tab via API...');
    const tabResponse = await makeRequest('POST', '/api/tabs', {
        client_id: client.id,
        description: 'Compras do mês',
        value: '150.50',
        status: 'unpaid',
        created_by: user.id
    });
    
    assert.strictEqual(tabResponse.status, 201, 'Status deve ser 201');
    assert.strictEqual(tabResponse.data.success, true, 'Resposta deve indicar sucesso');
    
    const tab = tabResponse.data.data;
    assert.ok(validateUUID(tab.id), 'Tab deve ter ID UUID válido');
    assert.strictEqual(tab.client_id, client.id, 'client_id deve estar correto');
    assert.strictEqual(tab.created_by, user.id, 'created_by deve estar correto');
    assert.strictEqual(tab.value, '150.50', 'Valor deve estar correto');
    console.log('✅ Tab criada via API');
    
    // 4. Criar pagamento parcial
    console.log('4️⃣ Criando pagamento via API...');
    const paymentResponse = await makeRequest('POST', '/api/payments', {
        tab_id: tab.id,
        value: '50.00'
    });
    
    assert.strictEqual(paymentResponse.status, 201, 'Status deve ser 201');
    assert.strictEqual(paymentResponse.data.success, true, 'Resposta deve indicar sucesso');
    
    const payment = paymentResponse.data.data;
    assert.ok(validateUUID(payment.id), 'Pagamento deve ter ID UUID válido');
    assert.strictEqual(payment.tab_id, tab.id, 'tab_id deve estar correto');
    assert.strictEqual(payment.value, '50.00', 'Valor deve estar correto');
    console.log('✅ Pagamento criado via API');
    
    // 5. Verificar listagens
    console.log('5️⃣ Verificando listagens via API...');
    
    // Listar usuários
    const usersListResponse = await makeRequest('GET', '/api/users');
    assert.strictEqual(usersListResponse.data.count, 1, 'Deve ter 1 usuário');
    
    // Listar clientes
    const clientsListResponse = await makeRequest('GET', '/api/clients');
    assert.strictEqual(clientsListResponse.data.count, 1, 'Deve ter 1 cliente');
    
    // Listar tabs
    const tabsListResponse = await makeRequest('GET', '/api/tabs');
    assert.strictEqual(tabsListResponse.data.count, 1, 'Deve ter 1 tab');
    
    // Listar pagamentos
    const paymentsListResponse = await makeRequest('GET', '/api/payments');
    assert.strictEqual(paymentsListResponse.data.count, 1, 'Deve ter 1 pagamento');
    
    console.log('✅ Todas as listagens funcionando');
    
    // 6. Buscar entidades por ID
    console.log('6️⃣ Buscando entidades por ID...');
    
    const userByIdResponse = await makeRequest('GET', `/api/users/${user.id}`);
    assert.strictEqual(userByIdResponse.status, 200, 'Usuário deve ser encontrado');
    
    const clientByIdResponse = await makeRequest('GET', `/api/clients/${client.id}`);
    assert.strictEqual(clientByIdResponse.status, 200, 'Cliente deve ser encontrado');
    
    const tabByIdResponse = await makeRequest('GET', `/api/tabs/${tab.id}`);
    assert.strictEqual(tabByIdResponse.status, 200, 'Tab deve ser encontrada');
    
    const paymentByIdResponse = await makeRequest('GET', `/api/payments/${payment.id}`);
    assert.strictEqual(paymentByIdResponse.status, 200, 'Pagamento deve ser encontrado');
    
    console.log('✅ Todas as buscas por ID funcionando');
    
    // 7. Atualizar entidades
    console.log('7️⃣ Atualizando entidades...');
    
    // Atualizar cliente
    const clientUpdateResponse = await makeRequest('PUT', `/api/clients/${client.id}`, {
        name: 'João Santos',
        phone_number: '11888776655'
    });
    assert.strictEqual(clientUpdateResponse.status, 200, 'Cliente deve ser atualizado');
    
    // Atualizar tab
    const tabUpdateResponse = await makeRequest('PUT', `/api/tabs/${tab.id}`, {
        description: 'Compras atualizadas',
        status: 'partial'
    });
    assert.strictEqual(tabUpdateResponse.status, 200, 'Tab deve ser atualizada');
    
    console.log('✅ Atualizações funcionando');
    
    // 8. Criar segundo pagamento para quitar
    console.log('8️⃣ Quitando tab...');
    const secondPaymentResponse = await makeRequest('POST', '/api/payments', {
        tab_id: tab.id,
        value: '100.50'
    });
    
    assert.strictEqual(secondPaymentResponse.status, 201, 'Segundo pagamento deve ser criado');
    
    // Atualizar status da tab para pago
    const tabPaidResponse = await makeRequest('PUT', `/api/tabs/${tab.id}`, {
        status: 'paid'
    });
    assert.strictEqual(tabPaidResponse.status, 200, 'Tab deve ser marcada como paga');
    
    console.log('✅ Tab quitada com sucesso');
    
    console.log('🎉 Fluxo completo via API executado com sucesso!');
});

// Teste 2: Validações e Tratamento de Erros via API
test('Validações e Tratamento de Erros via API', async () => {
    console.log('\n🧪 Teste 2: Validações e Tratamento de Erros via API');
    
    // Teste criação de usuário sem dados
    console.log('❌ Testando criação de usuário sem dados...');
    const noUserDataResponse = await makeRequest('POST', '/api/users', {});
    assert.strictEqual(noUserDataResponse.status, 400, 'Status deve ser 400');
    
    // Teste criação de cliente sem dados
    console.log('❌ Testando criação de cliente sem dados...');
    const noClientDataResponse = await makeRequest('POST', '/api/clients', {});
    assert.strictEqual(noClientDataResponse.status, 400, 'Status deve ser 400');
    
    // Criar dados válidos para próximos testes
    const userResponse = await makeRequest('POST', '/api/users', {
        username: 'test_user',
        password: 'password123'
    });
    const user = userResponse.data.data;
    
    const clientResponse = await makeRequest('POST', '/api/clients', {
        name: 'Cliente Teste',
        phone_number: '11999887766'
    });
    const client = clientResponse.data.data;
    
    // Teste criação de tab sem dados obrigatórios
    console.log('❌ Testando criação de tab sem dados...');
    const noTabDataResponse = await makeRequest('POST', '/api/tabs', {
        description: 'Tab incompleta'
    });
    assert.strictEqual(noTabDataResponse.status, 400, 'Status deve ser 400');
    
    // Teste criação de pagamento sem dados
    console.log('❌ Testando criação de pagamento sem dados...');
    const noPaymentDataResponse = await makeRequest('POST', '/api/payments', {});
    assert.strictEqual(noPaymentDataResponse.status, 400, 'Status deve ser 400');
    
    // Teste busca com IDs inexistentes
    console.log('❌ Testando busca com IDs inexistentes...');
    const fakeId = '123e4567-e89b-12d3-a456-426614174000';
    
    const userNotFoundResponse = await makeRequest('GET', `/api/users/${fakeId}`);
    assert.strictEqual(userNotFoundResponse.status, 404, 'Usuário não deve ser encontrado');
    
    const clientNotFoundResponse = await makeRequest('GET', `/api/clients/${fakeId}`);
    assert.strictEqual(clientNotFoundResponse.status, 404, 'Cliente não deve ser encontrado');
    
    const tabNotFoundResponse = await makeRequest('GET', `/api/tabs/${fakeId}`);
    assert.strictEqual(tabNotFoundResponse.status, 404, 'Tab não deve ser encontrada');
    
    const paymentNotFoundResponse = await makeRequest('GET', `/api/payments/${fakeId}`);
    assert.strictEqual(paymentNotFoundResponse.status, 404, 'Pagamento não deve ser encontrado');
    
    console.log('✅ Todas as validações de erro funcionando');
});

// Teste 3: Performance de API com Múltiplas Requisições
test('Performance de API com Múltiplas Requisições', async () => {
    console.log('\n🧪 Teste 3: Performance de API com Múltiplas Requisições');
    
    // Criar usuário base
    const userResponse = await makeRequest('POST', '/api/users', {
        username: 'performance_user',
        password: 'password123'
    });
    const user = userResponse.data.data;
    
    // Teste criação múltipla de clientes
    console.log('🚀 Testando criação múltipla de clientes...');
    const clientPromises = [];
    const clientCount = 10;
    
    for (let i = 0; i < clientCount; i++) {
        clientPromises.push(
            makeRequest('POST', '/api/clients', {
                name: `Cliente ${i}`,
                phone_number: `1199988776${i}`
            })
        );
    }
    
    const startTime = Date.now();
    const clientResponses = await Promise.all(clientPromises);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    assert.strictEqual(clientResponses.length, clientCount, `Deve criar ${clientCount} clientes`);
    clientResponses.forEach((response, index) => {
        assert.strictEqual(response.status, 201, `Cliente ${index} deve ser criado`);
    });
    assert.ok(duration < 5000, 'Criação múltipla deve ser rápida (< 5s)');
    console.log(`✅ ${clientCount} clientes criados em ${duration}ms`);
    
    // Teste listagem com múltiplos registros
    console.log('📊 Testando listagem com múltiplos registros...');
    const listStartTime = Date.now();
    const listResponse = await makeRequest('GET', '/api/clients');
    const listEndTime = Date.now();
    const listDuration = listEndTime - listStartTime;
    
    assert.strictEqual(listResponse.data.count, clientCount, `Deve listar ${clientCount} clientes`);
    assert.ok(listDuration < 1000, 'Listagem deve ser rápida (< 1s)');
    console.log(`✅ Listagem de ${clientCount} clientes em ${listDuration}ms`);
    
    // Teste criação múltipla de tabs
    console.log('📋 Testando criação múltipla de tabs...');
    const clients = listResponse.data.data;
    const tabPromises = [];
    
    for (let i = 0; i < Math.min(clients.length, 5); i++) {
        tabPromises.push(
            makeRequest('POST', '/api/tabs', {
                client_id: clients[i].id,
                description: `Tab ${i}`,
                value: `${(i + 1) * 25}.00`,
                status: 'unpaid',
                created_by: user.id
            })
        );
    }
    
    const tabStartTime = Date.now();
    const tabResponses = await Promise.all(tabPromises);
    const tabEndTime = Date.now();
    const tabDuration = tabEndTime - tabStartTime;
    
    assert.strictEqual(tabResponses.length, 5, 'Deve criar 5 tabs');
    tabResponses.forEach((response, index) => {
        assert.strictEqual(response.status, 201, `Tab ${index} deve ser criada`);
    });
    assert.ok(tabDuration < 3000, 'Criação de tabs deve ser rápida (< 3s)');
    console.log(`✅ 5 tabs criadas em ${tabDuration}ms`);
    
    console.log('✅ Testes de performance de API concluídos');
});

// Teste 4: Cenários de Negócio Reais
test('Cenários de Negócio Reais', async () => {
    console.log('\n🧪 Teste 4: Cenários de Negócio Reais');
    
    // Cenário: Bar/Restaurante com múltiplos clientes e tabs
    console.log('🍺 Simulando cenário de bar/restaurante...');
    
    // Criar usuário (garçom/atendente)
    const waiterResponse = await makeRequest('POST', '/api/users', {
        username: 'garcom01',
        password: 'senha123'
    });
    const waiter = waiterResponse.data.data;
    
    // Criar clientes frequentes
    const regularClients = [
        { name: 'João da Padaria', phone_number: '11999001122' },
        { name: 'Maria do Mercado', phone_number: '11999003344' },
        { name: 'Pedro Mecânico', phone_number: '11999005566' }
    ];
    
    const clientPromises = regularClients.map(clientData => 
        makeRequest('POST', '/api/clients', clientData)
    );
    const clientResponses = await Promise.all(clientPromises);
    const clients = clientResponses.map(response => response.data.data);
    
    console.log(`✅ ${clients.length} clientes regulares criados`);
    
    // Cenário 1: Cliente com tab em aberto
    console.log('📋 Criando tabs em aberto...');
    const openTab = await makeRequest('POST', '/api/tabs', {
        client_id: clients[0].id,
        description: 'Mesa 5 - João',
        value: '0.00', // Valor inicial zerado
        status: 'unpaid',
        created_by: waiter.id
    });
    
    // Adicionando "compras" à tab (simulando pedidos)
    const orders = [
        { value: '15.50' }, // Cerveja
        { value: '8.00' },  // Petisco
        { value: '12.00' }  // Outra cerveja
    ];
    
    let totalTab = 0;
    for (const order of orders) {
        await makeRequest('POST', '/api/payments', {
            tab_id: openTab.data.data.id,
            value: order.value
        });
        totalTab += Number.parseFloat(order.value);
    }
    
    // Atualizar valor total da tab
    await makeRequest('PUT', `/api/tabs/${openTab.data.data.id}`, {
        value: totalTab.toFixed(2)
    });
    
    console.log(`✅ Tab em aberto criada com total R$ ${totalTab.toFixed(2)}`);
    
    // Cenário 2: Cliente pagando tab parcialmente
    console.log('💰 Simulando pagamento parcial...');
    const partialPayment = await makeRequest('POST', '/api/payments', {
        tab_id: openTab.data.data.id,
        value: '20.00'
    });
    
    await makeRequest('PUT', `/api/tabs/${openTab.data.data.id}`, {
        status: 'partial'
    });
    
    console.log('✅ Pagamento parcial processado');
    
    // Cenário 3: Cliente quitando tab
    console.log('✅ Simulando quitação da tab...');
    const remainingAmount = totalTab - 20.00;
    const finalPayment = await makeRequest('POST', '/api/payments', {
        tab_id: openTab.data.data.id,
        value: remainingAmount.toFixed(2)
    });
    
    await makeRequest('PUT', `/api/tabs/${openTab.data.data.id}`, {
        status: 'paid'
    });
    
    console.log('✅ Tab quitada completamente');
    
    // Verificar balanço final
    console.log('📊 Verificando balanço final...');
    const allPayments = await makeRequest('GET', '/api/payments');
    const tabPayments = allPayments.data.data.filter(p => p.tab_id === openTab.data.data.id);
    
    const totalPaid = tabPayments.reduce((sum, payment) => sum + Number.parseFloat(payment.value), 0);
    assert.strictEqual(Number.parseFloat(totalPaid.toFixed(2)), totalTab, 'Total pago deve igualar valor da tab');
    
    console.log(`✅ Balanço correto: R$ ${totalPaid.toFixed(2)}`);
    
    // Cenário 4: Relatório do dia
    console.log('📈 Gerando relatório do dia...');
    const allTabs = await makeRequest('GET', '/api/tabs');
    const allClientsResponse = await makeRequest('GET', '/api/clients');
    const allUsersResponse = await makeRequest('GET', '/api/users');
    
    console.log(`📊 Relatório do Dia:
    - Clientes: ${allClientsResponse.data.count}
    - Usuários: ${allUsersResponse.data.count}
    - Tabs: ${allTabs.data.count}
    - Pagamentos: ${allPayments.data.count}
    - Total arrecadado: R$ ${totalPaid.toFixed(2)}`);
    
    console.log('✅ Cenário de negócio completo executado com sucesso');
});

console.log('🎉 Todos os testes de integração da API completa passaram!');
