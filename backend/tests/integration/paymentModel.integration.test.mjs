import assert from 'assert';
import { PaymentModel } from '../../src/models/paymentModel';
import { TabModel } from '../../src/models/tabModel';

console.log('🧪 Integração: PaymentModel');

let createdPaymentId;
let tabId;

(async () => {
  // Pré-requisito: criar um tab para associar o pagamento
  const tab = new TabModel({ client_id: 'dummy-client-id', description: 'Tab para pagamento', value: '100.00', status: 'unpaid', created_by: 'dummy-user-id' });
  const createdTab = await tab.create();
  tabId = createdTab.id;

  // Criar pagamento
  const payment = new PaymentModel({ tab_id: tabId, value: '50.00' });
  const created = await payment.create();
  assert.ok(created.id, 'Pagamento criado deve ter ID');
  createdPaymentId = created.id;
  console.log('✅ Pagamento criado com sucesso');

  // Buscar por ID
  const found = await PaymentModel.findById(createdPaymentId);
  assert.ok(found, 'Pagamento deve ser encontrado por ID');
  assert.strictEqual(found.value, '50.00');
  console.log('✅ Pagamento encontrado por ID');

  // Atualizar pagamento
  await payment.update({ id: createdPaymentId, value: '60.00' });
  const updated = await PaymentModel.findById(createdPaymentId);
  assert.strictEqual(updated.value, '60.00');
  console.log('✅ Pagamento atualizado');

  // Deletar pagamento
  const deleted = await PaymentModel.delete(createdPaymentId);
  assert.ok(deleted, 'Pagamento deve ser deletado');
  const afterDelete = await PaymentModel.findById(createdPaymentId);
  assert.strictEqual(afterDelete, null, 'Pagamento não deve existir após deleção');
  console.log('✅ Pagamento deletado');
})();
