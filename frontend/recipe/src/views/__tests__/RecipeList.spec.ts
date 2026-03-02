import { describe, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/vue'
import RecipeList from '../RecipeList.vue'
import { createRouter, createWebHistory } from 'vue-router'

vi.mock('@/services/recipeService', () => ({
    getAll: vi.fn(() => Promise.resolve({
        content: [
            { id: 1, name: 'Pizza', description: 'Cheese' },
            { id: 2, name: 'Burger', description: 'Beef' }
        ],
        totalPages: 1
    }))
}))

const router = createRouter({
    history: createWebHistory(),
    routes: []
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