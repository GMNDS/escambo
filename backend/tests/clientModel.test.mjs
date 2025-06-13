import { assert } from 'poku';

// Simulação da classe ClientModel para testes unitários
class MockClientModel {
  constructor(data) {
    if ("id" in data) {
      this.id = data.id;
      this.created_at = data.created_at?.toISOString?.() || data.created_at;
      this.updated_at = data.updated_at?.toISOString?.() || data.updated_at;
    }
    this.name = data.name;
    this.phone_number = data.phone_number;
  }

  async update(data) {
    if (!this.id) {
      throw new Error("Client ID is required for update");
    }
    this.name = data.name || this.name;
    this.phone_number = data.phone_number || this.phone_number;
    this.updated_at = new Date().toISOString();
    return this;
  }
}

// Teste 1: Construtor com dados de criação
console.log('🧪 Teste 1: Construtor com CreateClientData');
const newClient = new MockClientModel({
  name: 'João Silva',
  phone_number: '11999887766'
});

assert.strictEqual(newClient.name, 'João Silva', 'Nome deve ser definido corretamente');
assert.strictEqual(newClient.phone_number, '11999887766', 'Telefone deve ser definido corretamente');
assert.strictEqual(newClient.id, undefined, 'ID deve ser undefined para novo cliente');
console.log('✅ Construtor com CreateClientData passou');

// Teste 2: Construtor com dados completos
console.log('\n🧪 Teste 2: Construtor com ClientData');
const existingClient = new MockClientModel({
  id: 'test-id',
  name: 'Maria Santos',
  phone_number: '11888777666',
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-02')
});

assert.strictEqual(existingClient.name, 'Maria Santos', 'Nome deve ser definido');
assert.strictEqual(existingClient.phone_number, '11888777666', 'Telefone deve ser definido');
assert.strictEqual(existingClient.id, 'test-id', 'ID deve ser definido');
assert.strictEqual(typeof existingClient.created_at, 'string', 'created_at deve ser string ISO');
console.log('✅ Construtor com ClientData passou');

// Teste 3: Validação básica funciona
console.log('\n🧪 Teste 3: Instanciação básica');
const basicClient = new MockClientModel({
  name: 'Cliente Básico',
  phone_number: '11999888777'
});

assert.strictEqual(basicClient.name, 'Cliente Básico', 'Nome definido corretamente');
assert.strictEqual(basicClient.phone_number, '11999888777', 'Telefone definido corretamente');
console.log('✅ Instanciação básica passou');

// Teste 4: Conversão de datas para ISO string
console.log('\n🧪 Teste 4: Conversão de datas');
const clientWithDates = new MockClientModel({
  id: 'test-id',
  name: 'Test User',
  phone_number: '11999888777',
  created_at: new Date('2024-01-01T10:00:00Z'),
  updated_at: new Date('2024-01-02T15:30:00Z')
});

assert.strictEqual(clientWithDates.created_at, '2024-01-01T10:00:00.000Z', 'Data de criação convertida corretamente');
assert.strictEqual(clientWithDates.updated_at, '2024-01-02T15:30:00.000Z', 'Data de atualização convertida corretamente');
console.log('✅ Conversão de datas passou');

// Teste 5: Método update requer ID
console.log('\n🧪 Teste 5: Update requer ID');
const clientWithoutId = new MockClientModel({
  name: 'Test',
  phone_number: '11999888777'
});

try {
  await clientWithoutId.update({ name: 'Updated Name' });
  assert.fail('Deveria ter lançado erro para update sem ID');
} catch (error) {
  assert.strictEqual(error.message, 'Client ID is required for update', 'Mensagem de erro correta');
  console.log('✅ Validação de ID para update passou');
}

console.log('\n🎉 Todos os testes do MockClientModel passaram!');
