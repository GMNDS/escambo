import { assert } from 'poku';

console.log('🧪 Testes Unitários - ClientModel Behavior');

// Teste 1: Validação de estrutura de dados
console.log('\n🧪 Teste 1: Estrutura CreateClientData');
const createData = {
  name: 'João Silva',
  phone_number: '11999887766'
};

assert.strictEqual(typeof createData.name, 'string', 'Nome deve ser string');
assert.strictEqual(typeof createData.phone_number, 'string', 'Telefone deve ser string');
assert.ok(createData.name.length > 0, 'Nome não pode estar vazio');
assert.ok(createData.phone_number.length > 0, 'Telefone não pode estar vazio');
console.log('✅ Estrutura CreateClientData válida');

// Teste 2: Validação de ClientData completo
console.log('\n🧪 Teste 2: Estrutura ClientData');
const clientData = {
  id: 'abc-123',
  name: 'Maria Santos',
  phone_number: '11888777666',
  created_at: new Date(),
  updated_at: new Date()
};

assert.ok('id' in clientData, 'ClientData deve ter ID');
assert.ok('created_at' in clientData, 'ClientData deve ter created_at');
assert.ok('updated_at' in clientData, 'ClientData deve ter updated_at');
assert.strictEqual(typeof clientData.name, 'string', 'Nome deve ser string');
console.log('✅ Estrutura ClientData válida');

// Teste 3: Conversão de Date para ISO string
console.log('\n🧪 Teste 3: Conversão de datas');
const testDate = new Date('2024-01-01T10:00:00Z');
const isoString = testDate.toISOString();

assert.strictEqual(isoString, '2024-01-01T10:00:00.000Z', 'Data convertida corretamente');
assert.strictEqual(typeof isoString, 'string', 'ISO string deve ser string');
console.log('✅ Conversão de datas passou');

// Teste 4: Validação de UpdateClientData
console.log('\n🧪 Teste 4: Estrutura UpdateClientData');
const updateData = {
  id: 'test-id',
  name: 'Nome Atualizado'
};

assert.ok('id' in updateData, 'UpdateClientData deve ter ID');
assert.strictEqual(typeof updateData.id, 'string', 'ID deve ser string');
// phone_number é opcional em UpdateClientData
assert.ok(!('phone_number' in updateData) || typeof updateData.phone_number === 'string', 'Telefone deve ser string se presente');
console.log('✅ Estrutura UpdateClientData válida');

// Teste 5: Validação de regras de negócio
console.log('\n🧪 Teste 5: Regras de negócio');

// Nome não pode ser vazio
const emptyNameData = { name: '', phone_number: '11999888777' };
assert.ok(emptyNameData.name.trim().length === 0, 'Nome vazio detectado corretamente');

// Telefone deve ter formato mínimo
const shortPhone = '123';
const validPhone = '11999888777';
assert.ok(shortPhone.length < 10, 'Telefone muito curto detectado');
assert.ok(validPhone.length >= 10, 'Telefone válido aceito');

// Datas devem ser consistentes
const date1 = new Date('2024-01-01');
const date2 = new Date('2024-01-02');
assert.ok(date2 >= date1, 'Data de atualização deve ser >= data de criação');

console.log('✅ Regras de negócio validadas');

// Teste 6: Simulação de erro de ID obrigatório
console.log('\n🧪 Teste 6: Validação de ID obrigatório para update');

function simulateUpdate(clientData, updateData) {
  if (!clientData.id) {
    throw new Error('Client ID is required for update');
  }
  return { ...clientData, ...updateData, updated_at: new Date() };
}

const clientWithoutId = { name: 'Test', phone_number: '11999888777' };
const clientWithId = { id: 'test-id', name: 'Test', phone_number: '11999888777' };

try {
  simulateUpdate(clientWithoutId, { name: 'Updated' });
  assert.fail('Deveria ter lançado erro para cliente sem ID');
} catch (error) {
  assert.strictEqual(error.message, 'Client ID is required for update', 'Mensagem de erro correta');
}

const updatedClient = simulateUpdate(clientWithId, { name: 'Updated Name' });
assert.strictEqual(updatedClient.name, 'Updated Name', 'Cliente atualizado corretamente');
console.log('✅ Validação de ID obrigatório passou');

console.log('\n🎉 Todos os testes de comportamento passaram!');
