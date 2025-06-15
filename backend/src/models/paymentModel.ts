import { eq } from "drizzle-orm";
import { db } from "../db/drizzle";
import { payments } from "../db/schema";
import type {
    CreatePaymentData,
    PaymentData,
    UpdatePaymentData,
} from "./types/paymentTypes";

export class PaymentModel {
    public id?: string;
    public tab_id: string;
    public value: string;
    public description?: string;
    public created_at?: string;

    constructor(data: CreatePaymentData | PaymentData) {
        if (!data.tab_id || typeof data.tab_id !== "string") {
            throw new Error("tab_id is required");
        }
        if (typeof data.value !== "string" || isNaN(Number(data.value))) {
            throw new Error("Valid value is required");
        }
        if ("id" in data) {
            this.id = data.id;
            this.created_at = data.created_at instanceof Date
                ? data.created_at.toISOString()
                : data.created_at;
        }
        this.tab_id = data.tab_id;
        this.value = data.value;
        this.description = data.description;
    }

    async create(): Promise<PaymentData> {
        try {
            const [result] = await db
                .insert(payments)
                .values({
                    tab_id: this.tab_id,
                    value: this.value,
                    description: this.description,
                })
                .returning();

            this.id = result?.id;
            this.created_at = result?.created_at?.toISOString?.();

            return this as PaymentData;
        } catch (error) {
            console.error("Error creating payment:", error);
            throw new Error("Failed to create payment");
        }
    }

    static async findById(id: string): Promise<PaymentData | null> {
        try {
            if (!id || typeof id !== "string") {
                throw new Error("Valid payment ID is required");
            }
            const [result] = await db
                .select()
                .from(payments)
                .where(eq(payments.id, id))
                .limit(1);
            if (!result) {
                return null;
            }
            return {
                ...result,
                value: result.value ?? "0",
                description: result.description ?? undefined
            } as PaymentData;
        } catch (error) {
            console.error("Error finding payment by ID:", error);
            throw new Error("Failed to find payment");
        }
    }

    static async findAll(): Promise<PaymentData[]> {
        try {
            const results = await db.select().from(payments);
            return results.map(result => ({
                ...result,
                value: result.value ?? "0",
                description: result.description ?? undefined
            })) as PaymentData[];
        } catch (error) {
            console.error("Error finding payments", error);
            throw new Error("Failed to find payments");
        }
    }

    async update(data: UpdatePaymentData): Promise<PaymentData> {
        try {
            if (!this.id) {
                throw new Error("Payment ID is required for update");
            }
            const updateData: Partial<{ tab_id: string; value: string; description: string }> = {};
            if (data.tab_id) updateData.tab_id = data.tab_id;
            if (typeof data.value === "string") updateData.value = data.value;
            if (data.description !== undefined) updateData.description = data.description;

            const [result] = await db
                .update(payments)
                .set(updateData)
                .where(eq(payments.id, this.id))
                .returning();

            if (result) {
                this.tab_id = result.tab_id ?? "";
                this.value = result.value ?? "0";
                this.description = result.description ?? undefined;
                this.created_at = result?.created_at?.toISOString?.();
            }
            return this as PaymentData;
        } catch (error) {
            console.error("Error updating payment:", error);
            throw new Error("Failed to update payment");
        }
    }

    static async delete(id: string): Promise<boolean> {
        try {
            if (!id) {
                throw new Error("Payment ID is required for deletion");
            }
            const result = await db.delete(payments).where(eq(payments.id, id));
            return result.rowCount > 0;
        } catch (error) {
            console.error("Error deleting payment:", error);
            throw new Error("Failed to delete payment");
        }
    }

    static async findByTabId(tabId: string): Promise<PaymentData[]> {
        try {
            if (!tabId || typeof tabId !== "string") {
                throw new Error("Valid tab ID is required");
            }
            const results = await db
                .select()
                .from(payments)
                .where(eq(payments.tab_id, tabId));
                
            return results.map(result => ({
                ...result,
                value: result.value ?? "0",
                description: result.description ?? undefined
            })) as PaymentData[];
        } catch (error) {
            console.error("Error finding payments by tab ID:", error);
            throw new Error("Failed to find payments by tab ID");
        }
    }

    static async getTotalPaidByTabId(tabId: string): Promise<number> {
        try {
            const payments = await this.findByTabId(tabId);
            return payments.reduce((total, payment) => total + Number(payment.value), 0);
        } catch (error) {
            console.error("Error calculating total paid:", error);
            throw new Error("Failed to calculate total paid amount");
        }
    }
}