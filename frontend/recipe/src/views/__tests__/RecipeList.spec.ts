import { describe, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/vue'
import RecipeList from '../RecipeList.vue'
import { createRouter, createWebHistory } from 'vue-router'

vi.mock('@/services/recipeService', () => ({
    recipeService: {
        getAll: vi.fn(() => Promise.resolve({
            content: [
                { id: '1', title: 'Pizza', description: 'Cheese', ingredients: ['Cheese'], steps: ['Step 1'], cookingTimeMinutes: 20, difficulty: 'EASY', imageUrl: '' },
                { id: '2', title: 'Burger', description: 'Beef', ingredients: ['Beef'], steps: ['Step 1'], cookingTimeMinutes: 15, difficulty: 'MEDIUM', imageUrl: '' }
            ],
            totalPages: 1,
            totalElements: 2,
            size: 10,
            number: 0
        }))
    }
}))

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: RecipeList }
    ]
})

describe('RecipeList', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it('renders recipes from API', async () => {
        render(RecipeList, {
            global: {
                plugins: [router],
                stubs: ['transition', 'teleport']
            }
        })

        await router.isReady()

        expect(await screen.findByText('Pizza')).toBeInTheDocument()
        expect(await screen.findByText('Burger')).toBeInTheDocument()
    })

    it('shows "Add Recipe" button', async () => {
        render(RecipeList, {
            global: {
                plugins: [router],
                stubs: ['transition', 'teleport']
            }
        })

        expect(screen.getByText('+ Добавить рецепт')).toBeInTheDocument()
    })
})
