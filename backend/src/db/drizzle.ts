import {config} from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';

config({path: ".env"});
const dabase_url = process.env.DATABASE_URL;

if(!dabase_url) {
    throw new Error("Falhou o env aqui meu parceiro");
}

export const db = drizzle(dabase_url);
