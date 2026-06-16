import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Recipe, RecipeRequest } from '../types/recipe'

const { mockGet, mockPost, mockPut, mockDelete } = vi.hoisted(() => {
    return {
        mockGet: vi.fn(),
        mockPost: vi.fn(),
        mockPut: vi.fn(),
        mockDelete: vi.fn()
    }
})

vi.mock('axios', () => ({
    default: {
        create: vi.fn(() => ({
            get: mockGet,
            post: mockPost,
            put: mockPut,
            delete: mockDelete
        }))
    }
}))

import { recipeService } from './recipeService'

describe('recipeService', () => {
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>

    const createMockRecipe = (overrides: Partial<Recipe> = {}): Recipe => ({
        id: '123',
        title: 'Test Recipe',
        description: 'Test Description',
        ingredients: ['ing1', 'ing2'],
        steps: ['step1', 'step2'],
        cookingTimeMinutes: 30,
        difficulty: 'EASY',
        ...overrides
    })

    beforeEach(() => {
        vi.clearAllMocks()
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    describe('getAll', () => {
        it('should fetch recipes with default pagination', async () => {
            const mockData = {
                content: [createMockRecipe()],
                totalElements: 1,
                totalPages: 1,
                number: 0,
                size: 10
            }
            mockGet.mockResolvedValueOnce({ data: mockData })

            const result = await recipeService.getAll()

            expect(mockGet).toHaveBeenCalledWith('/recipes?page=0&size=10')
            expect(result).toEqual(mockData)
        })

        it('should fetch recipes with custom pagination', async () => {
            const mockData = {
                content: [],
                totalElements: 0,
                totalPages: 0,
                number: 2,
                size: 5
            }
            mockGet.mockResolvedValueOnce({ data: mockData })

            const result = await recipeService.getAll(2, 5)

            expect(mockGet).toHaveBeenCalledWith('/recipes?page=2&size=5')
            expect(result).toEqual(mockData)
        })

        it('should handle error and log to console', async () => {
            const error = new Error('Network error')
            mockGet.mockRejectedValueOnce(error)

            await expect(recipeService.getAll()).rejects.toThrow('Network error')
            expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch recipes:', error)
        })
    })

    describe('getById', () => {
        it('should fetch recipe by id', async () => {
            const mockRecipe = createMockRecipe({
                id: '123',
                imageUrl: '/images/test.jpg',
                createdAt: '2024-01-01T00:00:00Z'
            })
            mockGet.mockResolvedValueOnce({ data: mockRecipe })

            const result = await recipeService.getById('123')

            expect(mockGet).toHaveBeenCalledWith('/recipes/123')
            expect(result).toEqual(mockRecipe)
        })

        it('should fetch recipe without optional fields', async () => {
            const mockRecipe = createMockRecipe({ id: '456' })
            mockGet.mockResolvedValueOnce({ data: mockRecipe })

            const result = await recipeService.getById('456')

            expect(result.id).toBe('456')
            expect(result.imageUrl).toBeUndefined()
            expect(result.createdAt).toBeUndefined()
        })

        it('should handle error when recipe not found', async () => {
            const error = new Error('Not found')
            mockGet.mockRejectedValueOnce(error)

            await expect(recipeService.getById('999')).rejects.toThrow('Not found')
            expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch recipe 999:', error)
        })
    })

    describe('create', () => {
        it('should create a new recipe', async () => {
            const request: RecipeRequest = {
                title: 'New Recipe',
                description: 'Description',
                ingredients: ['ing1'],
                steps: ['step1'],
                cookingTimeMinutes: 20,
                difficulty: 'EASY'
            }
            const mockRecipe = createMockRecipe({ id: '1', ...request })
            mockPost.mockResolvedValueOnce({ data: mockRecipe })

            const result = await recipeService.create(request)

            expect(mockPost).toHaveBeenCalledWith('/recipes', request)
            expect(result).toEqual(mockRecipe)
        })

        it('should handle error during creation', async () => {
            const error = new Error('Validation error')
            mockPost.mockRejectedValueOnce(error)

            const request: RecipeRequest = {
                title: '',
                description: '',
                ingredients: [],
                steps: [],
                cookingTimeMinutes: 0,
                difficulty: 'EASY'
            }

            await expect(recipeService.create(request)).rejects.toThrow('Validation error')
            expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to create recipe:', error)
        })
    })

    describe('update', () => {
        it('should update an existing recipe', async () => {
            const request: RecipeRequest = {
                title: 'Updated Recipe',
                description: 'Updated',
                ingredients: ['ing1'],
                steps: ['step1'],
                cookingTimeMinutes: 45,
                difficulty: 'MEDIUM'
            }
            const mockRecipe = createMockRecipe({ id: '123', ...request })
            mockPut.mockResolvedValueOnce({ data: mockRecipe })

            const result = await recipeService.update('123', request)

            expect(mockPut).toHaveBeenCalledWith('/recipes/123', request)
            expect(result).toEqual(mockRecipe)
        })

        it('should handle error during update', async () => {
            const error = new Error('Update failed')
            mockPut.mockRejectedValueOnce(error)

            const request: RecipeRequest = {
                title: 'Test',
                description: 'Test',
                ingredients: [],
                steps: [],
                cookingTimeMinutes: 10,
                difficulty: 'EASY'
            }

            await expect(recipeService.update('123', request)).rejects.toThrow('Update failed')
            expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to update recipe 123:', error)
        })
    })

    describe('delete', () => {
        it('should delete a recipe', async () => {
            mockDelete.mockResolvedValueOnce({})

            await recipeService.delete('123')

            expect(mockDelete).toHaveBeenCalledWith('/recipes/123')
        })

        it('should handle error during deletion', async () => {
            const error = new Error('Delete failed')
            mockDelete.mockRejectedValueOnce(error)

            await expect(recipeService.delete('123')).rejects.toThrow('Delete failed')
            expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to delete recipe 123:', error)
        })
    })

    describe('uploadImage', () => {
        it('should upload image for recipe', async () => {
            const mockRecipe = createMockRecipe({ id: '123', imageUrl: '/images/new.jpg' })
            mockPost.mockResolvedValueOnce({ data: mockRecipe })

            const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })
            const result = await recipeService.uploadImage('123', file)

            expect(mockPost).toHaveBeenCalledWith(
                '/recipes/123/image',
                expect.any(FormData),
                { headers: { 'Content-Type': 'multipart/form-data' } }
            )
            expect(result).toEqual(mockRecipe)
        })

        it('should handle error during image upload', async () => {
            const error = new Error('Upload failed')
            mockPost.mockRejectedValueOnce(error)

            const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

            await expect(recipeService.uploadImage('123', file)).rejects.toThrow('Upload failed')
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Failed to upload image for recipe 123:',
                error
            )
        })
    })
})