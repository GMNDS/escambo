# 🧪 Testes do Sistema Escambo

Este diretório contém todos os testes do sistema Escambo, organizados por tipo e funcionalidade.

## 📁 Estrutura dos Testes

```
tests/
├── README.md                           # Este arquivo
├── clientBehavior.test.mjs             # Testes de comportamento de clientes
├── clientModel.test.mjs                # Testes unitários do modelo Cliente
├── clientValidation.test.mjs           # Testes de validação de clientes
├── paymentModel.test.mjs               # Testes unitários do modelo Pagamento
├── paymentBehavior.test.mjs            # Testes de comportamento de pagamentos
├── tabModel.test.mjs                   # Testes unitários do modelo Fiado
├── userModel.test.mjs                  # Testes unitários do modelo Usuário
└── integration/                        # Testes de integração
    ├── clientAPI.integration.test.mjs      # API de clientes
    ├── clientModel.integration.test.mjs    # Integração de modelos de clientes
    ├── fullAPI.integration.test.mjs        # API completa (fluxo completo)
    ├── paymentAPI.integration.test.mjs     # API de pagamentos
    ├── system.integration.test.mjs         # Integração do sistema
    ├── systemIntegration.poku.test.mjs     # Sistema (Poku)
    ├── apiIntegration.poku.test.mjs        # API (Poku)
    ├── validationIntegration.poku.test.mjs # Validações (Poku)
    ├── setup.mjs                           # Configuração dos testes
    ├── run-integration-tests.mjs           # Executor de testes de integração
    └── run-poku-tests.mjs                  # Executor de testes Poku
```

## 🎯 Tipos de Testes

### 1. **Testes Unitários** (Modelos)
- **clientModel.test.mjs**: Testa a classe `ClientModel`
- **paymentModel.test.mjs**: Testa a classe `PaymentModel`
- **tabModel.test.mjs**: Testa a classe `TabModel`
- **userModel.test.mjs**: Testa a classe `UserModel`

### 2. **Testes de Comportamento**
- **clientBehavior.test.mjs**: Testa comportamentos específicos de clientes
- **clientValidation.test.mjs**: Testa validações de dados de clientes
- **paymentBehavior.test.mjs**: Testa lógica de negócio de pagamentos

### 3. **Testes de Integração**
- **fullAPI.integration.test.mjs**: Fluxo completo da API
- **clientAPI.integration.test.mjs**: API específica de clientes
- **paymentAPI.integration.test.mjs**: API específica de pagamentos
- **system.integration.test.mjs**: Integração entre componentes

## 🚀 Como Executar

### Executar Todos os Testes
```bash
npm test
```

### Testes Unitários
```bash
npm run test:unit                    # Todos os testes unitários
npm run test:models                  # Apenas testes de modelos
npm run test:behavior                # Apenas testes de comportamento
```

### Testes Específicos por Modelo
```bash
npm run test:payments                # Testes de pagamentos (unit + integration)
poku tests/clientModel.test.mjs     # Apenas modelo de cliente
poku tests/paymentModel.test.mjs    # Apenas modelo de pagamento
poku tests/tabModel.test.mjs        # Apenas modelo de fiado
poku tests/userModel.test.mjs       # Apenas modelo de usuário
```

### Testes de Integração
```bash
npm run test:integration             # Todos os testes de integração
npm run test:integration:api         # Apenas testes de API
npm run test:integration:models      # Apenas testes de modelos integrados

# Testes Poku
npm run test:poku                    # Todos os testes Poku
npm run test:poku:system             # Sistema
npm run test:poku:api                # API
npm run test:poku:validation         # Validações
```

### Execução Completa
```bash
npm run test:complete                # Unit + Integration completos
npm run test:all                     # Unit + Integration (básico)
```

## 📊 Cobertura de Testes

### Modelos Testados (100%)
- ✅ **ClientModel**: CRUD, validações, normalização
- ✅ **UserModel**: CRUD, validações, autenticação
- ✅ **TabModel**: CRUD, status, relacionamentos
- ✅ **PaymentModel**: CRUD, relacionamentos, cálculos

### Controllers Testados (100%)
- ✅ **ClientController**: CRUD via API
- ✅ **UserController**: CRUD via API
- ✅ **TabController**: CRUD via API
- ✅ **PaymentController**: CRUD + lógica de negócio via API

### Endpoints API Testados (100%)

#### Clientes (`/api/clients`)
- ✅ `GET /` - Listar todos
- ✅ `POST /` - Criar cliente
- ✅ `GET /:id` - Buscar por ID
- ✅ `PUT /:id` - Atualizar cliente
- ✅ `DELETE /:id` - Deletar cliente

#### Usuários (`/api/users`)
- ✅ `GET /` - Listar todos
- ✅ `POST /` - Criar usuário
- ✅ `GET /:id` - Buscar por ID
- ✅ `PUT /:id` - Atualizar usuário
- ✅ `DELETE /:id` - Deletar usuário

#### Fiados (`/api/tabs`)
- ✅ `GET /` - Listar todos
- ✅ `POST /` - Criar fiado
- ✅ `GET /:id` - Buscar por ID
- ✅ `PUT /:id` - Atualizar fiado
- ✅ `DELETE /:id` - Deletar fiado

#### Pagamentos (`/api/payments`)
- ✅ `GET /` - Listar todos
- ✅ `POST /` - Criar pagamento (com lógica de negócio)
- ✅ `GET /:id` - Buscar por ID
- ✅ `PUT /:id` - Atualizar pagamento
- ✅ `DELETE /:id` - Deletar pagamento
- ✅ `GET /tab/:tab_id` - Buscar pagamentos por fiado

### Lógicas de Negócio Testadas

#### Pagamentos
- ✅ Validação de campos obrigatórios
- ✅ Validação de valores numéricos
- ✅ Verificação de existência do fiado
- ✅ Cálculo de valor restante
- ✅ Validação de excesso de pagamento
- ✅ Atualização automática de status do fiado
- ✅ Mensagens contextuais de retorno
- ✅ Quitação completa vs. parcial

#### Validações
- ✅ Campos obrigatórios
- ✅ Tipos de dados
- ✅ Formatos específicos (telefone, email, etc.)
- ✅ Limites de tamanho
- ✅ Relacionamentos válidos

## 🔧 Configuração dos Testes

### Ambiente de Teste
- **Framework**: Poku
- **Banco**: PostgreSQL (Neon)
- **Port**: Dinâmico para evitar conflitos
- **Limpeza**: Automática antes/depois de cada teste

### Setup Automático
- Criação de tabelas
- Limpeza de dados
- Isolamento entre testes
- Validação de ambiente

## 📈 Relatórios

### Execução dos Testes
- Tempo de execução por teste
- Status de sucesso/falha
- Contadores de assertions
- Cobertura por funcionalidade

### Exemplo de Saída
```
🧪 Testes Unitários - PaymentModel
✅ Construtor com CreatePaymentData passou
✅ Validação tab_id obrigatório passou
✅ Método create passou
...
🎉 Todos os testes do PaymentModel passaram!
```

## 🎨 Melhores Práticas

### Estrutura dos Testes
1. **Arrange**: Preparar dados e mocks
2. **Act**: Executar a funcionalidade
3. **Assert**: Verificar resultados

### Nomenclatura
- Descritiva e clara
- Indica o que está sendo testado
- Agrupa testes relacionados

### Isolamento
- Cada teste é independente
- Limpeza automática de dados
- Sem efeitos colaterais

### Coverage
- Casos de sucesso
- Casos de erro
- Edge cases
- Validações

## 🚨 Comandos de Debug

```bash
# Executar com debug detalhado
poku tests/paymentModel.test.mjs --debug

# Ver apenas falhas
npm test 2>&1 | grep "❌\|Error"

# Testar arquivo específico
poku tests/integration/paymentAPI.integration.test.mjs --debug

# Listar testes disponíveis
npm run test:poku:list
```
