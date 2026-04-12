import axios from "axios"
import type { Recipe, RecipeRequest, PageResponse } from "../types/recipe"

const api = axios.create({
    baseURL: "/api"
})

export const recipeService = {

    async getAll(page = 0, size = 10) {
        try {
            const { data } = await api.get<PageResponse<Recipe>>(
                `/recipes?page=${page}&size=${size}`
            )
            return data
        } catch (error) {
            console.error("Failed to fetch recipes:", error)
            throw error
        }
    },

    async getById(id: string) {
        try {
            const { data } = await api.get<Recipe>(`/recipes/${id}`)
            return data
        } catch (error) {
            console.error(`Failed to fetch recipe ${id}:`, error)
            throw error
        }
    },

    async create(recipe: RecipeRequest) {
        try {
            const { data } = await api.post<Recipe>("/recipes", recipe)
            return data
        } catch (error) {
            console.error("Failed to create recipe:", error)
            throw error
        }
    },

    async update(id: string, recipe: RecipeRequest) {
        try {
            const { data } = await api.put<Recipe>(`/recipes/${id}`, recipe)
            return data
        } catch (error) {
            console.error(`Failed to update recipe ${id}:`, error)
            throw error
        }
    },

    async delete(id: string) {
        try {
            await api.delete(`/recipes/${id}`)
        } catch (error) {
            console.error(`Failed to delete recipe ${id}:`, error)
            throw error
        }
    },

    async uploadImage(id: string, file: File) {
        try {
            const formData = new FormData()
            formData.append("file", file)

            const { data } = await api.post<Recipe>(
                `/recipes/${id}/image`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            )

            return data
        } catch (error) {
            console.error(`Failed to upload image for recipe ${id}:`, error)
            throw error
        }
    }
}