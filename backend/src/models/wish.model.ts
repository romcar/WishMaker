export interface Wish {
    id: number;
    title: string;
    description?: string;
    user_id: number;
    created_at: Date;
    updated_at: Date;
    status: "pending" | "fulfilled" | "cancelled";
}

export interface CreateWishInput {
    title: string;
    description?: string;
    user_id: number;
}

export interface UpdateWishInput {
    title?: string;
    description?: string;
    status?: "pending" | "fulfilled" | "cancelled";
}
