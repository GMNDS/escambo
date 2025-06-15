interface BaseTabData {
    client_id: string | null;
    description: string;
    value: string;
    created_by: string | null;
}

export interface CreateTabData extends BaseTabData {}

export interface UpdateTabData extends Partial<BaseTabData> {
    id: string;
    status?: "unpaid" | "paid" | "partial";
}

export interface TabData extends BaseTabData {
    id?: string;
    created_at?: Date;
    updated_at?: Date;
    status?: "unpaid" | "paid" | "partial";
}