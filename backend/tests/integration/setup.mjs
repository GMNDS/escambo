import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { clients, users, tabs, payments } from '../../src/db/schema.js';

// Carregar variáveis de ambiente
config({ path: '.env' });

// Mock do banco para testes de integração
let mockDb = null;

export function getMockDb() {
    if (!mockDb) {
        const database_url = process.env.DATABASE_URL;
        if (!database_url) {
            throw new Error("DATABASE_URL não encontrada - necessária para testes de integração");
        }
        mockDb = drizzle(database_url);
    }
    return mockDb;
}

// Função para limpar dados de teste
export async function cleanTestData() {
    const db = getMockDb();
    try {
        // Limpar em ordem devido às foreign keys
        await db.delete(payments);
        await db.delete(tabs);
        await db.delete(clients);
        await db.delete(users);
        console.log('✅ Dados de teste limpos');
    } catch (error) {
        console.warn('⚠️  Erro ao limpar dados de teste:', error.message);
    }
}

// Função para criar dados de teste base
export async function seedTestData() {
    const db = getMockDb();
    
    try {
        // Criar usuário de teste
        const [testUser] = await db.insert(users).values({
            username: 'test_user',
            password: 'test_password'
        }).returning();

        // Criar cliente de teste
        const [testClient] = await db.insert(clients).values({
            name: 'Cliente Teste',
            phone_number: '11999887766'
        }).returning();

        // Criar tab de teste
        const [testTab] = await db.insert(tabs).values({
            client_id: testClient.id,
            created_by: testUser.id,
            description: 'Tab de teste',
            value: '100.00',
            status: 'unpaid'
        }).returning();

        console.log('✅ Dados de teste criados');
        
        return {
            testUser,
            testClient,
            testTab
        };
    } catch (error) {
        console.error('❌ Erro ao criar dados de teste:', error);
        throw error;
    }
}

// Helpers para validação
export function validateUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}

export function validateDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !Number.isNaN(date.getTime());
}

export function validatePhoneNumber(phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
}

// Configuração global para testes
export const testConfig = {
    timeout: 5000,
    retries: 2,
    cleanup: true
};

console.log('🔧 Setup de testes de integração carregado');
