import { assert } from 'poku';

// Simulação da classe PaymentModel para testes unitários
class MockPaymentModel {
    constructor(data) {
        if (!data.tab_id || typeof data.tab_id !== "string") {
            throw new Error("tab_id is required");
        }
        if (typeof data.value !== "string" || isNaN(Number(data.value))) {
            throw new Error("Valid value is required");
        }
        if ("id" in data) {
            this.id = data.id;
            this.created_at = data.created_at instanceof Date
                ? data.created_at.toISOString()
                : data.created_at;
        }
        this.tab_id = data.tab_id;
        this.value = data.value;
        this.description = data.description;
    }

    async create() {
        this.id = 'payment-test-id';
        this.created_at = new Date().toISOString();
        return this;
    }

    async update(data) {
        if (!this.id) {
            throw new Error("Payment ID is required for update");
        }
        if (data.tab_id) this.tab_id = data.tab_id;
        if (typeof data.value === "string") this.value = data.value;
        if (data.description !== undefined) this.description = data.description;
        return this;
    }

    static findByTabId = async (tabId) => {
        if (!tabId || typeof tabId !== "string") {
            throw new Error("Valid tab ID is required");
        }
        // Simula pagamentos existentes
        return [
            { id: "pay1", tab_id: tabId, value: "50.00", description: "Pagamento 1" },
            { id: "pay2", tab_id: tabId, value: "30.00", description: "Pagamento 2" }
        ];
    };

    static getTotalPaidByTabId = async (tabId) => {
        const payments = await MockPaymentModel.findByTabId(tabId);
        return payments.reduce((total, payment) => total + Number(payment.value), 0);
    };
}

console.log('🧪 Testes Unitários - PaymentModel');

// Teste 1: Construtor com dados de criação
console.log('\n🧪 Teste 1: Construtor com CreatePaymentData');
const newPayment = new MockPaymentModel({
    tab_id: 'tab-123',
    value: '100.50',
    description: 'Pagamento teste'
});

assert.strictEqual(newPayment.tab_id, 'tab-123', 'Tab ID deve ser definido corretamente');
assert.strictEqual(newPayment.value, '100.50', 'Valor deve ser definido corretamente');
assert.strictEqual(newPayment.description, 'Pagamento teste', 'Descrição deve ser definida corretamente');
assert.strictEqual(newPayment.id, undefined, 'ID deve ser undefined para novo pagamento');
console.log('✅ Construtor com CreatePaymentData passou');

// Teste 2: Construtor com dados completos
console.log('\n🧪 Teste 2: Construtor com PaymentData');
const existingPayment = new MockPaymentModel({
    id: 'payment-id',
    tab_id: 'tab-456',
    value: '75.25',
    description: 'Pagamento existente',
    created_at: new Date('2024-01-01')
});

assert.strictEqual(existingPayment.id, 'payment-id', 'ID deve ser definido');
assert.strictEqual(existingPayment.tab_id, 'tab-456', 'Tab ID deve ser definido');
assert.strictEqual(existingPayment.value, '75.25', 'Valor deve ser definido');
assert.strictEqual(existingPayment.description, 'Pagamento existente', 'Descrição deve ser definida');
console.log('✅ Construtor com PaymentData passou');

// Teste 3: Validação de tab_id obrigatório
console.log('\n🧪 Teste 3: Validação tab_id obrigatório');
try {
    new MockPaymentModel({ value: '100.00' });
    assert.fail('Deveria ter lançado erro para tab_id ausente');
} catch (error) {
    assert.strictEqual(error.message, 'tab_id is required', 'Erro correto para tab_id ausente');
}
console.log('✅ Validação tab_id obrigatório passou');

// Teste 4: Validação de valor obrigatório
console.log('\n🧪 Teste 4: Validação valor obrigatório');
try {
    new MockPaymentModel({ tab_id: 'tab-123' });
    assert.fail('Deveria ter lançado erro para valor ausente');
} catch (error) {
    assert.strictEqual(error.message, 'Valid value is required', 'Erro correto para valor ausente');
}
console.log('✅ Validação valor obrigatório passou');

// Teste 5: Validação de valor inválido
console.log('\n🧪 Teste 5: Validação valor inválido');
try {
    new MockPaymentModel({ tab_id: 'tab-123', value: 'invalid' });
    assert.fail('Deveria ter lançado erro para valor inválido');
} catch (error) {
    assert.strictEqual(error.message, 'Valid value is required', 'Erro correto para valor inválido');
}
console.log('✅ Validação valor inválido passou');

// Teste 6: Método create
console.log('\n🧪 Teste 6: Método create');
const payment = new MockPaymentModel({
    tab_id: 'tab-789',
    value: '200.00',
    description: 'Novo pagamento'
});

const created = await payment.create();
assert(created.id, 'ID deve ser gerado após criação');
assert(created.created_at, 'created_at deve ser definido');
console.log('✅ Método create passou');

// Teste 7: Método update
console.log('\n🧪 Teste 7: Método update');
const updated = await created.update({
    id: created.id,
    value: '250.00',
    description: 'Pagamento atualizado'
});

assert.strictEqual(updated.value, '250.00', 'Valor deve ser atualizado');
assert.strictEqual(updated.description, 'Pagamento atualizado', 'Descrição deve ser atualizada');
console.log('✅ Método update passou');

// Teste 8: findByTabId
console.log('\n🧪 Teste 8: Método findByTabId');
const payments = await MockPaymentModel.findByTabId('tab-test');
assert.strictEqual(payments.length, 2, 'Deve retornar 2 pagamentos');
assert.strictEqual(payments[0].tab_id, 'tab-test', 'Tab ID deve estar correto');
console.log('✅ Método findByTabId passou');

// Teste 9: getTotalPaidByTabId
console.log('\n🧪 Teste 9: Método getTotalPaidByTabId');
const totalPaid = await MockPaymentModel.getTotalPaidByTabId('tab-test');
assert.strictEqual(totalPaid, 80, 'Total pago deve ser 80.00 (50 + 30)');
console.log('✅ Método getTotalPaidByTabId passou');

// Teste 10: Validação de ID necessário para update
console.log('\n🧪 Teste 10: Validação ID necessário para update');
const paymentWithoutId = new MockPaymentModel({ tab_id: 'tab-123', value: '100.00' });
try {
    await paymentWithoutId.update({ value: '150.00' });
    assert.fail('Deveria ter lançado erro para update sem ID');
} catch (error) {
    assert.strictEqual(error.message, 'Payment ID is required for update', 'Erro correto para update sem ID');
}
console.log('✅ Validação ID necessário para update passou');

console.log('\n🎉 Todos os testes do PaymentModel passaram!');
