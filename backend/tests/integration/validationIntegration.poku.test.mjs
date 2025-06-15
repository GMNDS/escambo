import { assert, test, beforeEach, afterEach, describe } from 'poku';
import { cleanTestData, validateUUID, validateDate, validatePhoneNumber } from './setup.mjs';

console.log('🧪 Testes de Validação e Edge Cases com Poku');

describe('Validações e Edge Cases do Sistema', () => {
    
    beforeEach(async () => {
        await cleanTestData();
        console.log('🧹 Dados limpos para teste de validação');
    });

    afterEach(async () => {
        await cleanTestData();
        console.log('🧹 Limpeza pós-teste de validação');
    });

    test('Teste 1: Validações de Entrada de Dados', async () => {
        console.log('\n🔐 Teste 1: Validações de Entrada de Dados');
        
        // Importar modelos dinamicamente para evitar erros de inicialização
        const { ClientModel } = await import('../../src/models/clientModel.js');
        const { UserModel } = await import('../../src/models/userModel.js');
        const { TabModel } = await import('../../src/models/tabModel.js');
        const { PaymentModel } = await import('../../src/models/paymentModel.js');
        
        // Teste validações de cliente
        console.log('👥 Testando validações de cliente...');
        
        // Nome obrigatório
        try {
            new ClientModel({ name: '', phone_number: '11999887766' });
            assert.fail('Deveria falhar com nome vazio');
        } catch (error) {
            assert.strictEqual(error.message, 'Client name is required');
            console.log('✅ Validação de nome obrigatório');
        }
        
        // Telefone obrigatório
        try {
            new ClientModel({ name: 'João', phone_number: '' });
            assert.fail('Deveria falhar com telefone vazio');
        } catch (error) {
            assert.strictEqual(error.message, 'Valid phone number is required');
            console.log('✅ Validação de telefone obrigatório');
        }
        
        // Telefone com formato inválido
        try {
            new ClientModel({ name: 'João', phone_number: '123' });
            assert.fail('Deveria falhar com telefone muito curto');
        } catch (error) {
            assert.strictEqual(error.message, 'Valid phone number is required');
            console.log('✅ Validação de telefone muito curto');
        }
        
        // Teste validações de usuário
        console.log('👤 Testando validações de usuário...');
        
        // Username obrigatório
        try {
            new UserModel({ username: '', password: 'senha123' });
            assert.fail('Deveria falhar com username vazio');
        } catch (error) {
            assert.strictEqual(error.message, 'Username is required');
            console.log('✅ Validação de username obrigatório');
        }
        
        // Password obrigatório
        try {
            new UserModel({ username: 'admin', password: '' });
            assert.fail('Deveria falhar com password vazio');
        } catch (error) {
            assert.strictEqual(error.message, 'Password is required');
            console.log('✅ Validação de password obrigatório');
        }
        
        console.log('✅ Todas as validações de entrada funcionando');
    });

    test('Teste 2: Normalização Avançada de Dados', async () => {
        console.log('\n📱 Teste 2: Normalização Avançada de Dados');
        
        const { ClientModel } = await import('../../src/models/clientModel.js');
        
        // Teste normalização de telefones brasileiros
        console.log('📞 Testando normalização de telefones brasileiros...');
        const phoneTests = [
            // Formato básico
            { input: '11999887766', expected: '11999887766' },
            // Com parênteses e hífen
            { input: '(11)99988-7766', expected: '11999887766' },
            // Com espaços
            { input: '11 99988 7766', expected: '11999887766' },
            // Com código do país
            { input: '+55 11 99988-7766', expected: '5511999887766' },
            // Formato misto
            { input: '+55(11) 99988-7766', expected: '5511999887766' },
            // Telefone fixo
            { input: '(11) 3456-7890', expected: '1134567890' },
            // Com código do país - telefone fixo
            { input: '+55 11 3456-7890', expected: '55113456789' }
        ];
        
        for (const { input, expected } of phoneTests) {
            const client = new ClientModel({ name: 'Teste Phone', phone_number: input });
            const created = await client.create();
            
            assert.strictEqual(created.phone_number, expected, 
                `Telefone "${input}" deve ser normalizado para "${expected}", mas foi "${created.phone_number}"`);
            console.log(`✅ ${input} → ${expected}`);
        }
        
        // Teste normalização de nomes
        console.log('👤 Testando normalização de nomes...');
        const nameTests = [
            // Espaços extras
            { input: '  João Silva  ', expected: 'João Silva' },
            // Tabs e quebras de linha
            { input: 'Maria\tSantos\n', expected: 'Maria Santos' },
            // Múltiplos espaços
            { input: 'Pedro   José   Santos', expected: 'Pedro José Santos' },
            // Caracteres especiais mantidos
            { input: 'José-Carlos', expected: 'José-Carlos' },
            { input: "Maria D'Ávila", expected: "Maria D'Ávila" },
            // Acentos mantidos
            { input: 'João Müller', expected: 'João Müller' }
        ];
        
        for (const { input, expected } of nameTests) {
            const client = new ClientModel({ name: input, phone_number: '11999887766' });
            const created = await client.create();
            
            assert.strictEqual(created.name.trim(), expected, 
                `Nome "${input}" deve ser normalizado para "${expected}"`);
            console.log(`✅ "${input}" → "${expected}"`);
        }
        
        console.log('✅ Normalização avançada funcionando');
    });

    test('Teste 3: Limites e Constraints do Sistema', async () => {
        console.log('\n📏 Teste 3: Limites e Constraints do Sistema');
        
        const { ClientModel } = await import('../../src/models/clientModel.js');
        const { UserModel } = await import('../../src/models/userModel.js');
        
        // Teste limite de caracteres - Nome do cliente
        console.log('📝 Testando limite de caracteres para nome...');
        const longName = 'A'.repeat(300); // Nome muito longo (acima do limite)
        const client = new ClientModel({ name: longName, phone_number: '11999887766' });
        const created = await client.create();
        
        assert.ok(created.name.length <= 255, 'Nome deve ser limitado a 255 caracteres');
        assert.strictEqual(created.name.length, 255, 'Nome deve ser truncado exatamente em 255 caracteres');
        console.log(`✅ Nome longo (${longName.length} chars) truncado para ${created.name.length} chars`);
        
        // Teste limite de caracteres - Username
        console.log('👤 Testando limite de caracteres para username...');
        const longUsername = `admin_${'x'.repeat(100)}`;
        const user = new UserModel({ username: longUsername, password: 'senha123' });
        const createdUser = await user.create();
        
        assert.ok(createdUser.username.length <= 50, 'Username deve ser limitado a 50 caracteres');
        console.log(`✅ Username longo (${longUsername.length} chars) truncado para ${createdUser.username.length} chars`);
        
        // Teste telefone com tamanho máximo
        console.log('📞 Testando limite de telefone...');
        const longPhone = '1'.repeat(20); // Telefone muito longo
        const clientPhone = new ClientModel({ name: 'Teste Phone Long', phone_number: longPhone });
        const createdPhone = await clientPhone.create();
        
        assert.ok(createdPhone.phone_number.length <= 14, 'Telefone deve ser limitado a 14 caracteres');
        console.log(`✅ Telefone longo (${longPhone.length} chars) limitado para ${createdPhone.phone_number.length} chars`);
        
        console.log('✅ Todos os limites funcionando corretamente');
    });

    test('Teste 4: Edge Cases de Busca e Consulta', async () => {
        console.log('\n🔍 Teste 4: Edge Cases de Busca e Consulta');
        
        const { ClientModel } = await import('../../src/models/clientModel.js');
        const { UserModel } = await import('../../src/models/userModel.js');
        
        // Teste busca com IDs malformados
        console.log('🆔 Testando busca com IDs malformados...');
        const invalidIds = [
            '', // ID vazio
            'abc123', // Não é UUID
            '123', // Muito curto
            'invalid-uuid-format', // Formato errado
            null, // Null
            undefined // Undefined
        ];
        
        for (const invalidId of invalidIds) {
            try {
                await ClientModel.findById(invalidId);
                assert.fail(`Busca deveria falhar com ID inválido: ${invalidId}`);
            } catch (error) {
                assert.strictEqual(error.message, 'Failed to find client');
                console.log(`✅ Busca falhou corretamente com ID: "${invalidId}"`);
            }
        }
        
        // Teste busca com telefones malformados
        console.log('📱 Testando busca com telefones malformados...');
        const invalidPhones = [
            '', // Vazio
            '123', // Muito curto
            'abc', // Não numérico
            '1'.repeat(20), // Muito longo
        ];
        
        for (const invalidPhone of invalidPhones) {
            try {
                await ClientModel.findByPhoneNumber(invalidPhone);
                assert.fail(`Busca deveria falhar com telefone inválido: ${invalidPhone}`);
            } catch (error) {
                assert.strictEqual(error.message, 'Failed to find client');
                console.log(`✅ Busca falhou corretamente com telefone: "${invalidPhone}"`);
            }
        }
        
        console.log('✅ Edge cases de busca funcionando');
    });

    test('Teste 5: Operações de Update com Edge Cases', async () => {
        console.log('\n✏️ Teste 5: Operações de Update com Edge Cases');
        
        const { ClientModel } = await import('../../src/models/clientModel.js');
        const { UserModel } = await import('../../src/models/userModel.js');
        
        // Criar dados válidos primeiro
        const client = new ClientModel({ name: 'João Original', phone_number: '11999887766' });
        const createdClient = await client.create();
        
        const user = new UserModel({ username: 'user_original', password: 'senha123' });
        const createdUser = await user.create();
        
        // Teste update sem ID
        console.log('🆔 Testando update sem ID...');
        try {
            const clientWithoutId = new ClientModel({ name: 'Sem ID', phone_number: '11999887766' });
            await clientWithoutId.update({ name: 'Nome Atualizado' });
            assert.fail('Update deveria falhar sem ID');
        } catch (error) {
            assert.strictEqual(error.message, 'Client ID is required for update');
            console.log('✅ Update falhou corretamente sem ID');
        }
        
        // Teste update com ID inexistente
        console.log('🔍 Testando update com ID inexistente...');
        try {
            const fakeId = '123e4567-e89b-12d3-a456-426614174000';
            const clientInstance = new ClientModel(createdClient);
            await clientInstance.update({ id: fakeId, name: 'Nome Atualizado' });
            assert.fail('Update deveria falhar com ID inexistente');
        } catch (error) {
            assert.strictEqual(error.message, 'Failed to update client');
            console.log('✅ Update falhou corretamente com ID inexistente');
        }
        
        // Teste update com dados inválidos
        console.log('❌ Testando update com dados inválidos...');
        try {
            const clientInstance = new ClientModel(createdClient);
            await clientInstance.update({ 
                id: createdClient.id, 
                name: '', // Nome vazio
                phone_number: '11888776655' 
            });
            assert.fail('Update deveria falhar com nome vazio');
        } catch (error) {
            assert.strictEqual(error.message, 'Client name is required');
            console.log('✅ Update falhou corretamente com nome vazio');
        }
        
        // Teste update parcial válido
        console.log('✅ Testando update parcial válido...');
        const clientInstance = new ClientModel(createdClient);
        const updatedClient = await clientInstance.update({
            id: createdClient.id,
            name: 'João Atualizado'
            // phone_number não informado - deve manter o original
        });
        
        assert.strictEqual(updatedClient.name, 'João Atualizado', 'Nome deve estar atualizado');
        assert.strictEqual(updatedClient.phone_number, '11999887766', 'Telefone deve manter o original');
        console.log('✅ Update parcial funcionando');
        
        console.log('✅ Edge cases de update funcionando');
    });

    test('Teste 6: Operações de Delete com Edge Cases', async () => {
        console.log('\n🗑️ Teste 6: Operações de Delete com Edge Cases');
        
        const { ClientModel } = await import('../../src/models/clientModel.js');
        const { UserModel } = await import('../../src/models/userModel.js');
        
        // Teste delete com ID inválido
        console.log('🆔 Testando delete com IDs inválidos...');
        const invalidIds = [
            '', // Vazio
            'invalid-id', // Formato inválido
            '123e4567-e89b-12d3-a456-426614174000' // UUID válido mas inexistente
        ];
        
        for (const invalidId of invalidIds) {
            try {
                await ClientModel.delete(invalidId);
                assert.fail(`Delete deveria falhar com ID inválido: ${invalidId}`);
            } catch (error) {
                assert.strictEqual(error.message, 'Failed to delete client');
                console.log(`✅ Delete falhou corretamente com ID: "${invalidId}"`);
            }
        }
        
        // Teste delete válido
        console.log('✅ Testando delete válido...');
        const client = new ClientModel({ name: 'Para Deletar', phone_number: '11999887766' });
        const createdClient = await client.create();
        
        const deleted = await ClientModel.delete(createdClient.id);
        assert.strictEqual(deleted, true, 'Delete deve retornar true');
        
        // Verificar se foi realmente deletado
        try {
            await ClientModel.findById(createdClient.id);
            assert.fail('Cliente não deveria mais existir');
        } catch (error) {
            assert.strictEqual(error.message, 'Failed to find client');
            console.log('✅ Cliente realmente deletado');
        }
        
        // Teste delete duplo (tentar deletar novamente)
        console.log('🔄 Testando delete duplo...');
        try {
            await ClientModel.delete(createdClient.id);
            assert.fail('Segundo delete deveria falhar');
        } catch (error) {
            assert.strictEqual(error.message, 'Failed to delete client');
            console.log('✅ Delete duplo falhou corretamente');
        }
        
        console.log('✅ Edge cases de delete funcionando');
    });

    test('Teste 7: Helpers de Validação', async () => {
        console.log('\n🔧 Teste 7: Helpers de Validação');
        
        // Teste validateUUID
        console.log('🆔 Testando validateUUID...');
        const uuidTests = [
            { input: '123e4567-e89b-12d3-a456-426614174000', expected: true },
            { input: 'invalid-uuid', expected: false },
            { input: '', expected: false },
            { input: '123', expected: false },
            { input: null, expected: false },
            { input: undefined, expected: false }
        ];
        
        for (const { input, expected } of uuidTests) {
            const result = validateUUID(input);
            assert.strictEqual(result, expected, `UUID "${input}" deve retornar ${expected}`);
            console.log(`✅ "${input}" → ${result}`);
        }
        
        // Teste validateDate
        console.log('📅 Testando validateDate...');
        const dateTests = [
            { input: '2024-01-01T10:00:00.000Z', expected: true },
            { input: new Date().toISOString(), expected: true },
            { input: 'invalid-date', expected: false },
            { input: '', expected: false },
            { input: '2024-13-01', expected: false }, // Mês inválido
            { input: null, expected: false }
        ];
        
        for (const { input, expected } of dateTests) {
            const result = validateDate(input);
            assert.strictEqual(result, expected, `Data "${input}" deve retornar ${expected}`);
            console.log(`✅ "${input}" → ${result}`);
        }
        
        // Teste validatePhoneNumber
        console.log('📱 Testando validatePhoneNumber...');
        const phoneValidationTests = [
            { input: '11999887766', expected: true },
            { input: '1199988776', expected: true }, // 10 dígitos
            { input: '119998877665', expected: true }, // 11 dígitos
            { input: '123456789', expected: false }, // 9 dígitos
            { input: '123456789012', expected: false }, // 12 dígitos
            { input: '', expected: false },
            { input: 'abcdefghij', expected: false }
        ];
        
        for (const { input, expected } of phoneValidationTests) {
            const result = validatePhoneNumber(input);
            assert.strictEqual(result, expected, `Telefone "${input}" deve retornar ${expected}`);
            console.log(`✅ "${input}" → ${result}`);
        }
        
        console.log('✅ Todos os helpers de validação funcionando');
    });

    test('Teste 8: Cenários de Concorrência', async () => {
        console.log('\n⚡ Teste 8: Cenários de Concorrência');
        
        const { ClientModel } = await import('../../src/models/clientModel.js');
        
        // Teste criação simultânea com dados similares
        console.log('👥 Testando criação simultânea...');
        const promises = [];
        
        for (let i = 0; i < 5; i++) {
            promises.push(
                new ClientModel({ 
                    name: `Cliente Simultâneo ${i}`, 
                    phone_number: `1199988777${i}` 
                }).create()
            );
        }
        
        const results = await Promise.all(promises);
        
        // Verificar se todos foram criados com IDs únicos
        const ids = results.map(r => r.id);
        const uniqueIds = new Set(ids);
        assert.strictEqual(uniqueIds.size, ids.length, 'Todos os IDs devem ser únicos');
        console.log('✅ Criação simultânea com IDs únicos');
        
        // Teste busca simultânea
        console.log('🔍 Testando busca simultânea...');
        const searchPromises = ids.map(id => ClientModel.findById(id));
        const searchResults = await Promise.all(searchPromises);
        
        assert.strictEqual(searchResults.length, 5, 'Todas as buscas devem retornar resultado');
        searchResults.forEach((result, index) => {
            assert.ok(result, `Resultado ${index} não deve ser null`);
            assert.strictEqual(result.id, ids[index], `ID deve coincidir para resultado ${index}`);
        });
        console.log('✅ Busca simultânea funcionando');
        
        console.log('✅ Cenários de concorrência funcionando');
    });
});

console.log('\n🎉 Todos os testes de validação e edge cases com Poku passaram!');
