import { render, screen } from "@testing-library/vue"
import { describe, it, expect, vi } from "vitest"
import RecipeForm from "@/views/RecipeForm.vue"
import { createRouter, createMemoryHistory } from "vue-router"

vi.mock("@/services/recipeService", () => ({
    recipeService: {
        create: vi.fn(() => Promise.resolve({ id: "1" })),
        update: vi.fn(() => Promise.resolve({ id: "1" })),
        getById: vi.fn(),
        uploadImage: vi.fn(),
    },
}))

const router = createRouter({
    history: createMemoryHistory(),
    routes: [
        { path: "/create", component: RecipeForm },
        { path: "/edit/:id", component: RecipeForm },
    ],
})

describe("RecipeForm", () => {
    it("renders create form correctly", async () => {
        router.push("/create")
        await router.isReady()

        render(RecipeForm, {
            global: {
                plugins: [router],
            },
        })

        expect(
            screen.getByText("Создать рецепт")
        ).toBeInTheDocument()

        expect(
            screen.getByPlaceholderText("Название рецепта")
        ).toBeInTheDocument()

        expect(
            screen.getByText("+ Добавить ингредиенты")
        ).toBeInTheDocument()
    })
})