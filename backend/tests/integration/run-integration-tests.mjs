#!/usr/bin/env node

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Executando Suite Completa de Testes de Integração');
console.log('=' .repeat(60));

// Lista dos arquivos de teste de integração
const integrationTests = [
    'setup.mjs', // Não é um teste, mas vamos verificar se existe
    'clientModel.integration.test.mjs',
    'clientAPI.integration.test.mjs', 
    'system.integration.test.mjs',
    'fullAPI.integration.test.mjs'
];

// Função para executar um teste específico
async function runTest(testFile) {
    const testPath = path.join(__dirname, testFile);
    console.log(`\n🧪 Executando: ${testFile}`);
    console.log('-'.repeat(50));
    
    try {
        const startTime = Date.now();
        const { stdout, stderr } = await execAsync(`node --experimental-modules ${testPath}`, {
            cwd: path.join(__dirname, '../..'),
            env: { ...process.env, NODE_ENV: 'test' }
        });
        const duration = Date.now() - startTime;
        
        if (stdout) {
            console.log(stdout);
        }
        if (stderr) {
            console.warn('⚠️  Warnings:', stderr);
        }
        
        console.log(`✅ ${testFile} concluído em ${duration}ms`);
        return { success: true, duration, file: testFile };
    } catch (error) {
        console.error(`❌ ${testFile} falhou:`);
        console.error(error.stdout || error.message);
        if (error.stderr) {
            console.error('Stderr:', error.stderr);
        }
        return { success: false, duration: 0, file: testFile, error: error.message };
    }
}

// Função principal
async function runIntegrationTests() {
    const results = [];
    const startTime = Date.now();
    
    console.log(`🔍 Verificando ${integrationTests.length} arquivos de teste...`);
    
    // Pular setup.mjs pois não é um teste executável
    const actualTests = integrationTests.filter(file => file !== 'setup.mjs');
    
    for (const testFile of actualTests) {
        const result = await runTest(testFile);
        results.push(result);
        
        // Pausa entre testes para evitar problemas de concorrência
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const totalDuration = Date.now() - startTime;
    
    // Relatório final
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 RELATÓRIO FINAL DOS TESTES DE INTEGRAÇÃO');
    console.log('='.repeat(60));
    
    const passed = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`\n✅ Testes Passaram: ${passed.length}`);
    for (const test of passed) {
        console.log(`   - ${test.file} (${test.duration}ms)`);
    }
    
    if (failed.length > 0) {
        console.log(`\n❌ Testes Falharam: ${failed.length}`);
        for (const test of failed) {
            console.log(`   - ${test.file}: ${test.error}`);
        }
    }
    
    console.log(`\n⏱️  Tempo Total: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log(`📈 Taxa de Sucesso: ${((passed.length / results.length) * 100).toFixed(1)}%`);
    
    if (failed.length === 0) {
        console.log('\n🎉 TODOS OS TESTES DE INTEGRAÇÃO PASSARAM! 🎉');
        process.exit(0);
    } else {
        console.log('\n💥 ALGUNS TESTES FALHARAM');
        process.exit(1);
    }
}

// Executar apenas se for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    runIntegrationTests().catch(error => {
        console.error('💥 Erro fatal na execução dos testes:', error);
        process.exit(1);
    });
}

export { runIntegrationTests };
