#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('🚀 Executador de Testes de Integração com Poku');
console.log('===================================================\n');

// Configuração dos testes
const testSuites = [
    {
        name: 'Testes de Sistema (Modelos)',
        file: 'tests/integration/systemIntegration.poku.test.mjs',
        description: 'CRUD completo de todos os modelos, fluxos de negócio, validações'
    },
    {
        name: 'Testes de API Completa',
        file: 'tests/integration/apiIntegration.poku.test.mjs',
        description: 'Endpoints REST, fluxos via HTTP, cenários reais'
    },
    {
        name: 'Testes de Validação e Edge Cases',
        file: 'tests/integration/validationIntegration.poku.test.mjs',
        description: 'Validações, normalização, limites, edge cases'
    }
];

// Função para executar um conjunto de testes
async function runTestSuite(suite) {
    console.log(`🧪 Executando: ${suite.name}`);
    console.log(`📝 Descrição: ${suite.description}`);
    console.log(`📁 Arquivo: ${suite.file}\n`);
    
    try {
        const startTime = Date.now();
        
        // Executar o teste com poku
        const { stdout, stderr } = await execAsync(`npx poku ${suite.file} --debug`);
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(stdout);
        
        if (stderr && stderr.trim()) {
            console.error('⚠️ Avisos/Erros:');
            console.error(stderr);
        }
        
        console.log(`✅ ${suite.name} concluído em ${duration}ms\n`);
        console.log('=' .repeat(60) + '\n');
        
        return { success: true, duration, suite: suite.name };
        
    } catch (error) {
        console.error(`❌ Falha em: ${suite.name}`);
        console.error(`Erro: ${error.message}\n`);
        console.log('=' .repeat(60) + '\n');
        
        return { success: false, error: error.message, suite: suite.name };
    }
}

// Função principal
async function runAllTests() {
    console.log('🔥 Iniciando execução de todos os testes de integração...\n');
    
    const results = [];
    let totalDuration = 0;
    const overallStartTime = Date.now();
    
    // Executar cada conjunto de testes sequencialmente
    for (const suite of testSuites) {
        const result = await runTestSuite(suite);
        results.push(result);
        
        if (result.success) {
            totalDuration += result.duration;
        }
        
        // Pequena pausa entre os testes para limpeza
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const overallEndTime = Date.now();
    const overallDuration = overallEndTime - overallStartTime;
    
    // Relatório final
    console.log('📊 RELATÓRIO FINAL DOS TESTES DE INTEGRAÇÃO');
    console.log('=' .repeat(60));
    
    let successCount = 0;
    let failureCount = 0;
    
    results.forEach((result, index) => {
        const status = result.success ? '✅ PASSOU' : '❌ FALHOU';
        const duration = result.success ? `(${result.duration}ms)` : '';
        
        console.log(`${index + 1}. ${result.suite}: ${status} ${duration}`);
        
        if (result.success) {
            successCount++;
        } else {
            failureCount++;
            console.log(`   Erro: ${result.error}`);
        }
    });
    
    console.log('\n' + '=' .repeat(60));
    console.log(`📈 ESTATÍSTICAS:`);
    console.log(`   Total de conjuntos: ${results.length}`);
    console.log(`   Sucessos: ${successCount}`);
    console.log(`   Falhas: ${failureCount}`);
    console.log(`   Taxa de sucesso: ${((successCount / results.length) * 100).toFixed(1)}%`);
    console.log(`   Tempo total: ${overallDuration}ms (${(overallDuration / 1000).toFixed(2)}s)`);
    
    if (failureCount === 0) {
        console.log('\n🎉 TODOS OS TESTES DE INTEGRAÇÃO PASSARAM!');
        console.log('🚀 Sistema está funcionando corretamente!');
    } else {
        console.log(`\n⚠️  ${failureCount} conjunto(s) de teste falharam.`);
        console.log('🔧 Verifique os erros acima e corrija antes de prosseguir.');
    }
    
    console.log('\n' + '=' .repeat(60));
    
    // Exit code baseado no resultado
    process.exit(failureCount > 0 ? 1 : 0);
}

// Função para executar apenas um conjunto específico
async function runSpecificTest(testName) {
    const suite = testSuites.find(s => 
        s.name.toLowerCase().includes(testName.toLowerCase()) ||
        s.file.includes(testName)
    );
    
    if (!suite) {
        console.error(`❌ Conjunto de teste não encontrado: ${testName}`);
        console.log('\nConjuntos disponíveis:');
        testSuites.forEach((s, i) => {
            console.log(`${i + 1}. ${s.name} (${s.file})`);
        });
        process.exit(1);
    }
    
    console.log(`🎯 Executando conjunto específico: ${suite.name}\n`);
    const result = await runTestSuite(suite);
    
    if (result.success) {
        console.log('🎉 Teste específico passou!');
        process.exit(0);
    } else {
        console.log('❌ Teste específico falhou!');
        process.exit(1);
    }
}

// Função para mostrar ajuda
function showHelp() {
    console.log('🔧 USO DO SCRIPT DE TESTES');
    console.log('=' .repeat(40));
    console.log('node run-poku-tests.mjs [comando] [opções]\n');
    
    console.log('Comandos:');
    console.log('  (nenhum)     Executa todos os testes');
    console.log('  --help       Mostra esta ajuda');
    console.log('  --list       Lista todos os conjuntos de teste');
    console.log('  --run <nome> Executa conjunto específico\n');
    
    console.log('Exemplos:');
    console.log('  node run-poku-tests.mjs');
    console.log('  node run-poku-tests.mjs --run sistema');
    console.log('  node run-poku-tests.mjs --run api');
    console.log('  node run-poku-tests.mjs --run validation\n');
}

// Função para listar conjuntos de teste
function listTestSuites() {
    console.log('📋 CONJUNTOS DE TESTE DISPONÍVEIS');
    console.log('=' .repeat(40));
    
    testSuites.forEach((suite, index) => {
        console.log(`${index + 1}. ${suite.name}`);
        console.log(`   📁 ${suite.file}`);
        console.log(`   📝 ${suite.description}\n`);
    });
}

// Verificação de pré-requisitos
async function checkPrerequisites() {
    console.log('🔍 Verificando pré-requisitos...');
    
    try {
        // Verificar se o poku está instalado
        await execAsync('npx poku --version');
        console.log('✅ Poku encontrado');
        
        // Verificar se o banco está configurado
        if (!process.env.DATABASE_URL) {
            console.warn('⚠️  DATABASE_URL não encontrada - alguns testes podem falhar');
        } else {
            console.log('✅ DATABASE_URL configurada');
        }
        
        console.log('✅ Pré-requisitos verificados\n');
        return true;
        
    } catch (error) {
        console.error('❌ Pré-requisitos não atendidos:');
        console.error(`   ${error.message}`);
        console.error('\n💡 Instale as dependências com: npm install');
        return false;
    }
}

// Processamento dos argumentos da linha de comando
async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        showHelp();
        return;
    }
    
    if (args.includes('--list') || args.includes('-l')) {
        listTestSuites();
        return;
    }
    
    // Verificar pré-requisitos
    const prereqsOk = await checkPrerequisites();
    if (!prereqsOk) {
        process.exit(1);
    }
    
    if (args.includes('--run') || args.includes('-r')) {
        const testNameIndex = Math.max(args.indexOf('--run'), args.indexOf('-r')) + 1;
        const testName = args[testNameIndex];
        
        if (!testName) {
            console.error('❌ Nome do teste não especificado');
            showHelp();
            process.exit(1);
        }
        
        await runSpecificTest(testName);
    } else {
        // Executar todos os testes
        await runAllTests();
    }
}

// Executar função principal
main().catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
});
