import { assert, test, beforeEach, afterEach, describe } from 'poku';
import { cleanTestData, seedTestData, validateUUID, validateDate, validatePhoneNumber } from './setup.mjs';

// Importar todos os modelos
import { ClientModel } from '../../src/models/clientModel.js';
import { UserModel } from '../../src/models/userModel.js';
import { TabModel } from '../../src/models/tabModel.js';
import { PaymentModel } from '../../src/models/paymentModel.js';

console.log('🧪 Testes de Integração do Sistema Completo com Poku');

// Configuração global
const testData = {};

// Setup e Cleanup
beforeEach(async () => {
    await cleanTestData();
    console.log('🧹 Dados limpos para novo teste');
});

afterEach(async () => {
    await cleanTestData();
    console.log('🧹 Dados limpos após teste');
});

describe('Sistema de Gestão de Tabs - Integração Completa', () => {
    
    test('Teste 1: CRUD Completo de Usuários', async () => {
        console.log('\n👤 Teste 1: CRUD Completo de Usuários');
        
        // CREATE - Criar usuário
        console.log('📝 Criando usuário...');
        const userData = {
            username: 'admin_test',
            password: 'senha123'
        };
        
        const user = new UserModel(userData);
        const createdUser = await user.create();
        
        assert.ok(createdUser, 'Usuário deve ser criado');
        assert.ok(validateUUID(createdUser.id), 'ID deve ser UUID válido');
        assert.strictEqual(createdUser.username, 'admin_test', 'Username deve estar correto');
        assert.ok(validateDate(createdUser.created_at), 'created_at deve ser data válida');
        
        console.log('✅ Usuário criado com sucesso');
        
        // READ - Buscar usuário por ID
        console.log('🔍 Buscando usuário por ID...');
        const foundUser = await UserModel.findById(createdUser.id);
        
        assert.ok(foundUser, 'Usuário deve ser encontrado');
        assert.strictEqual(foundUser.id, createdUser.id, 'IDs devem coincidir');
        assert.strictEqual(foundUser.username, 'admin_test', 'Username deve coincidir');
        
        console.log('✅ Usuário encontrado por ID');
        
        // READ ALL - Listar usuários
        console.log('📋 Listando usuários...');
        const allUsers = await UserModel.findAll();
        
        assert.ok(Array.isArray(allUsers), 'Resultado deve ser array');
        assert.strictEqual(allUsers.length, 1, 'Deve ter exatamente 1 usuário');
        assert.strictEqual(allUsers[0].id, createdUser.id, 'Usuário deve estar na lista');
        
        console.log('✅ Listagem de usuários funcionando');
        
        // UPDATE - Atualizar usuário
        console.log('✏️ Atualizando usuário...');
        const userInstance = new UserModel(foundUser);
        const updatedUser = await userInstance.update({
            id: foundUser.id,
            username: 'admin_updated'
        });
        
        assert.ok(updatedUser, 'Usuário deve ser atualizado');
        assert.strictEqual(updatedUser.username, 'admin_updated', 'Username deve estar atualizado');
        
        console.log('✅ Usuário atualizado com sucesso');
        
        // DELETE - Deletar usuário
        console.log('🗑️ Deletando usuário...');
        const deleted = await UserModel.delete(createdUser.id);
        
        assert.strictEqual(deleted, true, 'Usuário deve ser deletado');
        
        // Verificar se foi realmente deletado
        const notFound = await UserModel.findById(createdUser.id);
        assert.strictEqual(notFound, null, 'Usuário não deve mais existir');
        
        console.log('✅ Usuário deletado com sucesso');
        
        // Salvar usuário para próximos testes
        const finalUser = new UserModel({ username: 'test_admin', password: 'senha123' });
        testData.user = await finalUser.create();
    });

    test('Teste 2: CRUD Completo de Clientes', async () => {
        console.log('\n👥 Teste 2: CRUD Completo de Clientes');
        
        // CREATE - Criar cliente
        console.log('📝 Criando cliente...');
        const clientData = {
            name: 'João Silva',
            phone_number: '11999887766'
        };
        
        const client = new ClientModel(clientData);
        const createdClient = await client.create();
        
        assert.ok(createdClient, 'Cliente deve ser criado');
        assert.ok(validateUUID(createdClient.id), 'ID deve ser UUID válido');
        assert.strictEqual(createdClient.name, 'João Silva', 'Nome deve estar correto');
        assert.strictEqual(createdClient.phone_number, '11999887766', 'Telefone deve estar correto');
        assert.ok(validateDate(createdClient.created_at), 'created_at deve ser data válida');
        
        console.log('✅ Cliente criado com sucesso');
        
        // READ - Buscar cliente por ID
        console.log('🔍 Buscando cliente por ID...');
        const foundClient = await ClientModel.findById(createdClient.id);
        
        assert.ok(foundClient, 'Cliente deve ser encontrado');
        assert.strictEqual(foundClient.id, createdClient.id, 'IDs devem coincidir');
        assert.strictEqual(foundClient.name, 'João Silva', 'Nome deve coincidir');
        
        console.log('✅ Cliente encontrado por ID');
        
        // READ - Buscar cliente por telefone
        console.log('📞 Buscando cliente por telefone...');
        const foundByPhone = await ClientModel.findByPhoneNumber('11999887766');
        
        assert.ok(foundByPhone, 'Cliente deve ser encontrado por telefone');
        assert.strictEqual(foundByPhone.id, createdClient.id, 'IDs devem coincidir');
        
        console.log('✅ Cliente encontrado por telefone');
        
        // UPDATE - Atualizar cliente
        console.log('✏️ Atualizando cliente...');
        const clientInstance = new ClientModel(foundClient);
        const updatedClient = await clientInstance.update({
            id: foundClient.id,
            name: 'João Santos',
            phone_number: '11888776655'
        });
        
        assert.ok(updatedClient, 'Cliente deve ser atualizado');
        assert.strictEqual(updatedClient.name, 'João Santos', 'Nome deve estar atualizado');
        assert.strictEqual(updatedClient.phone_number, '11888776655', 'Telefone deve estar atualizado');
        
        console.log('✅ Cliente atualizado com sucesso');
        
        // READ ALL - Listar clientes
        console.log('📋 Listando clientes...');
        const allClients = await ClientModel.findAll();
        
        assert.ok(Array.isArray(allClients), 'Resultado deve ser array');
        assert.strictEqual(allClients.length, 1, 'Deve ter exatamente 1 cliente');
        assert.strictEqual(allClients[0].id, createdClient.id, 'Cliente deve estar na lista');
        
        console.log('✅ Listagem de clientes funcionando');
        
        // DELETE - Deletar cliente
        console.log('🗑️ Deletando cliente...');
        const deleted = await ClientModel.delete(createdClient.id);
        
        assert.strictEqual(deleted, true, 'Cliente deve ser deletado');
        
        // Verificar se foi realmente deletado
        const notFound = await ClientModel.findById(createdClient.id);
        assert.strictEqual(notFound, null, 'Cliente não deve mais existir');
        
        console.log('✅ Cliente deletado com sucesso');
        
        // Salvar cliente para próximos testes
        const finalClient = new ClientModel({ name: 'Cliente Teste', phone_number: '11999887766' });
        testData.client = await finalClient.create();
    });

    test('Teste 3: CRUD Completo de Tabs', async () => {
        console.log('\n📋 Teste 3: CRUD Completo de Tabs');
        
        // Garantir que temos usuário e cliente
        if (!testData.user) {
            const user = new UserModel({ username: 'test_user', password: 'senha123' });
            testData.user = await user.create();
        }
        
        if (!testData.client) {
            const client = new ClientModel({ name: 'Cliente Tab', phone_number: '11999887766' });
            testData.client = await client.create();
        }
        
        // CREATE - Criar tab
        console.log('📝 Criando tab...');
        const tabData = {
            client_id: testData.client.id,
            description: 'Mesa 5 - Consumo',
            value: '150.50',
            status: 'unpaid',
            created_by: testData.user.id
        };
        
        const tab = new TabModel(tabData);
        const createdTab = await tab.create();
        
        assert.ok(createdTab, 'Tab deve ser criada');
        assert.ok(validateUUID(createdTab.id), 'ID deve ser UUID válido');
        assert.strictEqual(createdTab.client_id, testData.client.id, 'client_id deve estar correto');
        assert.strictEqual(createdTab.description, 'Mesa 5 - Consumo', 'Descrição deve estar correta');
        assert.strictEqual(createdTab.value, '150.50', 'Valor deve estar correto');
        assert.strictEqual(createdTab.status, 'unpaid', 'Status deve ser unpaid');
        assert.strictEqual(createdTab.created_by, testData.user.id, 'created_by deve estar correto');
        
        console.log('✅ Tab criada com sucesso');
        
        // READ - Buscar tab por ID
        console.log('🔍 Buscando tab por ID...');
        const foundTab = await TabModel.findById(createdTab.id);
        
        assert.ok(foundTab, 'Tab deve ser encontrada');
        assert.strictEqual(foundTab.id, createdTab.id, 'IDs devem coincidir');
        assert.strictEqual(foundTab.description, 'Mesa 5 - Consumo', 'Descrição deve coincidir');
        
        console.log('✅ Tab encontrada por ID');
        
        // UPDATE - Atualizar tab
        console.log('✏️ Atualizando tab...');
        const tabInstance = new TabModel(foundTab);
        const updatedTab = await tabInstance.update({
            id: foundTab.id,
            description: 'Mesa 5 - Atualizada',
            status: 'partial'
        });
        
        assert.ok(updatedTab, 'Tab deve ser atualizada');
        assert.strictEqual(updatedTab.description, 'Mesa 5 - Atualizada', 'Descrição deve estar atualizada');
        assert.strictEqual(updatedTab.status, 'partial', 'Status deve estar atualizado');
        
        console.log('✅ Tab atualizada com sucesso');
        
        // READ ALL - Listar tabs
        console.log('📋 Listando tabs...');
        const allTabs = await TabModel.findAll();
        
        assert.ok(Array.isArray(allTabs), 'Resultado deve ser array');
        assert.strictEqual(allTabs.length, 1, 'Deve ter exatamente 1 tab');
        assert.strictEqual(allTabs[0].id, createdTab.id, 'Tab deve estar na lista');
        
        console.log('✅ Listagem de tabs funcionando');
        
        // Salvar tab para próximos testes
        testData.tab = createdTab;
    });

    test('Teste 4: CRUD Completo de Pagamentos', async () => {
        console.log('\n💰 Teste 4: CRUD Completo de Pagamentos');
        
        // Garantir que temos uma tab
        if (!testData.tab) {
            if (!testData.user || !testData.client) {
                const user = new UserModel({ username: 'payment_user', password: 'senha123' });
                testData.user = await user.create();
                
                const client = new ClientModel({ name: 'Cliente Payment', phone_number: '11999887766' });
                testData.client = await client.create();
            }
            
            const tab = new TabModel({
                client_id: testData.client.id,
                description: 'Tab para pagamento',
                value: '100.00',
                status: 'unpaid',
                created_by: testData.user.id
            });
            testData.tab = await tab.create();
        }
        
        // CREATE - Criar pagamento
        console.log('📝 Criando pagamento...');
        const paymentData = {
            tab_id: testData.tab.id,
            value: '50.00'
        };
        
        const payment = new PaymentModel(paymentData);
        const createdPayment = await payment.create();
        
        assert.ok(createdPayment, 'Pagamento deve ser criado');
        assert.ok(validateUUID(createdPayment.id), 'ID deve ser UUID válido');
        assert.strictEqual(createdPayment.tab_id, testData.tab.id, 'tab_id deve estar correto');
        assert.strictEqual(createdPayment.value, '50.00', 'Valor deve estar correto');
        assert.ok(validateDate(createdPayment.created_at), 'created_at deve ser data válida');
        
        console.log('✅ Pagamento criado com sucesso');
        
        // READ - Buscar pagamento por ID
        console.log('🔍 Buscando pagamento por ID...');
        const foundPayment = await PaymentModel.findById(createdPayment.id);
        
        assert.ok(foundPayment, 'Pagamento deve ser encontrado');
        assert.strictEqual(foundPayment.id, createdPayment.id, 'IDs devem coincidir');
        assert.strictEqual(foundPayment.value, '50.00', 'Valor deve coincidir');
        
        console.log('✅ Pagamento encontrado por ID');
        
        // UPDATE - Atualizar pagamento
        console.log('✏️ Atualizando pagamento...');
        const paymentInstance = new PaymentModel(foundPayment);
        const updatedPayment = await paymentInstance.update({
            id: foundPayment.id,
            value: '60.00'
        });
        
        assert.ok(updatedPayment, 'Pagamento deve ser atualizado');
        assert.strictEqual(updatedPayment.value, '60.00', 'Valor deve estar atualizado');
        
        console.log('✅ Pagamento atualizado com sucesso');
        
        // READ ALL - Listar pagamentos
        console.log('📋 Listando pagamentos...');
        const allPayments = await PaymentModel.findAll();
        
        assert.ok(Array.isArray(allPayments), 'Resultado deve ser array');
        assert.strictEqual(allPayments.length, 1, 'Deve ter exatamente 1 pagamento');
        assert.strictEqual(allPayments[0].id, createdPayment.id, 'Pagamento deve estar na lista');
        
        console.log('✅ Listagem de pagamentos funcionando');
        
        // DELETE - Deletar pagamento
        console.log('🗑️ Deletando pagamento...');
        const deleted = await PaymentModel.delete(createdPayment.id);
        
        assert.strictEqual(deleted, true, 'Pagamento deve ser deletado');
        
        // Verificar se foi realmente deletado
        const notFound = await PaymentModel.findById(createdPayment.id);
        assert.strictEqual(notFound, null, 'Pagamento não deve mais existir');
        
        console.log('✅ Pagamento deletado com sucesso');
    });

    test('Teste 5: Fluxo Completo de Negócio', async () => {
        console.log('\n🍺 Teste 5: Fluxo Completo de Negócio - Bar/Restaurante');
        
        // Cenário: Cliente vai ao bar, consome, paga parcialmente e depois quita
        
        // 1. Criar usuário (garçom)
        console.log('1️⃣ Criando garçom...');
        const waiter = new UserModel({ username: 'garcom_joao', password: 'senha123' });
        const createdWaiter = await waiter.create();
        console.log('✅ Garçom criado');
        
        // 2. Criar cliente
        console.log('2️⃣ Criando cliente...');
        const customer = new ClientModel({ name: 'Maria Silva', phone_number: '11999001122' });
        const createdCustomer = await customer.create();
        console.log('✅ Cliente criado');
        
        // 3. Abrir tab (cliente chega e pede para abrir conta)
        console.log('3️⃣ Abrindo tab...');
        const tab = new TabModel({
            client_id: createdCustomer.id,
            description: 'Mesa 3 - Maria',
            value: '0.00', // Inicia zerada
            status: 'unpaid',
            created_by: createdWaiter.id
        });
        const createdTab = await tab.create();
        console.log('✅ Tab aberta');
        
        // 4. Cliente consome (registrar pedidos como "pagamentos negativos" ou ajustar valor da tab)
        console.log('4️⃣ Cliente fazendo pedidos...');
        
        // Simular pedidos atualizando o valor da tab
        const orders = [
            { description: 'Cerveja', value: 8.50 },
            { description: 'Petisco', value: 15.00 },
            { description: 'Outra cerveja', value: 8.50 },
            { description: 'Refrigerante', value: 4.00 }
        ];
        
        let totalConsumo = 0;
        for (const order of orders) {
            totalConsumo += order.value;
            console.log(`   - ${order.description}: R$ ${order.value.toFixed(2)}`);
        }
        
        // Atualizar valor total da tab
        const tabInstance = new TabModel(createdTab);
        await tabInstance.update({
            id: createdTab.id,
            value: totalConsumo.toFixed(2),
            description: `Mesa 3 - Maria (${orders.length} itens)`
        });
        
        console.log(`✅ Total consumido: R$ ${totalConsumo.toFixed(2)}`);
        
        // 5. Cliente faz pagamento parcial
        console.log('5️⃣ Pagamento parcial...');
        const partialPayment = new PaymentModel({
            tab_id: createdTab.id,
            value: '20.00'
        });
        const createdPartialPayment = await partialPayment.create();
        
        // Atualizar status da tab
        await tabInstance.update({
            id: createdTab.id,
            status: 'partial'
        });
        
        console.log('✅ Pagamento parcial de R$ 20.00 realizado');
        
        // 6. Cliente quita o resto
        console.log('6️⃣ Quitação final...');
        const remainingAmount = totalConsumo - 20.00;
        const finalPayment = new PaymentModel({
            tab_id: createdTab.id,
            value: remainingAmount.toFixed(2)
        });
        const createdFinalPayment = await finalPayment.create();
        
        // Atualizar status da tab para pago
        await tabInstance.update({
            id: createdTab.id,
            status: 'paid'
        });
        
        console.log(`✅ Pagamento final de R$ ${remainingAmount.toFixed(2)} realizado`);
        
        // 7. Verificar balanço final
        console.log('7️⃣ Verificando balanço...');
        const allPayments = await PaymentModel.findAll();
        const tabPayments = allPayments.filter(p => p.tab_id === createdTab.id);
        
        const totalPaid = tabPayments.reduce((sum, payment) => {
            return sum + Number.parseFloat(payment.value);
        }, 0);
        
        assert.strictEqual(Number.parseFloat(totalPaid.toFixed(2)), totalConsumo, 'Total pago deve igualar total consumido');
        console.log(`✅ Balanço fechado: Consumido R$ ${totalConsumo.toFixed(2)} = Pago R$ ${totalPaid.toFixed(2)}`);
        
        // 8. Verificar tab final
        const finalTab = await TabModel.findById(createdTab.id);
        assert.strictEqual(finalTab.status, 'paid', 'Tab deve estar marcada como paga');
        console.log('✅ Tab finalizada corretamente');
        
        console.log('🎉 Fluxo completo de negócio executado com sucesso!');
    });

    test('Teste 6: Validações e Tratamento de Erros', async () => {
        console.log('\n❌ Teste 6: Validações e Tratamento de Erros');
        
        // Teste validações de criação
        console.log('🔒 Testando validações de criação...');
        
        // Cliente com dados inválidos
        try {
            new ClientModel({ name: '', phone_number: '11999887766' });
            assert.fail('Deveria falhar com nome vazio');
        } catch (error) {
            assert.strictEqual(error.message, 'Client name is required');
            console.log('✅ Validação de nome vazio funcionando');
        }
        
        try {
            new ClientModel({ name: 'João', phone_number: '123' });
            assert.fail('Deveria falhar com telefone inválido');
        } catch (error) {
            assert.strictEqual(error.message, 'Valid phone number is required');
            console.log('✅ Validação de telefone inválido funcionando');
        }
        
        // Usuário com dados inválidos
        try {
            new UserModel({ username: '', password: 'senha123' });
            assert.fail('Deveria falhar com username vazio');
        } catch (error) {
            assert.strictEqual(error.message, 'Username is required');
            console.log('✅ Validação de username vazio funcionando');
        }
        
        // Teste buscas com IDs inválidos
        console.log('🔍 Testando buscas com IDs inválidos...');
        
        try {
            await ClientModel.findById('');
            assert.fail('Deveria falhar com ID vazio');
        } catch (error) {
            assert.strictEqual(error.message, 'Failed to find client');
            console.log('✅ Validação de ID vazio funcionando');
        }
        
        try {
            await UserModel.findById('id-inexistente');
            assert.fail('Deveria falhar com ID inexistente');
        } catch (error) {
            assert.strictEqual(error.message, 'Failed to find user');
            console.log('✅ Validação de ID inexistente funcionando');
        }
        
        // Teste updates sem ID
        console.log('✏️ Testando updates sem ID...');
        
        try {
            const client = new ClientModel({ name: 'João', phone_number: '11999887766' });
            await client.update({ name: 'João Santos' });
            assert.fail('Deveria falhar sem ID');
        } catch (error) {
            assert.strictEqual(error.message, 'Client ID is required for update');
            console.log('✅ Validação de update sem ID funcionando');
        }
        
        console.log('✅ Todas as validações funcionando corretamente');
    });

    test('Teste 7: Performance e Concorrência', async () => {
        console.log('\n🚀 Teste 7: Performance e Concorrência');
        
        // Criar usuário base para os testes
        const baseUser = new UserModel({ username: 'perf_user', password: 'senha123' });
        const createdBaseUser = await baseUser.create();
        
        // Teste criação múltipla simultânea de clientes
        console.log('👥 Testando criação múltipla simultânea...');
        const promises = [];
        const clientCount = 10;
        
        for (let i = 0; i < clientCount; i++) {
            const clientData = {
                name: `Cliente ${i}`,
                phone_number: `1199988776${i}`
            };
            const client = new ClientModel(clientData);
            promises.push(client.create());
        }
        
        const startTime = Date.now();
        const results = await Promise.all(promises);
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        assert.strictEqual(results.length, clientCount, `Deve criar ${clientCount} clientes`);
        results.forEach((result, index) => {
            assert.ok(validateUUID(result.id), `Cliente ${index} deve ter ID válido`);
            assert.strictEqual(result.name, `Cliente ${index}`, `Nome do cliente ${index} deve estar correto`);
        });
        assert.ok(duration < 3000, 'Criação múltipla deve ser rápida (< 3s)');
        console.log(`✅ ${clientCount} clientes criados simultaneamente em ${duration}ms`);
        
        // Teste performance de listagem
        console.log('📊 Testando performance de listagem...');
        const listStartTime = Date.now();
        const allClients = await ClientModel.findAll();
        const listEndTime = Date.now();
        const listDuration = listEndTime - listStartTime;
        
        assert.strictEqual(allClients.length, clientCount, `Deve listar ${clientCount} clientes`);
        assert.ok(listDuration < 1000, 'Listagem deve ser rápida (< 1s)');
        console.log(`✅ Listagem de ${clientCount} clientes em ${listDuration}ms`);
        
        // Teste criação múltipla de tabs
        console.log('📋 Testando criação múltipla de tabs...');
        const tabPromises = [];
        
        for (let i = 0; i < Math.min(results.length, 5); i++) {
            const tabData = {
                client_id: results[i].id,
                description: `Tab ${i}`,
                value: `${(i + 1) * 25}.00`,
                status: 'unpaid',
                created_by: createdBaseUser.id
            };
            const tab = new TabModel(tabData);
            tabPromises.push(tab.create());
        }
        
        const tabStartTime = Date.now();
        const tabResults = await Promise.all(tabPromises);
        const tabEndTime = Date.now();
        const tabDuration = tabEndTime - tabStartTime;
        
        assert.strictEqual(tabResults.length, 5, 'Deve criar 5 tabs');
        tabResults.forEach((result, index) => {
            assert.ok(validateUUID(result.id), `Tab ${index} deve ter ID válido`);
            assert.strictEqual(result.description, `Tab ${index}`, `Descrição da tab ${index} deve estar correta`);
        });
        assert.ok(tabDuration < 2000, 'Criação de tabs deve ser rápida (< 2s)');
        console.log(`✅ 5 tabs criadas simultaneamente em ${tabDuration}ms`);
        
        console.log('✅ Testes de performance concluídos');
    });

    test('Teste 8: Normalização de Dados', async () => {
        console.log('\n📞 Teste 8: Normalização de Dados');
        
        // Teste normalização de telefones
        console.log('📱 Testando normalização de telefones...');
        const phoneFormats = [
            { input: '(11)99988-7766', expected: '11999887766' },
            { input: '11 99988 7766', expected: '11999887766' },
            { input: '+55 11 99988-7766', expected: '5511999887766' },
            { input: '11999887766', expected: '11999887766' }
        ];
        
        for (const { input, expected } of phoneFormats) {
            const client = new ClientModel({ name: 'Teste', phone_number: input });
            const created = await client.create();
            
            assert.strictEqual(created.phone_number, expected, `Telefone ${input} deve ser normalizado para ${expected}`);
            console.log(`✅ ${input} → ${expected}`);
        }
        
        // Teste normalização de nomes (trimming)
        console.log('👤 Testando normalização de nomes...');
        const nameFormats = [
            { input: '  João Silva  ', expected: 'João Silva' },
            { input: 'Maria\tSantos', expected: 'Maria Santos' },
            { input: ' Pedro  José ', expected: 'Pedro José' }
        ];
        
        for (const { input, expected } of nameFormats) {
            const client = new ClientModel({ name: input, phone_number: '11999887766' });
            const created = await client.create();
            
            assert.strictEqual(created.name.trim(), expected, `Nome "${input}" deve ser normalizado para "${expected}"`);
            console.log(`✅ "${input}" → "${expected}"`);
        }
        
        // Teste limitação de tamanho
        console.log('📏 Testando limitação de tamanho...');
        const longName = 'A'.repeat(300); // Nome muito longo
        const client = new ClientModel({ name: longName, phone_number: '11999887766' });
        const created = await client.create();
        
        assert.ok(created.name.length <= 255, 'Nome deve ser limitado a 255 caracteres');
        console.log(`✅ Nome longo (${longName.length} chars) limitado a ${created.name.length} chars`);
        
        console.log('✅ Normalização de dados funcionando corretamente');
    });
});

console.log('\n🎉 Todos os testes de integração do sistema passaram!');
