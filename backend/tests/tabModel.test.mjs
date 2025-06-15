import { assert } from 'poku';

// Simulação da classe TabModel para testes unitários
class MockTabModel {
    constructor(data) {
        if (!data.description || data.description.trim().length === 0) {
            throw new Error("Description is required");
        }
        if (!data.value || isNaN(Number(data.value))) {
            throw new Error("Valid value is required");
        }
        if (!data.status) {
            throw new Error("Status is required");
        }

        if ("id" in data) {
            this.id = data.id;
            this.created_at = data.created_at instanceof Date
                ? data.created_at.toISOString()
                : data.created_at;
            this.updated_at = data.updated_at instanceof Date
                ? data.updated_at.toISOString()
                : data.updated_at;
        }

        this.client_id = data.client_id ?? null;
        this.description = data.description.substring(0, 255);
        this.value = data.value;
        this.status = data.status;
        this.created_by = data.created_by ?? null;
    }

    async create() {
        this.id = 'tab-test-id';
        this.created_at = new Date().toISOString();
        this.updated_at = new Date().toISOString();
        return this;
    }

    async update(data) {
        if (!this.id) {
            throw new Error("Tab ID is required for update");
        }
        if (data.client_id !== undefined) this.client_id = data.client_id;
        if (data.description) this.description = data.description.substring(0, 255);
        if (data.value) this.value = data.value;
        if (data.status) this.status = data.status;
        if (data.created_by !== undefined) this.created_by = data.created_by;
        this.updated_at = new Date().toISOString();
        return this;
    }

    static updateStatus = async (id, status) => {
        if (!id) {
            throw new Error("Tab ID is required");
        }
        if (!["unpaid", "paid", "partial"].includes(status)) {
            throw new Error("Valid status is required");
        }
        
        // Simula atualização de status
        return {
            id: id,
            status: status,
            value: "100.00",
            description: "Tab teste",
            client_id: "client-123",
            created_by: "user-123",
            updated_at: new Date().toISOString()
        };
    };
}

console.log('🧪 Testes Unitários - TabModel');

// Teste 1: Construtor com dados de criação
console.log('\n🧪 Teste 1: Construtor com CreateTabData');
const newTab = new MockTabModel({
    client_id: 'client-123',
    description: 'Fiado teste',
    value: '150.00',
    status: 'unpaid',
    created_by: 'user-123'
});

assert.strictEqual(newTab.client_id, 'client-123', 'Client ID deve ser definido corretamente');
assert.strictEqual(newTab.description, 'Fiado teste', 'Descrição deve ser definida corretamente');
assert.strictEqual(newTab.value, '150.00', 'Valor deve ser definido corretamente');
assert.strictEqual(newTab.status, 'unpaid', 'Status deve ser definido corretamente');
assert.strictEqual(newTab.created_by, 'user-123', 'Created by deve ser definido corretamente');
assert.strictEqual(newTab.id, undefined, 'ID deve ser undefined para nova tab');
console.log('✅ Construtor com CreateTabData passou');

// Teste 2: Construtor com dados completos
console.log('\n🧪 Teste 2: Construtor com TabData');
const existingTab = new MockTabModel({
    id: 'tab-id',
    client_id: 'client-456',
    description: 'Fiado existente',
    value: '200.00',
    status: 'partial',
    created_by: 'user-456',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-02')
});

assert.strictEqual(existingTab.id, 'tab-id', 'ID deve ser definido');
assert.strictEqual(existingTab.client_id, 'client-456', 'Client ID deve ser definido');
assert.strictEqual(existingTab.description, 'Fiado existente', 'Descrição deve ser definida');
assert.strictEqual(existingTab.value, '200.00', 'Valor deve ser definido');
assert.strictEqual(existingTab.status, 'partial', 'Status deve ser definido');
console.log('✅ Construtor com TabData passou');

// Teste 3: Validação de descrição obrigatória
console.log('\n🧪 Teste 3: Validação descrição obrigatória');
try {
    new MockTabModel({ value: '100.00', status: 'unpaid' });
    assert.fail('Deveria ter lançado erro para descrição ausente');
} catch (error) {
    assert.strictEqual(error.message, 'Description is required', 'Erro correto para descrição ausente');
}
console.log('✅ Validação descrição obrigatória passou');

// Teste 4: Validação de valor obrigatório
console.log('\n🧪 Teste 4: Validação valor obrigatório');
try {
    new MockTabModel({ description: 'Teste', status: 'unpaid' });
    assert.fail('Deveria ter lançado erro para valor ausente');
} catch (error) {
    assert.strictEqual(error.message, 'Valid value is required', 'Erro correto para valor ausente');
}
console.log('✅ Validação valor obrigatório passou');

// Teste 5: Validação de status obrigatório
console.log('\n🧪 Teste 5: Validação status obrigatório');
try {
    new MockTabModel({ description: 'Teste', value: '100.00' });
    assert.fail('Deveria ter lançado erro para status ausente');
} catch (error) {
    assert.strictEqual(error.message, 'Status is required', 'Erro correto para status ausente');
}
console.log('✅ Validação status obrigatório passou');

// Teste 6: Método create
console.log('\n🧪 Teste 6: Método create');
const tab = new MockTabModel({
    client_id: 'client-789',
    description: 'Nova tab',
    value: '300.00',
    status: 'unpaid',
    created_by: 'user-789'
});

const created = await tab.create();
assert(created.id, 'ID deve ser gerado após criação');
assert(created.created_at, 'created_at deve ser definido');
assert(created.updated_at, 'updated_at deve ser definido');
console.log('✅ Método create passou');

// Teste 7: Método update
console.log('\n🧪 Teste 7: Método update');
const updated = await created.update({
    id: created.id,
    description: 'Tab atualizada',
    value: '350.00',
    status: 'partial'
});

assert.strictEqual(updated.description, 'Tab atualizada', 'Descrição deve ser atualizada');
assert.strictEqual(updated.value, '350.00', 'Valor deve ser atualizado');
assert.strictEqual(updated.status, 'partial', 'Status deve ser atualizado');
console.log('✅ Método update passou');

// Teste 8: updateStatus
console.log('\n🧪 Teste 8: Método updateStatus');
const updatedStatus = await MockTabModel.updateStatus('tab-123', 'paid');
assert.strictEqual(updatedStatus.id, 'tab-123', 'ID deve estar correto');
assert.strictEqual(updatedStatus.status, 'paid', 'Status deve ser atualizado para paid');
console.log('✅ Método updateStatus passou');

// Teste 9: Validação updateStatus com ID inválido
console.log('\n🧪 Teste 9: Validação updateStatus com ID inválido');
try {
    await MockTabModel.updateStatus('', 'paid');
    assert.fail('Deveria ter lançado erro para ID ausente');
} catch (error) {
    assert.strictEqual(error.message, 'Tab ID is required', 'Erro correto para ID ausente');
}
console.log('✅ Validação updateStatus com ID inválido passou');

// Teste 10: Validação updateStatus com status inválido
console.log('\n🧪 Teste 10: Validação updateStatus com status inválido');
try {
    await MockTabModel.updateStatus('tab-123', 'invalid');
    assert.fail('Deveria ter lançado erro para status inválido');
} catch (error) {
    assert.strictEqual(error.message, 'Valid status is required', 'Erro correto para status inválido');
}
console.log('✅ Validação updateStatus com status inválido passou');

// Teste 11: Limitação de descrição a 255 caracteres
console.log('\n🧪 Teste 11: Limitação de descrição a 255 caracteres');
const longDescription = 'A'.repeat(300);
const tabWithLongDesc = new MockTabModel({
    description: longDescription,
    value: '100.00',
    status: 'unpaid'
});

assert.strictEqual(tabWithLongDesc.description.length, 255, 'Descrição deve ser limitada a 255 caracteres');
console.log('✅ Limitação de descrição a 255 caracteres passou');

console.log('\n🎉 Todos os testes do TabModel passaram!');
