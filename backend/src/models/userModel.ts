import { eq } from "drizzle-orm";
import { db } from "../db/drizzle";
import { users } from "../db/schema";
import type {
	CreateUserData,
	UserData,
	UpdateUserData,
} from "./types/userTypes";
import bcrypt from "bcrypt";

export class UserModel {
	public id?: string;
	public username: string;
	public password: string;
	// public updated_at?: string;
	public created_at?: string;

	constructor(data: CreateUserData | UserData) {
		if ("id" in data) {
			this.id = data.id;
			this.created_at = data.created_at?.toISOString();
			// this.updated_at = data.updated_at?.toISOString();
		}
		this.username = data.username;
		this.password = data.password;
	}

	async create(): Promise<UserData> {
		try {
			// Gera hash da senha antes de salvar
			const hashedPassword = await bcrypt.hash(this.password, 10);
			const [result] = await db
				.insert(users)
				.values({
					username: this.username,
					password: hashedPassword,
				})
				.returning();

			this.id = result?.id;
			this.created_at = result?.created_at?.toISOString();
			// this.updated_at = result?.updated_at?.toISOString();

			return this as UserData;
		} catch (error) {
			console.error("Error creating user:", error);
			throw new Error("Failed to create user");
		}
	}

	static async findById(id: string): Promise<UserData | null> {
		try {
			const [result] = await db
				.select()
				.from(users)
				.where(eq(users.id, id))
				.limit(1);
			if (!result) {
				return null;
			}
			return result as UserData;
		} catch (error) {
			console.error("Error finding user by ID:", error);
			throw new Error("Failed to find user");
		}
	}

	static async findAll(): Promise<UserData[]> {
		try {
			const results = await db.select().from(users);
			return results as UserData[];
		} catch (error) {
			console.error("Error, finding users", error);
			throw new Error("Failed to find users");
		}
	}

	async update(data: UpdateUserData): Promise<UserData> {
		try {
			if (!this.id) {
				throw new Error("User ID is required for update");
			}
			let newPassword = this.password;
			if (data.password && data.password !== this.password) {
				newPassword = await bcrypt.hash(data.password, 10);
			}
			const [result] = await db
				.update(users)
				.set({
					username: data.username,
					password: newPassword,
				})
				.where(eq(users.id, this.id))
				.returning();
			if (result) {
				this.username = result.username;
				this.password = result.password;
				// this.updated_at = result?.updated_at?.toISOString();
			}
			return this as UserData;
		} catch (error) {
			console.error("Error updating user:", error);
			throw new Error("Failed to update user");
		}
	}

	static async delete(id: string): Promise<boolean> {
		try {
			const result = await db.delete(users).where(eq(users.id, id));
			return result.rowCount > 0;
		} catch (error) {
			console.error("Error deleting user:", error);
			throw new Error("Failed to delete user");
		}
	}

	static async findByUsername(username: string): Promise<UserData | null> {
		try {
			const [result] = await db
				.select()
				.from(users)
				.where(eq(users.username, username))
				.limit(1);
			if (!result) {
				return null;
			}
			return result as UserData;
		} catch (error) {
			console.error("Error finding user by username:", error);
			throw new Error("Failed to find user by username");
		}
	}
}
