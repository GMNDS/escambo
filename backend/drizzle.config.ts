import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({path: ".env"});
const dabase_url = process.env.DATABASE_URL;
if(!dabase_url) {
    throw new Error("Falhou o env aqui meu parceiro");
}

export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: dabase_url,
    }
})
