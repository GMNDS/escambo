import { assert } from 'poku';

// Simulação dos controladores para testes de comportamento
class MockPaymentController {
    constructor() {
        this.payments = [];
        this.tabs = new Map();
        this.nextId = 1;
    }

    // Simula tab para testes
    addTab(id, value, status = 'unpaid') {
        this.tabs.set(id, { id, value: Number(value), status });
    }

    async create(req, res) {
        const { tab_id, value, description } = req.body;
        
        // Validação dos campos obrigatórios
        if (!tab_id || !value) {
            return res.status(400).json({ 
                success: false, 
                message: 'tab_id and value are required' 
            });
        }

        // Converte o valor para número para validações
        const newPaymentValue = Number(value);
        if (isNaN(newPaymentValue) || newPaymentValue <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Valid payment value is required' 
            });
        }

        // Busca o fiado (tab) para validar se existe
        const tab = this.tabs.get(tab_id);
        if (!tab) {
            return res.status(404).json({ 
                success: false, 
                message: 'Tab not found' 
            });
        }

        // Calcula valor total da dívida
        const tabTotalValue = tab.value;
        
        // Busca pagamentos existentes e calcula valor já pago
        const existingPayments = this.payments.filter(p => p.tab_id === tab_id);
        const totalPaid = existingPayments.reduce((sum, payment) => sum + Number(payment.value), 0);
        
        // Calcula valor restante
        const remainingValue = tabTotalValue - totalPaid;
        
        // Verifica se o novo pagamento excede o valor restante
        if (newPaymentValue > remainingValue) {
            const excessValue = newPaymentValue - remainingValue;
            return res.status(400).json({ 
                success: false, 
                message: `Valor excede o saldo devedor em R$ ${excessValue.toFixed(2)}` 
            });
        }

        // Registra o novo pagamento
        const payment = {
            id: this.nextId++,
            tab_id,
            value,
            description,
            created_at: new Date().toISOString()
        };
        this.payments.push(payment);

        // Calcula novo valor restante após o pagamento
        const newRemainingValue = remainingValue - newPaymentValue;
        
        // Atualiza status do fiado
        let newStatus;
        let successMessage;
        
        if (newRemainingValue === 0) {
            newStatus = "paid";
            successMessage = "Pagamento registrado! Fiado quitado.";
        } else {
            newStatus = "partial";
            successMessage = `Pagamento registrado! Restam R$ ${newRemainingValue.toFixed(2)}`;
        }
        
        tab.status = newStatus;

        return res.status(201).json({ 
            success: true, 
            data: payment,
            message: successMessage,
            remainingValue: newRemainingValue
        });
    }

    async getByTabId(req, res) {
        const { tab_id } = req.params;
        if (!tab_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Tab ID is required' 
            });
        }
        
        const payments = this.payments.filter(p => p.tab_id === tab_id);
        const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.value), 0);
        
        return res.status(200).json({
            success: true,
            data: payments,
            count: payments.length,
            totalPaid: totalPaid
        });
    }
}

// Mock do objeto Response
class MockResponse {
    constructor() {
        this.statusCode = 200;
        this.data = null;
    }

    status(code) {
        this.statusCode = code;
        return this;
    }

    json(data) {
        this.data = data;
        return this;
    }
}

console.log('🧪 Testes de Comportamento - Payment Business Logic');

// Teste 1: Criação de pagamento válido
console.log('\n🧪 Teste 1: Criação de pagamento válido');
const controller = new MockPaymentController();
controller.addTab('tab-1', 100);

const req1 = {
    body: {
        tab_id: 'tab-1',
        value: '50.00',
        description: 'Primeiro pagamento'
    }
};
const res1 = new MockResponse();

await controller.create(req1, res1);
assert.strictEqual(res1.statusCode, 201, 'Status deve ser 201');
assert.strictEqual(res1.data.success, true, 'Success deve ser true');
assert.strictEqual(res1.data.message, 'Pagamento registrado! Restam R$ 50.00', 'Mensagem deve indicar valor restante');
assert.strictEqual(res1.data.remainingValue, 50, 'Valor restante deve ser 50');
console.log('✅ Criação de pagamento válido passou');

// Teste 2: Pagamento que quita completamente
console.log('\n🧪 Teste 2: Pagamento que quita completamente');
const req2 = {
    body: {
        tab_id: 'tab-1',
        value: '50.00',
        description: 'Pagamento final'
    }
};
const res2 = new MockResponse();

await controller.create(req2, res2);
assert.strictEqual(res2.statusCode, 201, 'Status deve ser 201');
assert.strictEqual(res2.data.success, true, 'Success deve ser true');
assert.strictEqual(res2.data.message, 'Pagamento registrado! Fiado quitado.', 'Mensagem deve indicar quitação');
assert.strictEqual(res2.data.remainingValue, 0, 'Valor restante deve ser 0');
console.log('✅ Pagamento que quita completamente passou');

// Teste 3: Pagamento que excede valor restante
console.log('\n🧪 Teste 3: Pagamento que excede valor restante');
controller.addTab('tab-2', 100);

const req3 = {
    body: {
        tab_id: 'tab-2',
        value: '150.00',
        description: 'Pagamento excessivo'
    }
};
const res3 = new MockResponse();

await controller.create(req3, res3);
assert.strictEqual(res3.statusCode, 400, 'Status deve ser 400');
assert.strictEqual(res3.data.success, false, 'Success deve ser false');
assert(res3.data.message.includes('Valor excede o saldo devedor em R$ 50.00'), 'Mensagem deve indicar excesso');
console.log('✅ Pagamento que excede valor restante passou');

// Teste 4: Validação de campos obrigatórios
console.log('\n🧪 Teste 4: Validação de campos obrigatórios');
const req4 = {
    body: {
        value: '50.00'
        // tab_id ausente
    }
};
const res4 = new MockResponse();

await controller.create(req4, res4);
assert.strictEqual(res4.statusCode, 400, 'Status deve ser 400');
assert.strictEqual(res4.data.success, false, 'Success deve ser false');
assert.strictEqual(res4.data.message, 'tab_id and value are required', 'Mensagem deve indicar campos obrigatórios');
console.log('✅ Validação de campos obrigatórios passou');

// Teste 5: Validação de valor inválido
console.log('\n🧪 Teste 5: Validação de valor inválido');
const req5 = {
    body: {
        tab_id: 'tab-1',
        value: 'invalid'
    }
};
const res5 = new MockResponse();

await controller.create(req5, res5);
assert.strictEqual(res5.statusCode, 400, 'Status deve ser 400');
assert.strictEqual(res5.data.success, false, 'Success deve ser false');
assert.strictEqual(res5.data.message, 'Valid payment value is required', 'Mensagem deve indicar valor inválido');
console.log('✅ Validação de valor inválido passou');

// Teste 6: Tab não encontrada
console.log('\n🧪 Teste 6: Tab não encontrada');
const req6 = {
    body: {
        tab_id: 'tab-inexistente',
        value: '50.00'
    }
};
const res6 = new MockResponse();

await controller.create(req6, res6);
assert.strictEqual(res6.statusCode, 404, 'Status deve ser 404');
assert.strictEqual(res6.data.success, false, 'Success deve ser false');
assert.strictEqual(res6.data.message, 'Tab not found', 'Mensagem deve indicar tab não encontrada');
console.log('✅ Tab não encontrada passou');

// Teste 7: Buscar pagamentos por tab
console.log('\n🧪 Teste 7: Buscar pagamentos por tab');
const req7 = {
    params: {
        tab_id: 'tab-1'
    }
};
const res7 = new MockResponse();

await controller.getByTabId(req7, res7);
assert.strictEqual(res7.statusCode, 200, 'Status deve ser 200');
assert.strictEqual(res7.data.success, true, 'Success deve ser true');
assert.strictEqual(res7.data.count, 2, 'Deve retornar 2 pagamentos');
assert.strictEqual(res7.data.totalPaid, 100, 'Total pago deve ser 100');
console.log('✅ Buscar pagamentos por tab passou');

// Teste 8: Buscar pagamentos por tab sem ID
console.log('\n🧪 Teste 8: Buscar pagamentos por tab sem ID');
const req8 = {
    params: {}
};
const res8 = new MockResponse();

await controller.getByTabId(req8, res8);
assert.strictEqual(res8.statusCode, 400, 'Status deve ser 400');
assert.strictEqual(res8.data.success, false, 'Success deve ser false');
assert.strictEqual(res8.data.message, 'Tab ID is required', 'Mensagem deve indicar tab ID obrigatório');
console.log('✅ Buscar pagamentos por tab sem ID passou');

// Teste 9: Múltiplos pagamentos parciais
console.log('\n🧪 Teste 9: Múltiplos pagamentos parciais');
controller.addTab('tab-3', 200);

// Primeiro pagamento
const req9a = {
    body: {
        tab_id: 'tab-3',
        value: '60.00',
        description: 'Primeiro pagamento'
    }
};
const res9a = new MockResponse();
await controller.create(req9a, res9a);

assert.strictEqual(res9a.data.message, 'Pagamento registrado! Restam R$ 140.00', 'Primeira mensagem correta');

// Segundo pagamento
const req9b = {
    body: {
        tab_id: 'tab-3',
        value: '80.00',
        description: 'Segundo pagamento'
    }
};
const res9b = new MockResponse();
await controller.create(req9b, res9b);

assert.strictEqual(res9b.data.message, 'Pagamento registrado! Restam R$ 60.00', 'Segunda mensagem correta');

// Terceiro pagamento (quitação)
const req9c = {
    body: {
        tab_id: 'tab-3',
        value: '60.00',
        description: 'Pagamento final'
    }
};
const res9c = new MockResponse();
await controller.create(req9c, res9c);

assert.strictEqual(res9c.data.message, 'Pagamento registrado! Fiado quitado.', 'Mensagem de quitação correta');
console.log('✅ Múltiplos pagamentos parciais passou');

// Teste 10: Valor zero inválido
console.log('\n🧪 Teste 10: Valor zero inválido');
const req10 = {
    body: {
        tab_id: 'tab-1',
        value: '0'
    }
};
const res10 = new MockResponse();

await controller.create(req10, res10);
assert.strictEqual(res10.statusCode, 400, 'Status deve ser 400');
assert.strictEqual(res10.data.success, false, 'Success deve ser false');
assert.strictEqual(res10.data.message, 'Valid payment value is required', 'Mensagem deve indicar valor inválido');
console.log('✅ Valor zero inválido passou');

console.log('\n🎉 Todos os testes de comportamento do Payment passaram!');
