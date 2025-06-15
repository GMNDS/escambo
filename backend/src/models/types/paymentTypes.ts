interface BasePaymentData {
    tab_id: string;
    value: string;
}

export interface CreatePaymentData extends BasePaymentData {}

export interface UpdatePaymentData extends Partial<BasePaymentData> {
    id: string;
}

export interface PaymentData extends BasePaymentData {
    id?: string;
    created_at?: Date;
}