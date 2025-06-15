import assert from 'assert';
import fetch from 'node-fetch';

console.log('🧪 Integração: UserController (API)');
const baseUrl = 'http://localhost:3000/api/users';
let userId;

(async () => {
  // Criar usuário
  let res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'usuario_api', password: 'senhaapi' })
  });
  let data = await res.json();
  assert.strictEqual(res.status, 201);
  assert.ok(data.data.id);
  userId = data.data.id;
  console.log('✅ Usuário criado via API');

  // Buscar todos
  res = await fetch(baseUrl);
  data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(data.data));
  console.log('✅ Listagem de usuários via API');

  // Buscar por ID
  res = await fetch(`${baseUrl}/${userId}`);
  data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.data.id, userId);
  console.log('✅ Buscar usuário por ID via API');

  // Atualizar
  res = await fetch(`${baseUrl}/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'usuario_editado' })
  });
  data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.data.username, 'usuario_editado');
  console.log('✅ Usuário atualizado via API');

  // Deletar
  res = await fetch(`${baseUrl}/${userId}`, { method: 'DELETE' });
  data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.ok(data.success);
  console.log('✅ Usuário deletado via API');
})();
