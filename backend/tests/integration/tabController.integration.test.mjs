import assert from 'assert';
import fetch from 'node-fetch';

console.log('🧪 Integração: TabController (API)');
const baseUrl = 'http://localhost:3000/api/tab';
let tabId;

(async () => {
  // Criar tab
  let res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: 'dummy-client-id', description: 'Tab API', value: '120.00', status: 'unpaid', created_by: 'dummy-user-id' })
  });
  let data = await res.json();
  assert.strictEqual(res.status, 201);
  assert.ok(data.data.id);
  tabId = data.data.id;
  console.log('✅ Tab criado via API');

  // Buscar todos
  res = await fetch(baseUrl);
  data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(data.data));
  console.log('✅ Listagem de tabs via API');

  // Buscar por ID
  res = await fetch(`${baseUrl}/${tabId}`);
  data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.data.id, tabId);
  console.log('✅ Buscar tab por ID via API');

  // Atualizar
  res = await fetch(`${baseUrl}/${tabId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description: 'Tab Editada' })
  });
  data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.data.description, 'Tab Editada');
  console.log('✅ Tab atualizada via API');

  // Deletar
  res = await fetch(`${baseUrl}/${tabId}`, { method: 'DELETE' });
  data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.ok(data.success);
  console.log('✅ Tab deletada via API');
})();
