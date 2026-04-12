export type Difficulty = "EASY" | "MEDIUM" | "HARD"

export interface Recipe {
    id: string
    title: string
    description: string
    ingredients: string[]
    steps: string[]
    cookingTimeMinutes: number
    difficulty: Difficulty
    imageUrl?: string
    createdAt?: string
}

export interface RecipeRequest {
    title: string
    description: string
    ingredients: string[]
    steps: string[]
    cookingTimeMinutes: number
    difficulty: Difficulty
}

export interface PageResponse<T> {
    content: T[]
    totalPages: number
    totalElements: number
    size: number
    number: number
}