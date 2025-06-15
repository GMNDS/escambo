import { assert, test, beforeEach, afterEach } from 'poku';
import { cleanTestData, seedTestData, validateUUID, validateDate, validatePhoneNumber } from './setup.mjs';
import { ClientModel } from '../../src/models/clientModel.js';

console.log('🧪 Testes de Integração - ClientModel');

// Setup e Cleanup
beforeEach(async () => {
    await cleanTestData();
});

afterEach(async () => {
    await cleanTestData();
});

// Teste 1: CRUD Completo do Cliente
test('CRUD Completo - Cliente', async () => {
    console.log('\n🧪 Teste 1: CRUD Completo do Cliente');
    
    // CREATE - Criar novo cliente
    console.log('📝 Testando criação de cliente...');
    const clientData = {
        name: 'João Silva',
        phone_number: '11999887766'
    };
    
    const client = new ClientModel(clientData);
    const created = await client.create();
    
    assert.ok(created, 'Cliente deve ser criado');
    assert.ok(validateUUID(created.id), 'ID deve ser UUID válido');
    assert.strictEqual(created.name, 'João Silva', 'Nome deve estar correto');
    assert.strictEqual(created.phone_number, '11999887766', 'Telefone deve estar correto');
    assert.ok(validateDate(created.created_at), 'created_at deve ser data válida');
    assert.ok(validateDate(created.updated_at), 'updated_at deve ser data válida');
    console.log('✅ Cliente criado com sucesso');
    
    // READ - Buscar cliente por ID
    console.log('🔍 Testando busca por ID...');
    const found = await ClientModel.findById(created.id);
    
    assert.ok(found, 'Cliente deve ser encontrado');
    assert.strictEqual(found.id, created.id, 'IDs devem coincidir');
    assert.strictEqual(found.name, 'João Silva', 'Nome deve coincidir');
    assert.strictEqual(found.phone_number, '11999887766', 'Telefone deve coincidir');
    console.log('✅ Cliente encontrado com sucesso');
    
    // READ - Buscar cliente por telefone
    console.log('📞 Testando busca por telefone...');
    const foundByPhone = await ClientModel.findByPhoneNumber('11999887766');
    
    assert.ok(foundByPhone, 'Cliente deve ser encontrado por telefone');
    assert.strictEqual(foundByPhone.id, created.id, 'IDs devem coincidir');
    console.log('✅ Cliente encontrado por telefone');
    
    // UPDATE - Atualizar cliente
    console.log('✏️  Testando atualização de cliente...');
    const clientInstance = new ClientModel(found);
    const updated = await clientInstance.update({
        id: found.id,
        name: 'João Santos',
        phone_number: '11888776655'
    });
    
    assert.ok(updated, 'Cliente deve ser atualizado');
    assert.strictEqual(updated.name, 'João Santos', 'Nome deve estar atualizado');
    assert.strictEqual(updated.phone_number, '11888776655', 'Telefone deve estar atualizado');
    console.log('✅ Cliente atualizado com sucesso');
    
    // READ ALL - Listar todos os clientes
    console.log('📋 Testando listagem de clientes...');
    const allClients = await ClientModel.findAll();
    
    assert.ok(Array.isArray(allClients), 'Resultado deve ser array');
    assert.strictEqual(allClients.length, 1, 'Deve ter exatamente 1 cliente');
    assert.strictEqual(allClients[0].id, created.id, 'Cliente deve estar na lista');
    console.log('✅ Listagem funcionando');
    
    // DELETE - Deletar cliente
    console.log('🗑️  Testando exclusão de cliente...');
    const deleted = await ClientModel.delete(created.id);
    
    assert.strictEqual(deleted, true, 'Cliente deve ser deletado');
    
    // Verificar se foi realmente deletado
    const notFound = await ClientModel.findById(created.id);
    assert.strictEqual(notFound, null, 'Cliente não deve mais existir');
    console.log('✅ Cliente deletado com sucesso');
});

// Teste 2: Validações e Tratamento de Erros
test('Validações e Tratamento de Erros', async () => {
    console.log('\n🧪 Teste 2: Validações e Tratamento de Erros');
    
    // Teste criação com dados inválidos
    console.log('❌ Testando validações de criação...');
    
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
    
    // Teste busca com ID inválido
    console.log('🔍 Testando busca com ID inválido...');
    try {
        await ClientModel.findById('');
        assert.fail('Deveria falhar com ID vazio');
    } catch (error) {
        assert.strictEqual(error.message, 'Failed to find client');
        console.log('✅ Validação de ID inválido funcionando');
    }
    
    // Teste busca por telefone inválido
    console.log('📞 Testando busca com telefone inválido...');
    try {
        await ClientModel.findByPhoneNumber('123');
        assert.fail('Deveria falhar com telefone muito curto');
    } catch (error) {
        assert.strictEqual(error.message, 'Failed to find client');
        console.log('✅ Validação de telefone curto funcionando');
    }
    
    // Teste update sem ID
    console.log('✏️  Testando update sem ID...');
    try {
        const client = new ClientModel({ name: 'João', phone_number: '11999887766' });
        await client.update({ name: 'João Santos' });
        assert.fail('Deveria falhar sem ID');
    } catch (error) {
        assert.strictEqual(error.message, 'Failed to update client');
        console.log('✅ Validação de update sem ID funcionando');
    }
    
    // Teste delete com ID inválido
    console.log('🗑️  Testando delete com ID inválido...');
    try {
        const result = await ClientModel.delete('');
        assert.fail('Deveria falhar com ID vazio');
    } catch (error) {
        assert.strictEqual(error.message, 'Failed to delete client');
        console.log('✅ Validação de delete com ID inválido funcionando');
    }
});

// Teste 3: Normalização de Dados
test('Normalização de Dados', async () => {
    console.log('\n🧪 Teste 3: Normalização de Dados');
    
    // Teste diferentes formatos de telefone
    console.log('📞 Testando normalização de telefone...');
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
    
    // Teste normalização de nome (trimming e length limit)
    console.log('👤 Testando normalização de nome...');
    const longName = 'A'.repeat(300); // Nome muito longo
    const client = new ClientModel({ name: longName, phone_number: '11999887766' });
    const created = await client.create();
    
    assert.strictEqual(created.name.length, 255, 'Nome deve ser limitado a 255 caracteres');
    console.log('✅ Nome longo truncado corretamente');
});

// Teste 4: Concorrência e Performance
test('Concorrência e Performance', async () => {
    console.log('\n🧪 Teste 4: Concorrência e Performance');
    
    // Teste criação múltipla simultânea
    console.log('🚀 Testando criação múltipla simultânea...');
    const promises = [];
    const clientCount = 5;
    
    for (let i = 0; i < clientCount; i++) {
        const clientData = {
            name: `Cliente ${i}`,
            phone_number: `1199988776${i}`
        };
        const client = new ClientModel(clientData);
        promises.push(client.create());
    }
    
    const results = await Promise.all(promises);
    
    assert.strictEqual(results.length, clientCount, `Deve criar ${clientCount} clientes`);
    results.forEach((result, index) => {
        assert.ok(validateUUID(result.id), `Cliente ${index} deve ter ID válido`);
        assert.strictEqual(result.name, `Cliente ${index}`, `Nome do cliente ${index} deve estar correto`);
    });
    console.log(`✅ ${clientCount} clientes criados simultaneamente`);
    
    // Teste performance de listagem
    console.log('📊 Testando performance de listagem...');
    const startTime = Date.now();
    const allClients = await ClientModel.findAll();
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    assert.strictEqual(allClients.length, clientCount, `Deve listar ${clientCount} clientes`);
    assert.ok(duration < 1000, 'Listagem deve ser rápida (< 1s)');
    console.log(`✅ Listagem de ${clientCount} clientes em ${duration}ms`);
});

console.log('🎉 Todos os testes de integração do ClientModel passaram!');
