import assert from 'assert';
import { UserModel } from '../../src/models/userModel';

console.log('🧪 Integração: UserModel');

let createdUserId;

(async () => {
  const user = new UserModel({ username: 'usuario_integ', password: 'senha123' });
  const created = await user.create();
  assert.ok(created.id, 'Usuário criado deve ter ID');
  createdUserId = created.id;
  console.log('✅ Usuário criado com sucesso');

  // Buscar por ID
  const found = await UserModel.findById(createdUserId);
  assert.ok(found, 'Usuário deve ser encontrado por ID');
  assert.strictEqual(found.username, 'usuario_integ');
  console.log('✅ Usuário encontrado por ID');

  // Atualizar usuário
  await user.update({ id: createdUserId, username: 'usuario_editado' });
  const updated = await UserModel.findById(createdUserId);
  assert.strictEqual(updated.username, 'usuario_editado');
  console.log('✅ Usuário atualizado');

  // Deletar usuário
  const deleted = await UserModel.delete(createdUserId);
  assert.ok(deleted, 'Usuário deve ser deletado');
  const afterDelete = await UserModel.findById(createdUserId);
  assert.strictEqual(afterDelete, null, 'Usuário não deve existir após deleção');
  console.log('✅ Usuário deletado');
})();
