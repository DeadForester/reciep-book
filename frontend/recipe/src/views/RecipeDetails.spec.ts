import { render, screen } from "@testing-library/vue"
import { describe, it, expect, vi, beforeEach } from "vitest"
import RecipeDetails from "@/views/RecipeDetails.vue"
import { createRouter, createMemoryHistory } from "vue-router"

vi.mock("@/services/recipeService", () => ({
    recipeService: {
        getById: vi.fn(() => Promise.resolve({
            id: "1",
            title: "Pizza",
            description: "Delicious cheese pizza",
            ingredients: ["Cheese", "Tomato", "Dough"],
            steps: ["Prepare dough", "Add toppings", "Bake at 200C for 20 min"],
            cookingTimeMinutes: 30,
            difficulty: "MEDIUM",
            imageUrl: "/images/pizza.jpg"
        })),
        delete: vi.fn(() => Promise.resolve())
    }
}))

const router = createRouter({
    history: createMemoryHistory(),
    routes: [
        { path: "/recipe/:id", component: RecipeDetails }
    ]
})

describe("RecipeDetails", () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it("renders recipe details", async () => {
        router.push("/recipe/1")
        await router.isReady()

        render(RecipeDetails, {
            global: {
                plugins: [router]
            }
        })

        expect(await screen.findByText("Pizza")).toBeInTheDocument()
        expect(screen.getByText("Delicious cheese pizza")).toBeInTheDocument()
        expect(screen.getByText("Cheese")).toBeInTheDocument()
        expect(screen.getByText("Prepare dough")).toBeInTheDocument()
        expect(screen.getByText(/30 мин/)).toBeInTheDocument()
        expect(screen.getByText(/Средний/)).toBeInTheDocument()
    })

    it("shows recipe title after loading", async () => {
        router.push("/recipe/1")
        await router.isReady()

        render(RecipeDetails, {
            global: {
                plugins: [router]
            }
        })

        expect(await screen.findByRole("heading", { name: /pizza/i, level: 1 })).toBeInTheDocument()
    })
})
