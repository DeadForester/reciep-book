import axios from "axios"
import type { Recipe, RecipeRequest, PageResponse } from "../types/recipe.ts"

const api = axios.create({
    baseURL: "http://localhost:8080/api/"
})

export const recipeService = {

    async getAll(page = 0, size = 10) {
        const { data } = await api.get<PageResponse<Recipe>>(
            `/recipes?page=${page}&size=${size}`
        )
        return data
    },

    async getById(id: string) {
        const { data } = await api.get<Recipe>(`/recipes/${id}`)
        return data
    },

    async create(recipe: RecipeRequest) {
        const { data } = await api.post<Recipe>("/recipes", recipe)
        return data
    },

    async update(id: string, recipe: RecipeRequest) {
        const { data } = await api.put<Recipe>(`/recipes/${id}`, recipe)
        return data
    },

    async delete(id: string) {
        await api.delete(`/recipes/${id}`)
    },

    async uploadImage(id: string, file: File) {
        const formData = new FormData()
        formData.append("file", file)

        const { data } = await api.post<Recipe>(
            `/recipes/${id}/image`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
        )

        return data
    }
}