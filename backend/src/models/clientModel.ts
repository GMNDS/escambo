import { eq } from "drizzle-orm";
import { db } from "../db/drizzle";
import { clients } from "../db/schema";
import type {
	CreateClientData,
	ClientData,
	UpdateClientData,
} from "./types/clientTypes";
import { Client } from "@neondatabase/serverless";

export class ClientModel {
	public id?: string;
	public name: string;
	public phone_number: string;
	public updated_at?: string;
	public created_at?: string;

	constructor(data: CreateClientData | ClientData) {
		if ("id" in data) {
			this.id = data.id;
			this.created_at = data.created_at?.toISOString();
			this.updated_at = data.updated_at?.toISOString();
		}
		this.name = data.name;
		this.phone_number = data.phone_number;
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
			this.created_at = result?.created_at?.toISOString();
			this.updated_at = result?.updated_at?.toISOString();

			return this as ClientData;
		} catch (error) {
			console.error("Error creating client:", error);
			throw new Error("Failed to create client");
		}
	}

	static async findById(id: string): Promise<ClientData | null> {
		try {
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
			const [result] = await db
				.select()
				.from(clients)
				.where(eq(clients.phone_number, phone_number))
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
			console.error("Error, finding clients", error);
			throw new Error("Failed to find clients");
		}
	}

	async update(data: UpdateClientData): Promise<ClientData> {
		try {
			if (!this.id) {
				throw new Error("Client ID is required for update");
			}
			const [result] = await db
				.update(clients)
				.set({
					name: data.name,
					phone_number: data.phone_number,
				})
				.where(eq(clients.id, this.id))
				.returning();
			if (result) {
				this.name = result.name;
				this.phone_number = result.phone_number;
				this.updated_at = result?.updated_at?.toISOString();
			}
			return this as ClientData;
		} catch (error) {
			console.error("Error updating client:", error);
			throw new Error("Failed to update client");
		}
	}

	static async delete(id: string): Promise<boolean> {
		try {
			const result = await db.delete(clients).where(eq(clients.id, id));
			return result.rowCount > 0;
		} catch (error) {
			console.error("Error deleting client:", error);
			throw new Error("Failed to delete client");
		}
	}
}
