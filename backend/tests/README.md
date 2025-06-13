# Testes do ClientModel com Poku

## Estrutura dos Testes

### `clientModel.test.mjs`
Testes unitários com mock da classe `ClientModel`:

- ✅ **Construtor CreateClientData**: Verifica instanciação com dados básicos
- ✅ **Construtor ClientData**: Testa instanciação com dados completos incluindo ID e datas
- ✅ **Instanciação Básica**: Valida criação simples de instância
- ✅ **Conversão de Datas**: Confirma se as datas são convertidas para ISO string
- ✅ **Validação de Update**: Verifica se o método update exige ID

### `clientBehavior.test.mjs`
Testes de comportamento e regras de negócio:

- ✅ **Estrutura CreateClientData**: Valida tipos e estrutura dos dados de criação
- ✅ **Estrutura ClientData**: Testa estrutura completa com ID e timestamps
- ✅ **Conversão de Datas**: Verifica conversão Date para ISO string
- ✅ **Estrutura UpdateClientData**: Valida dados de atualização
- ✅ **Regras de Negócio**: Testa validações como nome vazio, telefone curto, consistência de datas
- ✅ **ID Obrigatório**: Confirma que update exige ID válido

### `clientValidation.test.mjs`
Testes de validação de dados e limites:

- ✅ **Tipos de Entrada**: Valida se os dados têm os tipos corretos
- ✅ **Formato de Telefone**: Testa diferentes formatos de telefone (11999887766, (11)99988-7766, etc.)
- ✅ **UUIDs**: Verifica se os IDs seguem o padrão UUID válido
- ✅ **Limites**: Testa se os dados respeitam os limites do schema (255 chars nome, 14 chars telefone)
- ✅ **Consistência**: Verifica consistência entre datas e dados

## Como Executar

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar teste específico
npx poku tests/clientModel.test.mjs --debug
npx poku tests/clientBehavior.test.mjs --debug
npx poku tests/clientValidation.test.mjs --debug
```

## Exemplo de Saída

```
🧪 Testes Unitários - ClientModel Behavior

🧪 Teste 1: Estrutura CreateClientData
✔ Nome deve ser string
✔ Telefone deve ser string
✔ Nome não pode estar vazio  
✔ Telefone não pode estar vazio
✅ Estrutura CreateClientData válida

🧪 Teste 2: Estrutura ClientData
✔ ClientData deve ter ID
✔ ClientData deve ter created_at
✔ ClientData deve ter updated_at
✔ Nome deve ser string
✅ Estrutura ClientData válida

🎉 Todos os testes de comportamento passaram!

Start at  ›  01:23:07
Duration  ›  211.506165ms (±0.21 seconds)
Files     ›  3

 PASS › 3   FAIL › 0
```

## Cobertura dos Testes

Os testes cobrem:

### Funcionalidades Testadas
- ✅ Construtores da classe ClientModel
- ✅ Conversão de tipos de dados
- ✅ Validação de propriedades obrigatórias
- ✅ Regras de negócio (ID obrigatório para update)
- ✅ Consistência de dados temporais

### Validações de Dados
- ✅ Tipos corretos (string, Date, etc.)
- ✅ Formatos de telefone brasileiros
- ✅ Padrões UUID para IDs
- ✅ Limites de caracteres do banco
- ✅ Datas consistentes (updated_at >= created_at)

### Estruturas de Dados
- ✅ `CreateClientData`: nome, phone_number
- ✅ `ClientData`: id, nome, phone_number, created_at, updated_at  
- ✅ `UpdateClientData`: id obrigatório, campos opcionais

## Características dos Testes

### Poku Framework
- ✅ **Asserções claras**: Uso do `assert` do Poku
- ✅ **Output colorido**: Emojis e formatação para fácil leitura
- ✅ **Execução rápida**: ~200ms para todos os testes
- ✅ **Debug mode**: Mostra todos os console.log com `--debug`

### Abordagem
- ✅ **Testes unitários**: Sem dependências externas
- ✅ **Mocks simples**: Simulação de comportamento da classe
- ✅ **Validações concisas**: Foco nas regras essenciais
- ✅ **Separação de responsabilidades**: 3 arquivos com focos diferentes

## Próximos Passos

Para uma cobertura completa, considere adicionar:

### Testes de Integração
- [ ] Mock do banco Drizzle ORM
- [ ] Testes dos métodos CRUD (`create`, `findById`, `findAll`, `update`, `delete`)
- [ ] Testes de tratamento de erros do banco
- [ ] Testes de concorrência e transações

### Testes de Performance
- [ ] Benchmark de queries
- [ ] Testes de carga com muitos registros
- [ ] Validação de timeout de conexão

### Testes E2E
- [ ] Testes com banco real (test database)
- [ ] Testes de migração de schema
- [ ] Validação completa do ciclo CRUD
