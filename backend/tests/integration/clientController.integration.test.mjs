import assert from 'assert';
import fetch from 'node-fetch';

console.log('🧪 Integração: ClientController (API)');
const baseUrl = 'http://localhost:3000/api/clients';
let clientId;

(async () => {
  // Criar cliente
  let res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Cliente API', phone_number: '11988887777' })
  });
  let data = await res.json();
  assert.strictEqual(res.status, 201);
  assert.ok(data.data.id);
  clientId = data.data.id;
  console.log('✅ Cliente criado via API');

  // Buscar todos
  res = await fetch(baseUrl);
  data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(data.data));
  console.log('✅ Listagem de clientes via API');

  // Buscar por ID
  res = await fetch(`${baseUrl}/${clientId}`);
  data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.data.id, clientId);
  console.log('✅ Buscar cliente por ID via API');

  // Atualizar
  res = await fetch(`${baseUrl}/${clientId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Cliente Editado' })
  });
  data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.data.name, 'Cliente Editado');
  console.log('✅ Cliente atualizado via API');

  // Deletar
  res = await fetch(`${baseUrl}/${clientId}`, { method: 'DELETE' });
  data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.ok(data.success);
  console.log('✅ Cliente deletado via API');
})();
