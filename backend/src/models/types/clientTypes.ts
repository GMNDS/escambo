/*
export interface CreateClientData {
    name: string,
    phone_number: string,
}

export interface UpdateClientData {
    name?: string,
    phone_number?: string
}

export interface ClientData {
    id?: string,
    name: string,
    phone_number: string,
    created_at?: Date,
    updated_at?: Date
}
*/

interface BaseClientData {
    name: string,
    phone_number: string,
}

export interface CreateClientData extends BaseClientData {};

export interface UpdateClientData extends Partial<BaseClientData> {
    id: string,
}; // Partial vai fazer com que todos campos sejam opcionais

export interface ClientData extends BaseClientData {
    id?: string,
    created_at?: Date,
    updated_at?: Date
}