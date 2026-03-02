import { render, screen } from "@testing-library/vue"
import { describe, it, expect, vi } from "vitest"
import RecipeList from '@views/RecipeList.vue'
import { createRouter, createWebHistory } from 'vue-router'

vi.mock('@services/recipeService', () => ({
    recipeService: {
        getAll: vi.fn(() => Promise.resolve({
            content: [
                { id: '1', title: 'Pizza', description: 'Cheese', ingredients: ["Cheese"] }
            ],
            totalPages: 1,
            totalElements: 1
        }))
    }
}))

const router = createRouter({
    history: createWebHistory(),
    routes: [{ path: '/', component: RecipeList }]
})

describe("RecipeList", () => {
    it("renders recipes from API", async () => {
        render(RecipeList, { global: { plugins: [router] } })
        await router.isReady()

        expect(await screen.findByText("Pizza")).toBeInTheDocument()
        expect(await screen.findByText("Cheese")).toBeInTheDocument()
    })
})