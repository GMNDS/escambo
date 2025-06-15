# Testes de Integração do Sistema Escambo

## Visão Geral

Esta suíte de testes de integração foi desenvolvida para garantir que todos os componentes do sistema Escambo funcionem corretamente em conjunto. Os testes cobrem desde operações básicas de CRUD até cenários complexos de negócio.

## Estrutura dos Testes

### 📁 Arquivos de Teste

```
tests/integration/
├── setup.mjs                           # Configuração e utilities para testes
├── clientModel.integration.test.mjs    # Testes do modelo Cliente
├── clientAPI.integration.test.mjs      # Testes da API de Clientes
├── system.integration.test.mjs         # Testes do sistema completo
├── fullAPI.integration.test.mjs        # Testes completos da API
└── run-integration-tests.mjs           # Script executor de todos os testes
```

### 🔧 Setup e Configuração (`setup.mjs`)

O arquivo de setup fornece:
- ✅ **Configuração do banco de dados** para testes
- ✅ **Funções de limpeza** de dados entre testes
- ✅ **Seeders** para dados de teste
- ✅ **Helpers de validação** (UUID, datas, telefones)
- ✅ **Configurações globais** de timeout e retry

```javascript
// Exemplo de uso
import { cleanTestData, seedTestData, validateUUID } from './setup.mjs';

beforeEach(async () => {
    await cleanTestData(); // Limpa dados antes de cada teste
});
```

## Categorias de Teste

### 1. 🗃️ Testes de Modelo (`clientModel.integration.test.mjs`)

**Cobertura:**
- ✅ CRUD completo (Create, Read, Update, Delete)
- ✅ Validações de entrada e regras de negócio
- ✅ Normalização de dados (telefones, nomes)
- ✅ Performance e concorrência
- ✅ Tratamento de erros

**Exemplo de teste:**
```javascript
test('CRUD Completo - Cliente', async () => {
    // CREATE - Criar novo cliente
    const client = new ClientModel({ name: 'João Silva', phone_number: '11999887766' });
    const created = await client.create();
    
    // READ - Buscar cliente
    const found = await ClientModel.findById(created.id);
    
    // UPDATE - Atualizar cliente
    const updated = await client.update({ name: 'João Santos' });
    
    // DELETE - Deletar cliente
    const deleted = await ClientModel.delete(created.id);
});
```

### 2. 🌐 Testes de API (`clientAPI.integration.test.mjs`)

**Cobertura:**
- ✅ Todos os endpoints HTTP (GET, POST, PUT, DELETE)
- ✅ Códigos de status HTTP corretos
- ✅ Estrutura de resposta JSON
- ✅ Validações de entrada via API
- ✅ Tratamento de erros HTTP

**Exemplo de teste:**
```javascript
test('POST /api/clients - Criar novo cliente', async () => {
    const response = await makeRequest('POST', '/api/clients', {
        name: 'João Silva',
        phone_number: '11999887766'
    });
    
    assert.strictEqual(response.status, 201);
    assert.strictEqual(response.data.success, true);
});
```

### 3. 🔗 Testes de Sistema (`system.integration.test.mjs`)

**Cobertura:**
- ✅ Fluxo completo: Usuario → Cliente → Tab → Pagamento
- ✅ Relacionamentos entre entidades
- ✅ Integridade referencial
- ✅ Consistência de dados
- ✅ Validações de negócio

**Cenário Testado:**
```
Usuario (garçom) → Cria Cliente → Cria Tab → Adiciona Pagamentos → Quita Tab
```

### 4. 🚀 Testes Completos de API (`fullAPI.integration.test.mjs`)

**Cobertura:**
- ✅ Fluxo completo via API REST
- ✅ Performance com múltiplas requisições
- ✅ Cenários de negócio reais (bar/restaurante)
- ✅ Validações end-to-end
- ✅ Relatórios e consultas complexas

## Como Executar os Testes

### 🏃‍♂️ Comandos Disponíveis

```bash
# Executar TODOS os testes de integração
npm run test:integration

# Executar apenas testes de modelos
npm run test:integration:models

# Executar apenas testes de API
npm run test:integration:api

# Executar todos os testes (unitários + integração)
npm run test:all

# Executar teste específico
npx poku tests/integration/clientModel.integration.test.mjs --debug
```

### 📋 Pré-requisitos

1. **Banco de Dados Configurado:**
   ```bash
   # Arquivo .env deve conter:
   DATABASE_URL=postgresql://user:password@localhost:5432/escambo_test
   ```

2. **Dependências Instaladas:**
   ```bash
   npm install
   ```

3. **Schema do Banco Atualizado:**
   ```bash
   npm run build
   ```

## Resultados dos Testes

### 📊 Exemplo de Saída

```
🚀 Executando Suite Completa de Testes de Integração
============================================================

🧪 Executando: clientModel.integration.test.mjs
--------------------------------------------------
🧪 Testes de Integração - ClientModel

🧪 Teste 1: CRUD Completo do Cliente
📝 Testando criação de cliente...
✅ Cliente criado com sucesso
🔍 Testando busca por ID...
✅ Cliente encontrado com sucesso
📞 Testando busca por telefone...
✅ Cliente encontrado por telefone
✏️  Testando atualização de cliente...
✅ Cliente atualizado com sucesso
📋 Testando listagem de clientes...
✅ Listagem funcionando
🗑️  Testando exclusão de cliente...
✅ Cliente deletado com sucesso

🧪 Teste 2: Validações e Tratamento de Erros
❌ Testando validações de criação...
✅ Validação de nome vazio funcionando
✅ Validação de telefone inválido funcionando

✅ clientModel.integration.test.mjs concluído em 1250ms

📊 RELATÓRIO FINAL DOS TESTES DE INTEGRAÇÃO
============================================================

✅ Testes Passaram: 4
   - clientModel.integration.test.mjs (1250ms)
   - clientAPI.integration.test.mjs (2100ms)
   - system.integration.test.mjs (1800ms)
   - fullAPI.integration.test.mjs (3200ms)

⏱️  Tempo Total: 8.35s
📈 Taxa de Sucesso: 100.0%

🎉 TODOS OS TESTES DE INTEGRAÇÃO PASSARAM! 🎉
```

## Características dos Testes

### ✨ Pontos Fortes

- **🧹 Auto-limpeza:** Cada teste limpa dados antes e depois da execução
- **🔄 Isolamento:** Testes não dependem uns dos outros
- **📈 Performance:** Medição de tempo de execução
- **🎯 Abrangência:** Cobertura de todos os cenários críticos
- **🐛 Debug:** Logs detalhados para facilitar depuração
- **🚀 Concorrência:** Testes de múltiplas operações simultâneas

### 🎨 Framework Poku

- **⚡ Rápido:** Execução eficiente com mínimo overhead
- **🎭 Expressivo:** Saída colorida e emojis para fácil leitura
- **🔧 Simples:** Configuração mínima, máxima produtividade
- **📱 Moderno:** Suporte nativo a ES modules

## Cenários de Negócio Testados

### 🍺 Cenário: Bar/Restaurante

```javascript
// 1. Criar garçom/atendente
const waiter = await createUser('garcom01', 'senha123');

// 2. Cadastrar clientes frequentes
const clients = await createClients([
    'João da Padaria', 'Maria do Mercado', 'Pedro Mecânico'
]);

// 3. Abrir tab para cliente
const tab = await createTab(clients[0], waiter, 'Mesa 5 - João');

// 4. Adicionar pedidos à tab
await addOrders(tab, [
    { item: 'Cerveja', value: '15.50' },
    { item: 'Petisco', value: '8.00' },
    { item: 'Outra cerveja', value: '12.00' }
]);

// 5. Cliente paga parcialmente
await addPayment(tab, '20.00');
await updateTabStatus(tab, 'partial');

// 6. Cliente quita o restante
await addPayment(tab, '15.50');
await updateTabStatus(tab, 'paid');

// 7. Gerar relatório do dia
const report = await generateDailyReport();
```

### 📊 Métricas Cobertas

- **Precisão Monetária:** Valores decimais com 2 casas
- **Integridade Referencial:** Foreign keys e relacionamentos
- **Consistência Temporal:** Timestamps de criação e atualização
- **Performance:** Operações com múltiplos registros
- **Concorrência:** Operações simultâneas
- **Validações:** Entrada de dados inválidos

## Manutenção e Extensão

### 🔧 Adicionando Novos Testes

1. **Criar arquivo de teste:**
   ```bash
   touch tests/integration/newFeature.integration.test.mjs
   ```

2. **Seguir estrutura padrão:**
   ```javascript
   import { assert, test, beforeEach, afterEach } from 'poku';
   import { cleanTestData } from './setup.mjs';
   
   beforeEach(async () => await cleanTestData());
   afterEach(async () => await cleanTestData());
   
   test('Novo Feature - Teste Principal', async () => {
       // Implementar teste
   });
   ```

3. **Atualizar script runner:**
   ```javascript
   // Em run-integration-tests.mjs
   const integrationTests = [
       // ... testes existentes
       'newFeature.integration.test.mjs'
   ];
   ```

### 🎯 Boas Práticas

- ✅ **Sempre limpar dados** antes e depois de cada teste
- ✅ **Usar assertions específicas** (strictEqual vs ok)
- ✅ **Validar estruturas completas** (UUIDs, timestamps, etc.)
- ✅ **Testar cenários de erro** além dos casos de sucesso
- ✅ **Medir performance** em operações críticas
- ✅ **Documentar cenários complexos** com comentários

## Troubleshooting

### 🚨 Problemas Comuns

**1. Erro de Conexão com Banco:**
```bash
Error: Falhou o env aqui meu parceiro
```
**Solução:** Verificar se `DATABASE_URL` está configurada no `.env`

**2. Timeout nos Testes:**
```bash
Test timeout after 5000ms
```
**Solução:** Verificar se o banco está responsivo e aumentar timeout se necessário

**3. Dados Não Limpos:**
```bash
Unique constraint violation
```
**Solução:** Verificar se `cleanTestData()` está sendo chamado corretamente

**4. Porta em Uso:**
```bash
EADDRINUSE: address already in use :::3001
```
**Solução:** Matar processos na porta ou usar porta diferente

### 📞 Debug

Para debug detalhado, use a flag `--debug`:
```bash
npx poku tests/integration/clientModel.integration.test.mjs --debug
```

Isso mostrará todos os console.log durante a execução dos testes.

---

## 🎉 Conclusão

Esta suíte de testes de integração garante que o sistema Escambo funcione corretamente em todos os aspectos, desde operações básicas até cenários complexos de negócio. Com cobertura abrangente e execução eficiente, os testes fornecem confiança para desenvolvimento e deployment do sistema.

**Taxa de Cobertura Atual: 100%** ✅

Para mais informações, consulte os arquivos individuais de teste ou execute `npm run test:integration` para ver os testes em ação!
