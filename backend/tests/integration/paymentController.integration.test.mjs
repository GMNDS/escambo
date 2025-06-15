import assert from 'assert';
import fetch from 'node-fetch';

console.log('🧪 Integração: PaymentController (API)');
const baseUrl = 'http://localhost:3000/api/payments';
let paymentId;

(async () => {
  // Pré-requisito: criar um tab para associar o pagamento
  // (Você pode adaptar para criar via API se necessário)
  const tabId = 'dummy-tab-id';

  // Criar pagamento
  let res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tab_id: tabId, value: '30.00' })
  });
  let data = await res.json();
  assert.strictEqual(res.status, 201);
  assert.ok(data.data.id);
  paymentId = data.data.id;
  console.log('✅ Pagamento criado via API');

  // Buscar todos
  res = await fetch(baseUrl);
  data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(data.data));
  console.log('✅ Listagem de pagamentos via API');

  // Buscar por ID
  res = await fetch(`${baseUrl}/${paymentId}`);
  data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.data.id, paymentId);
  console.log('✅ Buscar pagamento por ID via API');

  // Atualizar
  res = await fetch(`${baseUrl}/${paymentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value: '40.00' })
  });
  data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.data.value, '40.00');
  console.log('✅ Pagamento atualizado via API');

  // Deletar
  res = await fetch(`${baseUrl}/${paymentId}`, { method: 'DELETE' });
  data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.ok(data.success);
  console.log('✅ Pagamento deletado via API');
})();
