import { eq } from "drizzle-orm";
import { db } from "../db/drizzle";
import { clients } from "../db/schema";
import type {
    CreateClientData,
    ClientData,
    UpdateClientData,
} from "./types/clientTypes";

export class ClientModel {
    public id?: string;
    public name: string;
    public phone_number: string;
    public updated_at?: string;
    public created_at?: string;

    constructor(data: CreateClientData | ClientData) {
        // Validação básica
        if (!data.name || data.name.trim().length === 0) {
            throw new Error("Client name is required");
        }
        
        if (!data.phone_number || !this.validatePhoneNumber(data.phone_number)) {
            throw new Error("Valid phone number is required");
        }

        if ("id" in data) {
            this.id = data.id;
            this.created_at = data.created_at?.toISOString?.() 
            this.updated_at = data.updated_at?.toISOString?.() 
        }
        
        this.name = data.name.substring(0, 255); // Limitar tamanho
        this.phone_number = this.formatPhoneNumber(data.phone_number);
    }

    private validatePhoneNumber(phone: string): boolean {
        // Remove todos caracteres não numéricos
        const cleanPhone = phone.replace(/\D/g, '');
        // Verifica se o telefone tem entre 10 e 11 dígitos (padrão brasileiro)
        return cleanPhone.length >= 10 && cleanPhone.length <= 11;
    }

    private formatPhoneNumber(phone: string): string {
        // Normaliza o formato do telefone
        return phone.replace(/\D/g, '').substring(0, 14);
    }

    async create(): Promise<ClientData> {
        try {
            const [result] = await db
                .insert(clients)
                .values({
                    name: this.name,
                    phone_number: this.phone_number,
                })
                .returning();

            this.id = result?.id;
            this.created_at = result?.created_at?.toISOString?.() 
            this.updated_at = result?.updated_at?.toISOString?.() 

            return this as ClientData;
        } catch (error) {
            console.error("Error creating client:", error);
            throw new Error("Failed to create client");
        }
    }

    static async findById(id: string): Promise<ClientData | null> {
        try {
            // Validação básica de UUID
            if (!id || typeof id !== 'string') {
                throw new Error("Valid client ID is required");
            }

            const [result] = await db
                .select()
                .from(clients)
                .where(eq(clients.id, id))
                .limit(1);
            if (!result) {
                return null;
            }
            return result as ClientData;
        } catch (error) {
            console.error("Error finding client by ID:", error);
            throw new Error("Failed to find client");
        }
    }

    static async findByPhoneNumber(
        phone_number: string,
    ): Promise<ClientData | null> {
        try {
            // Normaliza o telefone para busca
            const normalizedPhone = phone_number.replace(/\D/g, '');
            
            if (normalizedPhone.length < 10) {
                throw new Error("Phone number too short");
            }

            const [result] = await db
                .select()
                .from(clients)
                .where(eq(clients.phone_number, normalizedPhone))
                .limit(1);
            if (!result) {
                return null;
            }
            return result as ClientData;
        } catch (error) {
            console.error("Error finding client by phone number:", error);
            throw new Error("Failed to find client");
        }
    }

    static async findAll(): Promise<ClientData[]> {
        try {
            const results = await db.select().from(clients);
            return results as ClientData[];
        } catch (error) {
            console.error("Error finding clients", error);
            throw new Error("Failed to find clients");
        }
    }

    async update(data: UpdateClientData): Promise<ClientData> {
        try {
            if (!this.id) {
                throw new Error("Client ID is required for update");
            }
            
            // Validações para campos de update
            if (data.name && data.name.trim().length === 0) {
                throw new Error("Client name cannot be empty");
            }
            
            if (data.phone_number && !this.validatePhoneNumber(data.phone_number)) {
                throw new Error("Valid phone number is required");
            }

            const updateData: Partial<{name: string, phone_number: string}> = {};
            
            if (data.name) updateData.name = data.name.substring(0, 255);
            if (data.phone_number) updateData.phone_number = this.formatPhoneNumber(data.phone_number);

            const [result] = await db
                .update(clients)
                .set(updateData)
                .where(eq(clients.id, this.id))
                .returning();
                
            if (result) {
                this.name = result.name;
                this.phone_number = result.phone_number;
                this.updated_at = result?.updated_at?.toISOString?.() 
            }
            return this as ClientData;
        } catch (error) {
            console.error("Error updating client:", error);
            throw new Error("Failed to update client");
        }
    }

    static async delete(id: string): Promise<boolean> {
        try {
            if (!id) {
                throw new Error("Client ID is required for deletion");
            }
            
            const result = await db.delete(clients).where(eq(clients.id, id));
            return result.rowCount > 0;
        } catch (error) {
            console.error("Error deleting client:", error);
            throw new Error("Failed to delete client");
        }
    }
}