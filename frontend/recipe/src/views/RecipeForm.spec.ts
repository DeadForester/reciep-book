import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { defineComponent, h } from 'vue'
import RecipeForm from './RecipeForm.vue'
import { recipeService } from '@/services/recipeService'

vi.mock('@/services/recipeService', () => ({
    recipeService: {
        create: vi.fn(),
        update: vi.fn(),
        getById: vi.fn(),
        uploadImage: vi.fn()
    }
}))

const mockedRecipeService = vi.mocked(recipeService)

const DummyComponent = defineComponent({
    render() {
        return h('div', 'Dummy')
    }
})

describe('RecipeForm.vue', () => {
    let router: ReturnType<typeof createRouter>
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
        vi.clearAllMocks()
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

        router = createRouter({
            history: createWebHistory(),
            routes: [
                { path: '/', component: DummyComponent },
                { path: '/create', component: DummyComponent },
                { path: '/edit/:id', component: DummyComponent }
            ]
        })
    })

    const mountForm = async (path = '/create') => {
        router.push(path)
        await router.isReady()

        return mount(RecipeForm, {
            global: {
                plugins: [router]
            }
        })
    }

    // ✅ Вспомогательная функция для заполнения формы
    const fillForm = async (wrapper: any) => {
        // Title - используем placeholder для точного поиска
        const titleInput = wrapper.find('input[placeholder*="Например"]')
        await titleInput.setValue('Test Recipe')

        // Description
        const textarea = wrapper.find('textarea')
        await textarea.setValue('Test Description')

        // Первый ингредиент
        const ingredientInputs = wrapper.findAll('.form-list__input')
        if (ingredientInputs.length > 0) {
            await ingredientInputs[0].setValue('Ingredient 1')
        }

        // Первый шаг
        const stepInputs = wrapper.findAll('.form-list__input')
        if (stepInputs.length > 1) {
            await stepInputs[1].setValue('Step 1')
        }
    }

    // ✅ Вспомогательная функция для поиска кнопки save
    const findSaveButton = (wrapper: any) => {
        return wrapper.find('.btn--primary.btn--full')
    }

    describe('Rendering', () => {
        it('should render form with "New Recipe" title when creating', async () => {
            const wrapper = await mountForm('/create')

            expect(wrapper.find('h2').text()).toContain('Новый рецепт')
        })

        it('should render form with "Edit Recipe" title when editing', async () => {
            mockedRecipeService.getById.mockResolvedValueOnce({
                id: '123',
                title: 'Test',
                description: 'Desc',
                ingredients: ['ing1'],
                steps: ['step1'],
                cookingTimeMinutes: 30,
                difficulty: 'EASY'
            })

            const wrapper = await mountForm('/edit/123')
            await flushPromises()

            expect(wrapper.find('h2').text()).toContain('Редактировать рецепт')
        })

        it('should render all form sections', async () => {
            const wrapper = await mountForm('/create')

            expect(wrapper.text()).toContain('Основное')
            expect(wrapper.text()).toContain('Ингредиенты')
            expect(wrapper.text()).toContain('Шаги приготовления')
            expect(wrapper.text()).toContain('Описание')
            expect(wrapper.text()).toContain('Параметры')
            expect(wrapper.text()).toContain('Фото')
        })

        it('should render difficulty options', async () => {
            const wrapper = await mountForm('/create')

            const select = wrapper.find('select')
            expect(select.exists()).toBe(true)

            const options = wrapper.findAll('option')
            expect(options.length).toBe(3)
            expect(options[0]!.text()).toContain('Лёгкий')
            expect(options[1]!.text()).toContain('Средний')
            expect(options[2]!.text()).toContain('Сложный')
        })
    })

    describe('Ingredients management', () => {
        it('should add ingredient when clicking add button', async () => {
            const wrapper = await mountForm('/create')

            const initialCount = wrapper.findAll('.form-list__item').length
            const addButton = wrapper.findAll('.form-list__add')[0]!

            await addButton.trigger('click')

            const newCount = wrapper.findAll('.form-list__item').length
            expect(newCount).toBe(initialCount + 1)
        })

        it('should remove ingredient when clicking remove button', async () => {
            const wrapper = await mountForm('/create')

            const addButton = wrapper.findAll('.form-list__add')[0]!
            await addButton.trigger('click')

            const initialCount = wrapper.findAll('.form-list__item').length

            const removeButton = wrapper.findAll('.form-list__remove')[0]!
            await removeButton.trigger('click')

            const newCount = wrapper.findAll('.form-list__item').length
            expect(newCount).toBe(initialCount - 1)
        })

        it('should disable remove button when only one ingredient left', async () => {
            const wrapper = await mountForm('/create')

            const removeButton = wrapper.findAll('.form-list__remove')[0]!
            expect(removeButton.attributes('disabled')).toBeDefined()
        })
    })

    describe('Steps management', () => {
        it('should add step when clicking add button', async () => {
            const wrapper = await mountForm('/create')

            const initialCount = wrapper.findAll('.form-list__item').length
            const addButton = wrapper.findAll('.form-list__add')[1]!

            await addButton.trigger('click')

            const newCount = wrapper.findAll('.form-list__item').length
            expect(newCount).toBeGreaterThan(initialCount)
        })

        it('should remove step when clicking remove button', async () => {
            const wrapper = await mountForm('/create')

            const addButton = wrapper.findAll('.form-list__add')[1]!
            await addButton.trigger('click')

            const initialCount = wrapper.findAll('.form-list__item').length

            const removeButtons = wrapper.findAll('.form-list__remove')
            const stepRemoveButton = removeButtons[removeButtons.length - 1]!
            await stepRemoveButton.trigger('click')

            const newCount = wrapper.findAll('.form-list__item').length
            expect(newCount).toBeLessThan(initialCount)
        })
    })

    describe('Validation', () => {
        it('should show error when title is empty', async () => {
            const wrapper = await mountForm('/create')

            await wrapper.find('textarea').setValue('Description')

            const saveButton = findSaveButton(wrapper)
            await saveButton.trigger('click')

            expect(wrapper.text()).toContain('Название рецепта обязательно')
            expect(mockedRecipeService.create).not.toHaveBeenCalled()
        })

        it('should show error when description is empty', async () => {
            const wrapper = await mountForm('/create')

            const titleInput = wrapper.find('input[placeholder*="Например"]')
            await titleInput.setValue('Test Recipe')

            const saveButton = findSaveButton(wrapper)
            await saveButton.trigger('click')

            expect(wrapper.text()).toContain('Описание обязательно')
        })

        it('should show error when no ingredients', async () => {
            const wrapper = await mountForm('/create')

            const titleInput = wrapper.find('input[placeholder*="Например"]')
            await titleInput.setValue('Test Recipe')

            const textarea = wrapper.find('textarea')
            await textarea.setValue('Description')

            // Очищаем все ингредиенты
            const ingredientInputs = wrapper.findAll('.form-list__input')
            for (const input of ingredientInputs.slice(0, 1)) {
                await input.setValue('')
            }

            const saveButton = findSaveButton(wrapper)
            await saveButton.trigger('click')

            expect(wrapper.text()).toContain('Добавьте хотя бы один ингредиент')
        })

        it('should show error when cooking time is less than 5 minutes', async () => {
            const wrapper = await mountForm('/create')

            const titleInput = wrapper.find('input[placeholder*="Например"]')
            await titleInput.setValue('Test Recipe')

            await wrapper.find('textarea').setValue('Description')

            const allInputs = wrapper.findAll('.form-list__input')
            await allInputs[0]!.setValue('Ingredient 1')

            if (allInputs.length > 1) {
                await allInputs[1]!.setValue('Step 1')
            }

            const timeInput = wrapper.find('input[type="number"]')
            await timeInput.setValue(3)

            const saveButton = findSaveButton(wrapper)
            await saveButton.trigger('click')

            expect(wrapper.text()).toContain('Время приготовления должно быть не менее 5 минут')
        })
    })

    describe('Save functionality', () => {
        it('should call create service when saving new recipe', async () => {
            const wrapper = await mountForm('/create')

            mockedRecipeService.create.mockResolvedValueOnce({
                id: '1',
                title: 'Test Recipe',
                description: 'Description',
                ingredients: ['ing1'],
                steps: ['step1'],
                cookingTimeMinutes: 30,
                difficulty: 'EASY'
            })

            await fillForm(wrapper)

            const saveButton = findSaveButton(wrapper)
            await saveButton.trigger('click')
            await flushPromises()

            expect(mockedRecipeService.create).toHaveBeenCalled()
        })

        it('should call update service when editing existing recipe', async () => {
            mockedRecipeService.getById.mockResolvedValueOnce({
                id: '123',
                title: 'Old Title',
                description: 'Old Desc',
                ingredients: ['ing1'],
                steps: ['step1'],
                cookingTimeMinutes: 30,
                difficulty: 'EASY'
            })

            mockedRecipeService.update.mockResolvedValueOnce({
                id: '123',
                title: 'New Title',
                description: 'New Desc',
                ingredients: ['ing1'],
                steps: ['step1'],
                cookingTimeMinutes: 30,
                difficulty: 'EASY'
            })

            const wrapper = await mountForm('/edit/123')
            await flushPromises()

            const saveButton = findSaveButton(wrapper)
            await saveButton.trigger('click')
            await flushPromises()

            expect(mockedRecipeService.update).toHaveBeenCalledWith('123', expect.any(Object))
        })

        it('should show error when API returns 404', async () => {
            const wrapper = await mountForm('/create')

            mockedRecipeService.create.mockRejectedValueOnce({
                response: { status: 404 }
            })

            await fillForm(wrapper)

            const saveButton = findSaveButton(wrapper)
            await saveButton.trigger('click')
            await flushPromises()

            expect(wrapper.text()).toContain('Сервер не найден')
        })

        it('should show validation error when API returns 400', async () => {
            const wrapper = await mountForm('/create')

            mockedRecipeService.create.mockRejectedValueOnce({
                response: {
                    status: 400,
                    data: { title: 'Title is required' }
                }
            })

            await fillForm(wrapper)

            const saveButton = findSaveButton(wrapper)
            await saveButton.trigger('click')
            await flushPromises()

            expect(wrapper.text()).toContain('Ошибка валидации')
        })
    })

    describe('Image handling', () => {
        it('should show image preview after file selection', async () => {
            const wrapper = await mountForm('/create')

            const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
            const fileInput = wrapper.find('input[type="file"]')

            Object.defineProperty(fileInput.element, 'files', {
                value: [file]
            })

            await fileInput.trigger('change')

            expect(wrapper.find('.image-preview').exists()).toBe(true)
        })

        it('should remove image preview when clicking remove button', async () => {
            const wrapper = await mountForm('/create')

            const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
            const fileInput = wrapper.find('input[type="file"]')
            Object.defineProperty(fileInput.element, 'files', {
                value: [file]
            })
            await fileInput.trigger('change')

            expect(wrapper.find('.image-preview').exists()).toBe(true)

            const removeButton = wrapper.find('.image-preview__remove')
            await removeButton.trigger('click')

            expect(wrapper.find('.image-preview').exists()).toBe(false)
        })
    })

    describe('Loading existing recipe', () => {
        it('should load recipe data when editing', async () => {
            mockedRecipeService.getById.mockResolvedValueOnce({
                id: '123',
                title: 'Loaded Recipe',
                description: 'Loaded Description',
                ingredients: ['ing1', 'ing2'],
                steps: ['step1'],
                cookingTimeMinutes: 45,
                difficulty: 'MEDIUM',
                imageUrl: '/images/test.jpg'
            })

            const wrapper = await mountForm('/edit/123')
            await flushPromises()

            const titleInput = wrapper.find('input[placeholder*="Например"]')
            expect((titleInput.element as HTMLInputElement).value).toBe('Loaded Recipe')

            const textarea = wrapper.find('textarea')
            expect((textarea.element as HTMLTextAreaElement).value).toBe('Loaded Description')
        })

        it('should show error when loading fails', async () => {
            mockedRecipeService.getById.mockRejectedValueOnce(new Error('Not found'))

            const wrapper = await mountForm('/edit/123')
            await flushPromises()

            // ✅ Проверяем, что ошибка отображается в UI
            expect(wrapper.text()).toContain('Не удалось загрузить рецепт')
        })
    })
})