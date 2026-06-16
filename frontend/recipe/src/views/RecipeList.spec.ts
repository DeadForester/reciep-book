import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { defineComponent, h } from 'vue'
import RecipeList from './RecipeList.vue'
import { recipeService } from '../services/recipeService'

vi.mock('../services/recipeService', () => ({
    recipeService: {
        getAll: vi.fn(),
        getById: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        uploadImage: vi.fn()
    }
}))

const mockedRecipeService = vi.mocked(recipeService)

const DummyComponent = defineComponent({
    render() {
        return h('div', 'Dummy')
    }
})

describe('RecipeList.vue', () => {
    let router: ReturnType<typeof createRouter>
    let pushSpy: ReturnType<typeof vi.spyOn>
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
        vi.clearAllMocks()

        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

        router = createRouter({
            history: createWebHistory(),
            routes: [
                { path: '/', component: DummyComponent },
                { path: '/create', component: DummyComponent },
                { path: '/recipe/:id', component: DummyComponent }
            ]
        })

        pushSpy = vi.spyOn(router, 'push')
    })

    const mountList = async () => {
        router.push('/')
        await router.isReady()

        return mount(RecipeList, {
            global: {
                plugins: [router]
            }
        })
    }

    const mockRecipesData = (recipes: any[] = [], totalPages = 1) => ({
        content: recipes,
        totalElements: recipes.length,
        totalPages,
        number: 0,
        size: 10
    })

    const createMockRecipe = (overrides: any = {}) => ({
        id: '1',
        title: 'Test Recipe',
        description: 'Test Description',
        ingredients: ['ing1'],
        steps: ['step1'],
        cookingTimeMinutes: 30,
        difficulty: 'EASY',
        ...overrides
    })

    const findButtonByText = (wrapper: any, text: string) => {
        return wrapper.findAll('.btn--ghost').find((btn: { text: () => string | string[] }) => btn.text().includes(text))
    }

    describe('Loading state', () => {
        it('should show loading spinner while fetching recipes', async () => {
            let resolveLoad: (value: any) => void
            mockedRecipeService.getAll.mockImplementation(
                () => new Promise(resolve => {
                    resolveLoad = resolve
                })
            )

            const wrapper = await mountList()

            expect(wrapper.find('.loading').exists()).toBe(true)
            expect(wrapper.text()).toContain('Загружаем рецепты…')

            // Разрешаем промис
            resolveLoad!(mockRecipesData())
            await flushPromises()
        })
    })

    describe('Error state', () => {
        it('should show error message when API fails', async () => {
            mockedRecipeService.getAll.mockRejectedValueOnce(new Error('Network error'))

            const wrapper = await mountList()
            await flushPromises()

            expect(wrapper.find('.alert--error').exists()).toBe(true)
            expect(wrapper.text()).toContain('Не удалось загрузить рецепты')
        })

        it('should show retry button when error occurs', async () => {
            mockedRecipeService.getAll.mockRejectedValueOnce(new Error('Network error'))

            const wrapper = await mountList()
            await flushPromises()

            const retryButton = wrapper.find('.alert--error button')
            expect(retryButton.exists()).toBe(true)
            expect(retryButton.text()).toContain('Повторить')
        })

        it('should retry loading when clicking retry button', async () => {
            mockedRecipeService.getAll
                .mockRejectedValueOnce(new Error('Network error'))
                .mockResolvedValueOnce(mockRecipesData([createMockRecipe()]))

            const wrapper = await mountList()
            await flushPromises()

            expect(wrapper.find('.alert--error').exists()).toBe(true)

            const retryButton = wrapper.find('.alert--error button')
            await retryButton.trigger('click')
            await flushPromises()

            expect(mockedRecipeService.getAll).toHaveBeenCalledTimes(2)
            expect(wrapper.find('.recipe-grid').exists()).toBe(true)
        })
    })

    describe('Empty state', () => {
        it('should show empty state when no recipes', async () => {
            mockedRecipeService.getAll.mockResolvedValueOnce(mockRecipesData([]))

            const wrapper = await mountList()
            await flushPromises()

            expect(wrapper.find('.empty-state').exists()).toBe(true)
            expect(wrapper.text()).toContain('Рецептов пока нет')
        })

        it('should navigate to create page when clicking create button', async () => {
            mockedRecipeService.getAll.mockResolvedValueOnce(mockRecipesData([]))

            const wrapper = await mountList()
            await flushPromises()

            const createButton = wrapper.find('.empty-state .btn--primary')
            await createButton.trigger('click')

            expect(pushSpy).toHaveBeenCalledWith('/create')
        })
    })

    describe('Recipe grid', () => {
        it('should render recipes when data is loaded', async () => {
            const recipes = [
                createMockRecipe({ id: '1', title: 'Recipe 1' }),
                createMockRecipe({ id: '2', title: 'Recipe 2' }),
                createMockRecipe({ id: '3', title: 'Recipe 3' })
            ]
            mockedRecipeService.getAll.mockResolvedValueOnce(mockRecipesData(recipes))

            const wrapper = await mountList()
            await flushPromises()

            const cards = wrapper.findAll('.recipe-card')
            expect(cards.length).toBe(3)
        })

        it('should display recipe title and description', async () => {
            const recipes = [
                createMockRecipe({
                    id: '1',
                    title: 'Borscht',
                    description: 'Traditional Ukrainian soup'
                })
            ]
            mockedRecipeService.getAll.mockResolvedValueOnce(mockRecipesData(recipes))

            const wrapper = await mountList()
            await flushPromises()

            const firstCard = wrapper.find('.recipe-card')
            expect(firstCard.find('.recipe-card__title').text()).toBe('Borscht')
            expect(firstCard.find('.recipe-card__desc').text()).toBe('Traditional Ukrainian soup')
        })

        it('should display cooking time when available', async () => {
            const recipes = [createMockRecipe({ cookingTimeMinutes: 45 })]
            mockedRecipeService.getAll.mockResolvedValueOnce(mockRecipesData(recipes))

            const wrapper = await mountList()
            await flushPromises()

            const meta = wrapper.find('.recipe-card__meta')
            expect(meta.text()).toContain('⏱ 45 мин')
        })

        it('should display difficulty label', async () => {
            const recipes = [createMockRecipe({ difficulty: 'MEDIUM' })]
            mockedRecipeService.getAll.mockResolvedValueOnce(mockRecipesData(recipes))

            const wrapper = await mountList()
            await flushPromises()

            const meta = wrapper.find('.recipe-card__meta')
            expect(meta.text()).toContain('🟡 Средний')
        })

        it('should display difficulty EASY correctly', async () => {
            const recipes = [createMockRecipe({ difficulty: 'EASY' })]
            mockedRecipeService.getAll.mockResolvedValueOnce(mockRecipesData(recipes))

            const wrapper = await mountList()
            await flushPromises()

            const meta = wrapper.find('.recipe-card__meta')
            expect(meta.text()).toContain('🟢 Лёгкий')
        })

        it('should display difficulty HARD correctly', async () => {
            const recipes = [createMockRecipe({ difficulty: 'HARD' })]
            mockedRecipeService.getAll.mockResolvedValueOnce(mockRecipesData(recipes))

            const wrapper = await mountList()
            await flushPromises()

            const meta = wrapper.find('.recipe-card__meta')
            expect(meta.text()).toContain('🔴 Сложный')
        })

        it('should display ingredients count', async () => {
            const recipes = [createMockRecipe({ ingredients: ['ing1', 'ing2', 'ing3'] })]
            mockedRecipeService.getAll.mockResolvedValueOnce(mockRecipesData(recipes))

            const wrapper = await mountList()
            await flushPromises()

            const meta = wrapper.find('.recipe-card__meta')
            expect(meta.text()).toContain('🥘 3 ингред.')
        })

        it('should display image when imageUrl exists', async () => {
            const recipes = [createMockRecipe({ imageUrl: '/images/test.jpg' })]
            mockedRecipeService.getAll.mockResolvedValueOnce(mockRecipesData(recipes))

            const wrapper = await mountList()
            await flushPromises()

            const img = wrapper.find('.recipe-card__image')
            expect(img.exists()).toBe(true)
            expect(img.attributes('src')).toBe('/images/test.jpg')
        })

        it('should display placeholder when no image', async () => {
            const recipes = [createMockRecipe({ imageUrl: null })]
            mockedRecipeService.getAll.mockResolvedValueOnce(mockRecipesData(recipes))

            const wrapper = await mountList()
            await flushPromises()

            const placeholder = wrapper.find('.recipe-card__placeholder')
            expect(placeholder.exists()).toBe(true)
            expect(placeholder.text()).toBe('🍽️')
        })

        it('should navigate to recipe details when clicking card', async () => {
            const recipes = [createMockRecipe({ id: '123' })]
            mockedRecipeService.getAll.mockResolvedValueOnce(mockRecipesData(recipes))

            const wrapper = await mountList()
            await flushPromises()

            const card = wrapper.find('.recipe-card')
            await card.trigger('click')

            expect(pushSpy).toHaveBeenCalledWith('/recipe/123')
        })
    })

    describe('Pagination', () => {
        it('should show pagination when recipes exist', async () => {
            const recipes = [createMockRecipe()]
            mockedRecipeService.getAll.mockResolvedValueOnce(mockRecipesData(recipes, 3))

            const wrapper = await mountList()
            await flushPromises()

            expect(wrapper.find('.pagination').exists()).toBe(true)
        })

        it('should display current page and total pages', async () => {
            const recipes = [createMockRecipe()]
            mockedRecipeService.getAll.mockResolvedValueOnce(mockRecipesData(recipes, 5))

            const wrapper = await mountList()
            await flushPromises()

            expect(wrapper.text()).toContain('Страница 1 из 5')
        })

        it('should show "Next" button when not on last page', async () => {
            const recipes = [createMockRecipe()]
            mockedRecipeService.getAll.mockResolvedValueOnce(mockRecipesData(recipes, 3))

            const wrapper = await mountList()
            await flushPromises()

            // ✅ Используем вспомогательную функцию
            const nextButton = findButtonByText(wrapper, 'Вперёд')
            expect(nextButton).toBeDefined()
            expect(nextButton!.text()).toContain('Вперёд')
        })

        it('should hide "Next" button on last page', async () => {
            const recipes = [createMockRecipe()]
            mockedRecipeService.getAll.mockResolvedValueOnce(mockRecipesData(recipes, 1))

            const wrapper = await mountList()
            await flushPromises()

            // ✅ Используем вспомогательную функцию
            const nextButton = findButtonByText(wrapper, 'Вперёд')
            expect(nextButton).toBeUndefined()
        })

        it('should show "Previous" button when not on first page', async () => {
            const recipes = [createMockRecipe()]
            mockedRecipeService.getAll
                .mockResolvedValueOnce(mockRecipesData(recipes, 3))
                .mockResolvedValueOnce(mockRecipesData(recipes, 3))

            const wrapper = await mountList()
            await flushPromises()

            // Переходим на вторую страницу
            const nextButton = findButtonByText(wrapper, 'Вперёд')
            await nextButton!.trigger('click')
            await flushPromises()

            // ✅ Используем вспомогательную функцию
            const prevButton = findButtonByText(wrapper, 'Назад')
            expect(prevButton).toBeDefined()
            expect(prevButton!.text()).toContain('Назад')
        })

        it('should hide "Previous" button on first page', async () => {
            const recipes = [createMockRecipe()]
            mockedRecipeService.getAll.mockResolvedValueOnce(mockRecipesData(recipes, 3))

            const wrapper = await mountList()
            await flushPromises()

            // ✅ Используем вспомогательную функцию
            const prevButton = findButtonByText(wrapper, 'Назад')
            expect(prevButton).toBeUndefined()
        })

        it('should load next page when clicking "Next"', async () => {
            const recipes = [createMockRecipe()]
            mockedRecipeService.getAll
                .mockResolvedValueOnce(mockRecipesData(recipes, 3))
                .mockResolvedValueOnce(mockRecipesData(recipes, 3))

            const wrapper = await mountList()
            await flushPromises()

            const nextButton = findButtonByText(wrapper, 'Вперёд')
            await nextButton!.trigger('click')
            await flushPromises()

            expect(mockedRecipeService.getAll).toHaveBeenCalledWith(1)
            expect(wrapper.text()).toContain('Страница 2 из 3')
        })

        it('should load previous page when clicking "Previous"', async () => {
            const recipes = [createMockRecipe()]
            mockedRecipeService.getAll
                .mockResolvedValueOnce(mockRecipesData(recipes, 3))
                .mockResolvedValueOnce(mockRecipesData(recipes, 3))
                .mockResolvedValueOnce(mockRecipesData(recipes, 3))

            const wrapper = await mountList()
            await flushPromises()

            // Переход на вторую страницу
            const nextButton = findButtonByText(wrapper, 'Вперёд')
            await nextButton!.trigger('click')
            await flushPromises()

            // Возврат на первую страницу
            const prevButton = findButtonByText(wrapper, 'Назад')
            await prevButton!.trigger('click')
            await flushPromises()

            expect(mockedRecipeService.getAll).toHaveBeenCalledWith(0)
            expect(wrapper.text()).toContain('Страница 1 из 3')
        })

        it('should not go below page 0', async () => {
            const recipes = [createMockRecipe()]
            mockedRecipeService.getAll.mockResolvedValueOnce(mockRecipesData(recipes, 3))

            const wrapper = await mountList()
            await flushPromises()

            // На первой странице кнопка "Назад" не должна существовать
            const prevButton = findButtonByText(wrapper, 'Назад')
            expect(prevButton).toBeUndefined()

            // Должен быть только один вызов (изначально)
            expect(mockedRecipeService.getAll).toHaveBeenCalledTimes(1)
        })

        it('should not go beyond last page', async () => {
            const recipes = [createMockRecipe()]
            // totalPages = 1, значит мы на последней странице
            mockedRecipeService.getAll.mockResolvedValueOnce(mockRecipesData(recipes, 1))

            const wrapper = await mountList()
            await flushPromises()

            // На последней странице кнопка "Вперёд" не должна существовать
            const nextButton = findButtonByText(wrapper, 'Вперёд')
            expect(nextButton).toBeUndefined()

            // Должен быть только один вызов (изначально)
            expect(mockedRecipeService.getAll).toHaveBeenCalledTimes(1)
        })
    })

    describe('Initial load', () => {
        it('should load recipes on mount', async () => {
            const recipes = [createMockRecipe()]
            mockedRecipeService.getAll.mockResolvedValueOnce(mockRecipesData(recipes))

            const wrapper = await mountList()
            await flushPromises()

            expect(mockedRecipeService.getAll).toHaveBeenCalledWith(0)
            expect(wrapper.findAll('.recipe-card').length).toBe(1)
        })

        it('should pass correct page parameter', async () => {
            const recipes = [createMockRecipe()]
            mockedRecipeService.getAll.mockResolvedValueOnce(mockRecipesData(recipes))

            await mountList()
            await flushPromises()

            expect(mockedRecipeService.getAll).toHaveBeenCalledWith(0)
        })
    })
})