import axios from "axios";
import { CreateWishInput, UpdateWishInput, Wish } from "../types/wish.types";

const API_BASE_URL = `${
    process.env.REACT_APP_API_URL || "http://localhost:8000"
}/api`;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export const wishAPI = {
    getAllWishes: async (): Promise<Wish[]> => {
        const response = await api.get<Wish[]>("/wishes");
        return response.data;
    },

    getWishById: async (id: number): Promise<Wish> => {
        const response = await api.get<Wish>(`/wishes/${id}`);
        return response.data;
    },

    createWish: async (wish: CreateWishInput): Promise<Wish> => {
        const response = await api.post<Wish>("/wishes", wish);
        return response.data;
    },

    updateWish: async (id: number, wish: UpdateWishInput): Promise<Wish> => {
        const response = await api.put<Wish>(`/wishes/${id}`, wish);
        return response.data;
    },

    deleteWish: async (id: number): Promise<void> => {
        await api.delete(`/wishes/${id}`);
    },
};

export default api;
