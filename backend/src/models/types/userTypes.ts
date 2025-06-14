interface BaseUserData {
    username: string,
    password: string,
}

export interface CreateUserData extends BaseUserData {};

export interface UpdateUserData extends Partial<BaseUserData> {
    id: string,
}; // Partial vai fazer com que todos campos sejam opcionais

export interface UserData extends BaseUserData {
    id?: string,
    created_at?: Date,
}