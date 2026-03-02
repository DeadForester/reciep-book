export interface Recipe {
    id: string
    title: string
    description: string
    ingredients: string[]
    imageUrl?: string
}

export interface RecipeRequest {
    title: string
    description: string
    ingredients: string[]
}

export interface PageResponse<T> {
    content: T[]
    totalPages: number
    totalElements: number
    size: number
    number: number
}