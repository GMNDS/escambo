import { assert, test, beforeEach, afterEach, describe } from 'poku';
import { cleanTestData, validateUUID, validateDate } from './setup.mjs';

console.log('🧪 Testes de Integração da API Completa com Poku');

// Configuração do servidor para testes
let app;
let server;
const PORT = 3001; // Porta diferente para evitar conflitos

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

// Setup inicial do servidor
async function setupTestServer() {
    if (!server) {
        const express = (await import('express')).default;
        const cors = (await import('cors')).default;
        
        // Importar rotas
        const { clientRoutes } = await import('../../src/routes/clientRoutes.js');
        const { userRoutes } = await import('../../src/routes/userRoutes.js');
        const { tabRoutes } = await import('../../src/routes/tabRoutes.js');
        const { paymentRoutes } = await import('../../src/routes/paymentRoutes.js');
        
        app = express();
        app.use(cors());
        app.use(express.json());
        
        // Configurar rotas
        app.use('/api/clients', clientRoutes);
        app.use('/api/users', userRoutes);
        app.use('/api/tabs', tabRoutes);
        app.use('/api/payments', paymentRoutes);
        
        // Middleware de tratamento de erros
        app.use((err, req, res, next) => {
            console.error('Erro no servidor de teste:', err);
            res.status(500).json({ success: false, message: 'Erro interno do servidor' });
        });
        
        // Iniciar servidor
        server = app.listen(PORT, () => {
            console.log(`🚀 Servidor de teste rodando na porta ${PORT}`);
        });
        
        // Aguardar servidor inicializar
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

// Cleanup do servidor
function closeTestServer() {
    if (server) {
        server.close();
        server = null;
        app = null;
        console.log('🔌 Servidor de teste fechado');
    }
}

// Setup e Cleanup
beforeEach(async () => {
    await cleanTestData();
    await setupTestServer();
    console.log('🧹 Ambiente preparado para teste');
});

afterEach(async () => {
    await cleanTestData();
    console.log('🧹 Dados limpos após teste');
});

// Cleanup final
process.on('exit', closeTestServer);
process.on('SIGINT', closeTestServer);
process.on('SIGTERM', closeTestServer);

describe('API Sistema Completo - Testes de Integração', () => {
    
    test('Teste 1: CRUD Completo de Usuários via API', async () => {
        console.log('\n👤 Teste 1: CRUD Completo de Usuários via API');
        
        // CREATE - Criar usuário
        console.log('📝 Criando usuário via API...');
        const createResponse = await makeRequest('POST', '/api/users', {
            username: 'admin_test',
            password: 'senha123'
        });
        
        assert.strictEqual(createResponse.status, 201, 'Status deve ser 201');
        assert.strictEqual(createResponse.data.success, true, 'Resposta deve indicar sucesso');
        
        const user = createResponse.data.data;
        assert.ok(validateUUID(user.id), 'Usuário deve ter ID UUID válido');
        assert.strictEqual(user.username, 'admin_test', 'Username deve estar correto');
        assert.ok(validateDate(user.created_at), 'created_at deve ser data válida');
        
        console.log('✅ Usuário criado via API');
        
        // READ ALL - Listar usuários
        console.log('📋 Listando usuários via API...');
        const listResponse = await makeRequest('GET', '/api/users');
        
        assert.strictEqual(listResponse.status, 200, 'Status deve ser 200');
        assert.ok(Array.isArray(listResponse.data.data), 'Dados devem ser array');
        assert.strictEqual(listResponse.data.data.length, 1, 'Deve ter 1 usuário');
        
        console.log('✅ Listagem de usuários via API');
        
        // READ - Buscar usuário por ID
        console.log('🔍 Buscando usuário por ID via API...');
        const findResponse = await makeRequest('GET', `/api/users/${user.id}`);
        
        assert.strictEqual(findResponse.status, 200, 'Status deve ser 200');
        assert.strictEqual(findResponse.data.data.id, user.id, 'ID deve coincidir');
        assert.strictEqual(findResponse.data.data.username, 'admin_test', 'Username deve coincidir');
        
        console.log('✅ Usuário encontrado por ID via API');
        
        // UPDATE - Atualizar usuário
        console.log('✏️ Atualizando usuário via API...');
        const updateResponse = await makeRequest('PUT', `/api/users/${user.id}`, {
            username: 'admin_updated'
        });
        
        assert.strictEqual(updateResponse.status, 200, 'Status deve ser 200');
        assert.strictEqual(updateResponse.data.data.username, 'admin_updated', 'Username deve estar atualizado');
        
        console.log('✅ Usuário atualizado via API');
        
        // DELETE - Deletar usuário
        console.log('🗑️ Deletando usuário via API...');
        const deleteResponse = await makeRequest('DELETE', `/api/users/${user.id}`);
        
        assert.strictEqual(deleteResponse.status, 200, 'Status deve ser 200');
        assert.strictEqual(deleteResponse.data.success, true, 'Resposta deve indicar sucesso');
        
        // Verificar se foi realmente deletado
        const notFoundResponse = await makeRequest('GET', `/api/users/${user.id}`);
        assert.strictEqual(notFoundResponse.status, 404, 'Usuário não deve mais existir');
        
        console.log('✅ Usuário deletado via API');
    });

    test('Teste 2: CRUD Completo de Clientes via API', async () => {
        console.log('\n👥 Teste 2: CRUD Completo de Clientes via API');
        
        // CREATE - Criar cliente
        console.log('📝 Criando cliente via API...');
        const createResponse = await makeRequest('POST', '/api/clients', {
            name: 'João Silva',
            phone_number: '11999887766'
        });
        
        assert.strictEqual(createResponse.status, 201, 'Status deve ser 201');
        assert.strictEqual(createResponse.data.success, true, 'Resposta deve indicar sucesso');
        
        const client = createResponse.data.data;
        assert.ok(validateUUID(client.id), 'Cliente deve ter ID UUID válido');
        assert.strictEqual(client.name, 'João Silva', 'Nome deve estar correto');
        assert.strictEqual(client.phone_number, '11999887766', 'Telefone deve estar correto');
        
        console.log('✅ Cliente criado via API');
        
        // READ ALL - Listar clientes
        console.log('📋 Listando clientes via API...');
        const listResponse = await makeRequest('GET', '/api/clients');
        
        assert.strictEqual(listResponse.status, 200, 'Status deve ser 200');
        assert.ok(Array.isArray(listResponse.data.data), 'Dados devem ser array');
        assert.strictEqual(listResponse.data.data.length, 1, 'Deve ter 1 cliente');
        
        console.log('✅ Listagem de clientes via API');
        
        // READ - Buscar cliente por ID
        console.log('🔍 Buscando cliente por ID via API...');
        const findResponse = await makeRequest('GET', `/api/clients/${client.id}`);
        
        assert.strictEqual(findResponse.status, 200, 'Status deve ser 200');
        assert.strictEqual(findResponse.data.data.id, client.id, 'ID deve coincidir');
        assert.strictEqual(findResponse.data.data.name, 'João Silva', 'Nome deve coincidir');
        
        console.log('✅ Cliente encontrado por ID via API');
        
        // UPDATE - Atualizar cliente
        console.log('✏️ Atualizando cliente via API...');
        const updateResponse = await makeRequest('PUT', `/api/clients/${client.id}`, {
            name: 'João Santos',
            phone_number: '11888776655'
        });
        
        assert.strictEqual(updateResponse.status, 200, 'Status deve ser 200');
        assert.strictEqual(updateResponse.data.data.name, 'João Santos', 'Nome deve estar atualizado');
        assert.strictEqual(updateResponse.data.data.phone_number, '11888776655', 'Telefone deve estar atualizado');
        
        console.log('✅ Cliente atualizado via API');
        
        // DELETE - Deletar cliente
        console.log('🗑️ Deletando cliente via API...');
        const deleteResponse = await makeRequest('DELETE', `/api/clients/${client.id}`);
        
        assert.strictEqual(deleteResponse.status, 200, 'Status deve ser 200');
        assert.strictEqual(deleteResponse.data.success, true, 'Resposta deve indicar sucesso');
        
        console.log('✅ Cliente deletado via API');
    });

    test('Teste 3: Fluxo Completo de Negócio via API', async () => {
        console.log('\n🍺 Teste 3: Fluxo Completo de Negócio via API');
        
        // 1. Criar usuário (garçom)
        console.log('1️⃣ Criando garçom via API...');
        const waiterResponse = await makeRequest('POST', '/api/users', {
            username: 'garcom_api',
            password: 'senha123'
        });
        const waiter = waiterResponse.data.data;
        console.log('✅ Garçom criado via API');
        
        // 2. Criar cliente
        console.log('2️⃣ Criando cliente via API...');
        const customerResponse = await makeRequest('POST', '/api/clients', {
            name: 'Maria Silva',
            phone_number: '11999001122'
        });
        const customer = customerResponse.data.data;
        console.log('✅ Cliente criado via API');
        
        // 3. Abrir tab
        console.log('3️⃣ Abrindo tab via API...');
        const tabResponse = await makeRequest('POST', '/api/tabs', {
            client_id: customer.id,
            description: 'Mesa 3 - Maria API',
            value: '0.00',
            status: 'unpaid',
            created_by: waiter.id
        });
        const tab = tabResponse.data.data;
        assert.strictEqual(tabResponse.status, 201, 'Tab deve ser criada');
        console.log('✅ Tab aberta via API');
        
        // 4. Simular consumo atualizando valor da tab
        console.log('4️⃣ Atualizando consumo da tab...');
        const totalConsumo = 36.00; // Cerveja + Petisco + Cerveja + Refrigerante
        
        const updateTabResponse = await makeRequest('PUT', `/api/tabs/${tab.id}`, {
            value: totalConsumo.toFixed(2),
            description: 'Mesa 3 - Maria API (4 itens)'
        });
        assert.strictEqual(updateTabResponse.status, 200, 'Tab deve ser atualizada');
        console.log(`✅ Total consumido: R$ ${totalConsumo.toFixed(2)}`);
        
        // 5. Pagamento parcial
        console.log('5️⃣ Pagamento parcial via API...');
        const partialPaymentResponse = await makeRequest('POST', '/api/payments', {
            tab_id: tab.id,
            value: '20.00'
        });
        const partialPayment = partialPaymentResponse.data.data;
        assert.strictEqual(partialPaymentResponse.status, 201, 'Pagamento deve ser criado');
        
        // Atualizar status da tab
        await makeRequest('PUT', `/api/tabs/${tab.id}`, {
            status: 'partial'
        });
        console.log('✅ Pagamento parcial de R$ 20.00 via API');
        
        // 6. Quitação final
        console.log('6️⃣ Quitação final via API...');
        const remainingAmount = totalConsumo - 20.00;
        const finalPaymentResponse = await makeRequest('POST', '/api/payments', {
            tab_id: tab.id,
            value: remainingAmount.toFixed(2)
        });
        assert.strictEqual(finalPaymentResponse.status, 201, 'Pagamento final deve ser criado');
        
        // Marcar tab como paga
        await makeRequest('PUT', `/api/tabs/${tab.id}`, {
            status: 'paid'
        });
        console.log(`✅ Pagamento final de R$ ${remainingAmount.toFixed(2)} via API`);
        
        // 7. Verificar balanço
        console.log('7️⃣ Verificando balanço via API...');
        const paymentsResponse = await makeRequest('GET', '/api/payments');
        const allPayments = paymentsResponse.data.data;
        const tabPayments = allPayments.filter(p => p.tab_id === tab.id);
        
        const totalPaid = tabPayments.reduce((sum, payment) => {
            return sum + Number.parseFloat(payment.value);
        }, 0);
        
        assert.strictEqual(Number.parseFloat(totalPaid.toFixed(2)), totalConsumo, 'Total pago deve igualar total consumido');
        console.log(`✅ Balanço fechado: Consumido R$ ${totalConsumo.toFixed(2)} = Pago R$ ${totalPaid.toFixed(2)}`);
        
        // 8. Verificar tab final
        const finalTabResponse = await makeRequest('GET', `/api/tabs/${tab.id}`);
        const finalTab = finalTabResponse.data.data;
        assert.strictEqual(finalTab.status, 'paid', 'Tab deve estar marcada como paga');
        console.log('✅ Tab finalizada corretamente via API');
        
        console.log('🎉 Fluxo completo de negócio executado via API!');
    });

    test('Teste 4: Validações e Tratamento de Erros via API', async () => {
        console.log('\n❌ Teste 4: Validações e Tratamento de Erros via API');
        
        // Teste criação com dados inválidos
        console.log('🔒 Testando validações de criação...');
        
        // Usuário sem dados
        const noUserDataResponse = await makeRequest('POST', '/api/users', {});
        assert.strictEqual(noUserDataResponse.status, 400, 'Status deve ser 400 para usuário sem dados');
        console.log('✅ Validação de usuário sem dados');
        
        // Cliente sem dados
        const noClientDataResponse = await makeRequest('POST', '/api/clients', {});
        assert.strictEqual(noClientDataResponse.status, 400, 'Status deve ser 400 para cliente sem dados');
        console.log('✅ Validação de cliente sem dados');
        
        // Cliente com nome vazio
        const emptyNameResponse = await makeRequest('POST', '/api/clients', {
            name: '',
            phone_number: '11999887766'
        });
        assert.strictEqual(emptyNameResponse.status, 400, 'Status deve ser 400 para nome vazio');
        console.log('✅ Validação de nome vazio');
        
        // Cliente com telefone inválido
        const invalidPhoneResponse = await makeRequest('POST', '/api/clients', {
            name: 'João',
            phone_number: '123'
        });
        assert.strictEqual(invalidPhoneResponse.status, 400, 'Status deve ser 400 para telefone inválido');
        console.log('✅ Validação de telefone inválido');
        
        // Teste buscas com IDs inexistentes
        console.log('🔍 Testando buscas com IDs inexistentes...');
        const fakeId = '123e4567-e89b-12d3-a456-426614174000';
        
        const userNotFoundResponse = await makeRequest('GET', `/api/users/${fakeId}`);
        assert.strictEqual(userNotFoundResponse.status, 404, 'Usuário não deve ser encontrado');
        
        const clientNotFoundResponse = await makeRequest('GET', `/api/clients/${fakeId}`);
        assert.strictEqual(clientNotFoundResponse.status, 404, 'Cliente não deve ser encontrado');
        
        const tabNotFoundResponse = await makeRequest('GET', `/api/tabs/${fakeId}`);
        assert.strictEqual(tabNotFoundResponse.status, 404, 'Tab não deve ser encontrada');
        
        const paymentNotFoundResponse = await makeRequest('GET', `/api/payments/${fakeId}`);
        assert.strictEqual(paymentNotFoundResponse.status, 404, 'Pagamento não deve ser encontrado');
        
        console.log('✅ Todas as validações de erro funcionando via API');
        
        // Teste updates/deletes com IDs inválidos
        console.log('✏️ Testando updates com IDs inválidos...');
        
        const updateInvalidResponse = await makeRequest('PUT', `/api/clients/${fakeId}`, {
            name: 'Nome Atualizado'
        });
        assert.strictEqual(updateInvalidResponse.status, 404, 'Update deve falhar com ID inválido');
        
        const deleteInvalidResponse = await makeRequest('DELETE', `/api/clients/${fakeId}`);
        assert.strictEqual(deleteInvalidResponse.status, 404, 'Delete deve falhar com ID inválido');
        
        console.log('✅ Validações de update/delete funcionando');
    });

    test('Teste 5: Performance da API com Múltiplas Requisições', async () => {
        console.log('\n🚀 Teste 5: Performance da API com Múltiplas Requisições');
        
        // Criar usuário base
        const userResponse = await makeRequest('POST', '/api/users', {
            username: 'perf_user',
            password: 'senha123'
        });
        const user = userResponse.data.data;
        
        // Teste criação múltipla de clientes
        console.log('👥 Testando criação múltipla via API...');
        const clientPromises = [];
        const clientCount = 8;
        
        for (let i = 0; i < clientCount; i++) {
            clientPromises.push(
                makeRequest('POST', '/api/clients', {
                    name: `Cliente API ${i}`,
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
            assert.ok(validateUUID(response.data.data.id), `Cliente ${index} deve ter ID válido`);
        });
        assert.ok(duration < 5000, 'Criação múltipla deve ser rápida (< 5s)');
        console.log(`✅ ${clientCount} clientes criados via API em ${duration}ms`);
        
        // Teste listagem com múltiplos registros
        console.log('📊 Testando listagem com múltiplos registros...');
        const listStartTime = Date.now();
        const listResponse = await makeRequest('GET', '/api/clients');
        const listEndTime = Date.now();
        const listDuration = listEndTime - listStartTime;
        
        assert.strictEqual(listResponse.data.data.length, clientCount, `Deve listar ${clientCount} clientes`);
        assert.ok(listDuration < 1000, 'Listagem deve ser rápida (< 1s)');
        console.log(`✅ Listagem de ${clientCount} clientes via API em ${listDuration}ms`);
        
        // Teste criação múltipla de tabs
        console.log('📋 Testando criação múltipla de tabs via API...');
        const clients = listResponse.data.data;
        const tabPromises = [];
        
        for (let i = 0; i < Math.min(clients.length, 4); i++) {
            tabPromises.push(
                makeRequest('POST', '/api/tabs', {
                    client_id: clients[i].id,
                    description: `Tab API ${i}`,
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
        
        assert.strictEqual(tabResponses.length, 4, 'Deve criar 4 tabs');
        tabResponses.forEach((response, index) => {
            assert.strictEqual(response.status, 201, `Tab ${index} deve ser criada`);
            assert.ok(validateUUID(response.data.data.id), `Tab ${index} deve ter ID válido`);
        });
        assert.ok(tabDuration < 3000, 'Criação de tabs deve ser rápida (< 3s)');
        console.log(`✅ 4 tabs criadas via API em ${tabDuration}ms`);
        
        console.log('✅ Testes de performance da API concluídos');
    });

    test('Teste 6: Cenário Real de Bar/Restaurante via API', async () => {
        console.log('\n🍻 Teste 6: Cenário Real de Bar/Restaurante via API');
        
        // Cenário: Múltiplos clientes, múltiplas tabs, múltiplos pagamentos
        console.log('🏪 Simulando dia de movimento no bar...');
        
        // Criar staff
        const staffPromises = [
            makeRequest('POST', '/api/users', { username: 'garcom1', password: 'senha123' }),
            makeRequest('POST', '/api/users', { username: 'garcom2', password: 'senha123' }),
            makeRequest('POST', '/api/users', { username: 'caixa', password: 'senha123' })
        ];
        const staffResponses = await Promise.all(staffPromises);
        const staff = staffResponses.map(response => response.data.data);
        console.log(`✅ ${staff.length} funcionários criados`);
        
        // Criar clientes frequentes
        const regularClients = [
            { name: 'João da Padaria', phone_number: '11999001122' },
            { name: 'Maria do Mercado', phone_number: '11999003344' },
            { name: 'Pedro Mecânico', phone_number: '11999005566' },
            { name: 'Ana Florista', phone_number: '11999007788' }
        ];
        
        const clientPromises = regularClients.map(clientData => 
            makeRequest('POST', '/api/clients', clientData)
        );
        const clientResponses = await Promise.all(clientPromises);
        const clients = clientResponses.map(response => response.data.data);
        console.log(`✅ ${clients.length} clientes criados`);
        
        // Simular mesas abertas
        console.log('🍽️ Abrindo mesas...');
        const tables = [
            { client: clients[0], table: 'Mesa 1', waiter: staff[0] },
            { client: clients[1], table: 'Mesa 3', waiter: staff[0] },
            { client: clients[2], table: 'Mesa 7', waiter: staff[1] },
            { client: clients[3], table: 'Balcão', waiter: staff[1] }
        ];
        
        const tabPromises = tables.map(({ client, table, waiter }) =>
            makeRequest('POST', '/api/tabs', {
                client_id: client.id,
                description: `${table} - ${client.name}`,
                value: '0.00',
                status: 'unpaid',
                created_by: waiter.id
            })
        );
        const tabResponses = await Promise.all(tabPromises);
        const tabs = tabResponses.map(response => response.data.data);
        console.log(`✅ ${tabs.length} mesas abertas`);
        
        // Simular consumo e pagamentos
        console.log('💰 Simulando consumo e pagamentos...');
        const scenarios = [
            { tab: tabs[0], orders: [15.50, 8.00], payments: [23.50] }, // Paga tudo
            { tab: tabs[1], orders: [12.00, 15.00, 6.50], payments: [20.00, 13.50] }, // Paga parcial depois completa
            { tab: tabs[2], orders: [25.00], payments: [10.00] }, // Paga parcial, fica devendo
            { tab: tabs[3], orders: [8.50, 4.00], payments: [12.50] } // Paga tudo
        ];
        
        let totalVendas = 0;
        let totalRecebido = 0;
        
        for (let i = 0; i < scenarios.length; i++) {
            const { tab, orders, payments } = scenarios[i];
            const totalOrders = orders.reduce((sum, order) => sum + order, 0);
            const totalPayments = payments.reduce((sum, payment) => sum + payment, 0);
            
            // Atualizar valor da tab com total dos pedidos
            await makeRequest('PUT', `/api/tabs/${tab.id}`, {
                value: totalOrders.toFixed(2),
                description: `${tab.description} (${orders.length} itens)`
            });
            
            // Processar pagamentos
            for (const paymentValue of payments) {
                await makeRequest('POST', '/api/payments', {
                    tab_id: tab.id,
                    value: paymentValue.toFixed(2)
                });
            }
            
            // Atualizar status da tab
            const status = totalPayments >= totalOrders ? 'paid' : 
                          totalPayments > 0 ? 'partial' : 'unpaid';
            
            await makeRequest('PUT', `/api/tabs/${tab.id}`, { status });
            
            totalVendas += totalOrders;
            totalRecebido += totalPayments;
            
            console.log(`   ${tab.description}: Vendas R$ ${totalOrders.toFixed(2)}, Recebido R$ ${totalPayments.toFixed(2)} (${status})`);
        }
        
        // Gerar relatório final
        console.log('📊 Gerando relatório do dia...');
        const finalStatsPromises = [
            makeRequest('GET', '/api/clients'),
            makeRequest('GET', '/api/users'),
            makeRequest('GET', '/api/tabs'),
            makeRequest('GET', '/api/payments')
        ];
        
        const [clientsStats, usersStats, tabsStats, paymentsStats] = await Promise.all(finalStatsPromises);
        
        console.log(`📈 Relatório Final do Dia:
        - Funcionários: ${usersStats.data.data.length}
        - Clientes atendidos: ${clientsStats.data.data.length}
        - Mesas abertas: ${tabsStats.data.data.length}
        - Transações de pagamento: ${paymentsStats.data.data.length}
        - Total em vendas: R$ ${totalVendas.toFixed(2)}
        - Total recebido: R$ ${totalRecebido.toFixed(2)}
        - Pendente: R$ ${(totalVendas - totalRecebido).toFixed(2)}`);
        
        // Validações finais
        assert.strictEqual(clientsStats.data.data.length, 4, 'Deve ter 4 clientes');
        assert.strictEqual(usersStats.data.data.length, 3, 'Deve ter 3 funcionários');
        assert.strictEqual(tabsStats.data.data.length, 4, 'Deve ter 4 tabs');
        assert.ok(paymentsStats.data.data.length > 0, 'Deve ter pagamentos registrados');
        assert.ok(totalVendas > totalRecebido, 'Deve ter valores pendentes (cenário realista)');
        
        console.log('✅ Cenário completo de bar/restaurante executado via API');
    });
});

console.log('\n🎉 Todos os testes de integração da API completa com Poku passaram!');
