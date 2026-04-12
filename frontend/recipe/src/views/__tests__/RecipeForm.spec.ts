import { render, screen } from "@testing-library/vue"
import { describe, it, expect, vi, beforeEach } from "vitest"
import RecipeForm from "@/views/RecipeForm.vue"
import { createRouter, createMemoryHistory } from "vue-router"

vi.mock("@/services/recipeService", () => ({
    recipeService: {
        create: vi.fn(() => Promise.resolve({ id: "1" })),
        update: vi.fn(() => Promise.resolve({ id: "1" })),
        getById: vi.fn(() => Promise.resolve({
            id: "1",
            title: "Existing Recipe",
            description: "Existing description",
            ingredients: ["Ingredient 1", "Ingredient 2"],
            steps: ["Step 1", "Step 2"],
            cookingTimeMinutes: 30,
            difficulty: "MEDIUM",
            imageUrl: ""
        })),
        uploadImage: vi.fn()
    }
}))

const router = createRouter({
    history: createMemoryHistory(),
    routes: [
        { path: "/create", component: RecipeForm },
        { path: "/edit/:id", component: RecipeForm }
    ]
})

describe("RecipeForm", () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it("renders create form correctly", async () => {
        router.push("/create")
        await router.isReady()

        render(RecipeForm, {
            global: {
                plugins: [router]
            }
        })

        expect(
            screen.getByRole("heading", { name: /создать рецепт/i })
        ).toBeInTheDocument()

        expect(
            screen.getByPlaceholderText("Название рецепта")
        ).toBeInTheDocument()

        expect(
            screen.getByText("+ Добавить ингредиент")
        ).toBeInTheDocument()

        expect(
            screen.getByText("+ Добавить шаг")
        ).toBeInTheDocument()
    })

    it("renders edit form with existing data", async () => {
        router.push("/edit/1")
        await router.isReady()

        render(RecipeForm, {
            global: {
                plugins: [router]
            }
        })

        expect(
            await screen.findByRole("heading", { name: /редактировать рецепт/i })
        ).toBeInTheDocument()

        const titleInput = await screen.findByPlaceholderText("Название рецепта") as HTMLInputElement
        expect(titleInput.value).toBe("Existing Recipe")
    })
})
