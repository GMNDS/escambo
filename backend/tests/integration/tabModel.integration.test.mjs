import assert from 'assert';
import { TabModel } from '../../src/models/tabModel';

console.log('🧪 Integração: TabModel');

let createdTabId;

(async () => {
  // Criar tab
  const tab = new TabModel({ client_id: 'dummy-client-id', description: 'Tab integração', value: '200.00', status: 'unpaid', created_by: 'dummy-user-id' });
  const created = await tab.create();
  assert.ok(created.id, 'Tab criado deve ter ID');
  createdTabId = created.id;
  console.log('✅ Tab criado com sucesso');

  // Buscar por ID
  const found = await TabModel.findById(createdTabId);
  assert.ok(found, 'Tab deve ser encontrado por ID');
  assert.strictEqual(found.description, 'Tab integração');
  console.log('✅ Tab encontrado por ID');

  // Atualizar tab
  await tab.update({ id: createdTabId, description: 'Tab editado' });
  const updated = await TabModel.findById(createdTabId);
  assert.strictEqual(updated.description, 'Tab editado');
  console.log('✅ Tab atualizado');

  // Deletar tab
  const deleted = await TabModel.delete(createdTabId);
  assert.ok(deleted, 'Tab deve ser deletado');
  const afterDelete = await TabModel.findById(createdTabId);
  assert.strictEqual(afterDelete, null, 'Tab não deve existir após deleção');
  console.log('✅ Tab deletado');
})();
