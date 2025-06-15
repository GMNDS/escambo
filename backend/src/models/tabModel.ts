import { eq } from "drizzle-orm";
import { db } from "../db/drizzle";
import { tabs } from "../db/schema";
import type {
    CreateTabData,
    TabData,
    UpdateTabData,
} from "./types/tabTypes";

export class TabModel {
    public id?: string;
    public client_id: string | null;
    public description: string;
    public value: string;
    public status: "unpaid" | "paid" | "partial";
    public created_by: string | null;
    public created_at?: string;
    public updated_at?: string;

    constructor(data: CreateTabData | TabData) {
        if (!data.description || data.description.trim().length === 0) {
            throw new Error("Description is required");
        }
        if (!data.value || isNaN(Number(data.value))) {
            throw new Error("Valid value is required");
        }
        if (!data.status) {
            throw new Error("Status is required");
        }

        if ("id" in data) {
            this.id = data.id;
            this.created_at = data.created_at instanceof Date
                ? data.created_at.toISOString()
                : data.created_at;
            this.updated_at = data.updated_at instanceof Date
                ? data.updated_at.toISOString()
                : data.updated_at;
        }

        this.client_id = data.client_id ?? null;
        this.description = data.description.substring(0, 255);
        this.value = data.value;
        this.status = data.status as "unpaid" | "paid" | "partial";
        this.created_by = data.created_by ?? null;
    }

    async create(): Promise<TabData> {
        try {
            const [result] = await db
                .insert(tabs)
                .values({
                    client_id: this.client_id,
                    description: this.description,
                    value: this.value,
                    status: this.status,
                    created_by: this.created_by,
                })
                .returning();

            this.id = result?.id;
            this.created_at = result?.created_at?.toISOString?.();
            this.updated_at = result?.updated_at?.toISOString?.();

            return this as TabData;
        } catch (error) {
            console.error("Error creating tab:", error);
            throw new Error("Failed to create tab");
        }
    }

    static async findById(id: string): Promise<TabData | null> {
        try {
            if (!id || typeof id !== "string") {
                throw new Error("Valid tab ID is required");
            }
            const [result] = await db
                .select()
                .from(tabs)
                .where(eq(tabs.id, id))
                .limit(1);
            if (!result) {
                return null;
            }
            return {
                ...result,
                description: result.description ?? "",
                value: result.value ?? "",
            } as TabData;
        } catch (error) {
            console.error("Error finding tab by ID:", error);
            throw new Error("Failed to find tab");
        }
    }

    static async findAll(): Promise<TabData[]> {
        try {
            const results = await db.select().from(tabs);
            return results.map(result => ({
                ...result,
                description: result.description ?? "",
                value: result.value ?? "",
            })) as TabData[];
        } catch (error) {
            console.error("Error finding tabs", error);
            throw new Error("Failed to find tabs");
        }
    }

    async update(data: UpdateTabData): Promise<TabData> {
        try {
            if (!this.id) {
                throw new Error("Tab ID is required for update");
            }

            const updateData: Partial<{
                client_id: string | null;
                description: string;
                value: string;
                status: "unpaid" | "paid" | "partial";
                created_by: string | null;
            }> = {};

            if (data.client_id !== undefined) updateData.client_id = data.client_id;
            if (data.description) updateData.description = data.description.substring(0, 255);
            if (data.value) updateData.value = data.value;
            if (data.status) updateData.status = data.status as "unpaid" | "paid" | "partial";
            if (data.created_by !== undefined) updateData.created_by = data.created_by;

            const [result] = await db
                .update(tabs)
                .set(updateData)
                .where(eq(tabs.id, this.id))
                .returning();

            if (result) {
                this.client_id = result.client_id;
                this.description = result.description ?? "";
                this.value = result.value ?? "";
                this.status = result.status;
                this.created_by = result.created_by;
                this.updated_at = result?.updated_at?.toISOString?.();
            }
            return this as TabData;
        } catch (error) {
            console.error("Error updating tab:", error);
            throw new Error("Failed to update tab");
        }
    }

    static async delete(id: string): Promise<boolean> {
        try {
            if (!id) {
                throw new Error("Tab ID is required for deletion");
            }
            const result = await db.delete(tabs).where(eq(tabs.id, id));
            return result.rowCount > 0;
        } catch (error) {
            console.error("Error deleting tab:", error);
            throw new Error("Failed to delete tab");
        }
    }
}