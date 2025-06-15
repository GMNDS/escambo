# Testes de Integração com Poku

Este documento descreve a suíte completa de testes de integração criada utilizando o framework **Poku** para o sistema Escambo Backend.

## 🎯 Visão Geral

Os testes com Poku foram criados para complementar e aprimorar a cobertura de testes existente, focando em:

- **Testes de Sistema Completo**: CRUD de todos os modelos, fluxos de negócio
- **Testes de API REST**: Endpoints HTTP, cenários via requisições 
- **Testes de Validação**: Edge cases, normalização de dados, tratamento de erros

## 📁 Estrutura dos Arquivos

```
tests/integration/
├── systemIntegration.poku.test.mjs      # Testes do sistema (modelos)
├── apiIntegration.poku.test.mjs         # Testes da API REST
├── validationIntegration.poku.test.mjs  # Testes de validação e edge cases
├── run-poku-tests.mjs                   # Script executor principal
└── setup.mjs                            # Configurações e helpers
```

## 🚀 Como Executar

### Comandos Básicos

```bash
# Executar todos os testes de integração com Poku
npm run test:poku

# Executar apenas testes do sistema (modelos)
npm run test:poku:system

# Executar apenas testes da API
npm run test:poku:api

# Executar apenas testes de validação
npm run test:poku:validation

# Listar todos os conjuntos de teste disponíveis
npm run test:poku:list

# Executar testes unitários + integração Poku
npm run test:complete
```

### Uso Avançado do Script

```bash
# Executar script diretamente
node tests/integration/run-poku-tests.mjs

# Executar conjunto específico
node tests/integration/run-poku-tests.mjs --run sistema
node tests/integration/run-poku-tests.mjs --run api
node tests/integration/run-poku-tests.mjs --run validation

# Ver ajuda
node tests/integration/run-poku-tests.mjs --help

# Listar conjuntos disponíveis
node tests/integration/run-poku-tests.mjs --list
```

## 📋 Conjuntos de Teste

### 1. Testes de Sistema (`systemIntegration.poku.test.mjs`)

**Foco**: Operações diretas nos modelos e lógica de negócio

**Inclui**:
- ✅ CRUD completo de Usuários
- ✅ CRUD completo de Clientes  
- ✅ CRUD completo de Tabs
- ✅ CRUD completo de Pagamentos
- ✅ Fluxo completo de negócio (Bar/Restaurante)
- ✅ Validações e tratamento de erros
- ✅ Performance e concorrência
- ✅ Normalização de dados

**Cenários Testados**:
- Criação → Busca → Atualização → Deleção
- Relacionamentos entre entidades
- Fluxo completo: Usuário → Cliente → Tab → Pagamentos
- Cenário real de bar com múltiplos pedidos e pagamentos

### 2. Testes de API (`apiIntegration.poku.test.mjs`)

**Foco**: Endpoints REST via requisições HTTP

**Inclui**:
- ✅ CRUD via API para todos os endpoints
- ✅ Validações de status HTTP (200, 201, 400, 404)
- ✅ Fluxo completo via API
- ✅ Tratamento de erros via API
- ✅ Performance com múltiplas requisições
- ✅ Cenário real de bar via API

**Endpoints Testados**:
- `POST/GET/PUT/DELETE /api/users`
- `POST/GET/PUT/DELETE /api/clients`
- `POST/GET/PUT/DELETE /api/tabs`
- `POST/GET/PUT/DELETE /api/payments`

### 3. Testes de Validação (`validationIntegration.poku.test.mjs`)

**Foco**: Edge cases, validações e robustez

**Inclui**:
- ✅ Validações de entrada de dados
- ✅ Normalização avançada de telefones
- ✅ Limites e constraints do sistema
- ✅ Edge cases de busca e consulta
- ✅ Operações com IDs inválidos
- ✅ Testes de concorrência
- ✅ Helpers de validação

**Casos Testados**:
- Dados obrigatórios vazios
- Formatos de telefone brasileiros
- Normalização de nomes
- IDs malformados e inexistentes
- Limites de caracteres
- Operações simultâneas

## 🧪 Exemplo de Saída

```
🚀 Executador de Testes de Integração com Poku
===================================================

🧪 Executando: Testes de Sistema (Modelos)
📝 Descrição: CRUD completo de todos os modelos, fluxos de negócio, validações
📁 Arquivo: tests/integration/systemIntegration.poku.test.mjs

🧪 Testes de Integração do Sistema Completo com Poku

👤 Teste 1: CRUD Completo de Usuários
📝 Criando usuário...
✅ Usuário criado com sucesso
🔍 Buscando usuário por ID...
✅ Usuário encontrado por ID
📋 Listando usuários...
✅ Listagem de usuários funcionando
✏️ Atualizando usuário...
✅ Usuário atualizado com sucesso
🗑️ Deletando usuário...
✅ Usuário deletado com sucesso

[... mais outputs ...]

✅ Testes de Sistema (Modelos) concluído em 1850ms

📊 RELATÓRIO FINAL DOS TESTES DE INTEGRAÇÃO
============================================================
1. Testes de Sistema (Modelos): ✅ PASSOU (1850ms)
2. Testes de API Completa: ✅ PASSOU (2340ms)  
3. Testes de Validação e Edge Cases: ✅ PASSOU (1120ms)

============================================================
📈 ESTATÍSTICAS:
   Total de conjuntos: 3
   Sucessos: 3
   Falhas: 0
   Taxa de sucesso: 100.0%
   Tempo total: 5890ms (5.89s)

🎉 TODOS OS TESTES DE INTEGRAÇÃO PASSARAM!
🚀 Sistema está funcionando corretamente!
```

## 🔧 Configuração

### Pré-requisitos

1. **Banco de Dados**: Configure `DATABASE_URL` no arquivo `.env`
2. **Schema Atualizado**: Execute `npm run build` para aplicar o schema
3. **Dependencies**: Execute `npm install` para instalar dependências

### Variáveis de Ambiente

```bash
# .env
DATABASE_URL=postgresql://user:password@localhost:5432/escambo_test
```

## 🎯 Benefícios dos Testes com Poku

### 1. **Cobertura Abrangente**
- Testa desde operações básicas até cenários complexos
- Inclui tanto testes de unidade quanto de integração
- Cobre edge cases e validações rigorosas

### 2. **Cenários Reais**
- Simula uso real de um bar/restaurante
- Testa fluxos completos de negócio
- Múltiplos usuários e transações simultâneas

### 3. **Performance e Robustez**
- Testes de concorrência
- Validação de limites do sistema
- Tratamento de erros robusto

### 4. **Facilidade de Uso**
- Scripts NPM simples
- Output colorido e detalhado
- Execução rápida e eficiente

### 5. **Manutenibilidade**
- Código bem estruturado
- Helpers reutilizáveis
- Documentação clara

## 📊 Métricas de Cobertura

Os testes com Poku cobrem:

- **100% dos modelos**: User, Client, Tab, Payment
- **100% das operações CRUD**: Create, Read, Update, Delete
- **100% dos endpoints API**: Todos os endpoints REST
- **Edge cases**: Validações, limites, erros
- **Cenários reais**: Fluxos de negócio completos

## 🚦 Integração com CI/CD

Os testes podem ser facilmente integrados em pipelines de CI/CD:

```yaml
# .github/workflows/tests.yml
- name: Run Poku Integration Tests
  run: npm run test:complete
```

## 🔍 Debugging

Para debugging detalhado:

```bash
# Com output completo
npx poku tests/integration/systemIntegration.poku.test.mjs --debug

# Para casos específicos, adicione console.log nos testes
```

## 📈 Próximos Passos

- [ ] Adicionar testes de carga/stress
- [ ] Testes de migração de banco
- [ ] Testes de backup/restore
- [ ] Métricas de performance detalhadas
- [ ] Testes de segurança

---

**Criado com**: Poku - Framework de testes rápido e eficiente  
**Autor**: Sistema Escambo Backend  
**Data**: Junho 2025
