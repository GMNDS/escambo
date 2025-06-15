import assert from 'assert';
import { ClientModel } from '../../src/models/clientModel';

console.log('🧪 Integração: ClientModel');

let createdClientId;

// Teste: Criar cliente
(async () => {
  const client = new ClientModel({ name: 'Teste Integração', phone_number: '11999999999' });
  const created = await client.create();
  assert.ok(created.id, 'Cliente criado deve ter ID');
  createdClientId = created.id;
  console.log('✅ Cliente criado com sucesso');

  // Teste: Buscar cliente por ID
  const found = await ClientModel.findById(createdClientId);
  assert.ok(found, 'Cliente deve ser encontrado por ID');
  assert.strictEqual(found.name, 'Teste Integração');
  console.log('✅ Cliente encontrado por ID');

  // Teste: Atualizar cliente
  await client.update({ id: createdClientId, name: 'Nome Atualizado' });
  const updated = await ClientModel.findById(createdClientId);
  assert.strictEqual(updated.name, 'Nome Atualizado');
  console.log('✅ Cliente atualizado');

  // Teste: Deletar cliente
  const deleted = await ClientModel.delete(createdClientId);
  assert.ok(deleted, 'Cliente deve ser deletado');
  const afterDelete = await ClientModel.findById(createdClientId);
  assert.strictEqual(afterDelete, null, 'Cliente não deve existir após deleção');
  console.log('✅ Cliente deletado');
})();
