<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { recipeService } from "../services/recipeService"
import type { Recipe } from "../types/recipe"

const router = useRouter()

const recipes = ref<Recipe[]>([])
const page = ref(0)
const totalPages = ref(0)
const loading = ref(false)
const error = ref<string | null>(null)

const loadRecipes = async () => {
  loading.value = true
  error.value = null
  try {
    const data = await recipeService.getAll(page.value)
    recipes.value = data.content
    totalPages.value = data.totalPages
  } catch (e) {
    error.value = "Не удалось загрузить рецепты. Попробуйте позже."
    console.error(e)
  } finally {
    loading.value = false
  }
}

const nextPage = () => {
  if (page.value < totalPages.value - 1) {
    page.value++
    loadRecipes()
  }
}

const prevPage = () => {
  if (page.value > 0) {
    page.value--
    loadRecipes()
  }
}

onMounted(loadRecipes)
</script>

<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="loading__spinner" />
      <div>Загружаем рецепты…</div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="alert alert--error">
      <span>⚠️</span>
      <span>{{ error }}</span>
      <button class="btn btn--ghost btn--sm" style="margin-left: auto;" @click="loadRecipes">
        Повторить
      </button>
    </div>

    <!-- Empty state -->
    <div v-else-if="recipes.length === 0" class="empty-state">
      <span class="empty-state__icon">📖</span>
      <div class="empty-state__text">Рецептов пока нет</div>
      <button class="btn btn--primary btn--lg" @click="router.push('/create')">
        ＋ Создать первый рецепт
      </button>
    </div>

    <!-- Recipe grid -->
    <div v-else class="recipe-grid">
      <div
          v-for="recipe in recipes"
          :key="recipe.id"
          class="recipe-card"
          @click="router.push(`/recipe/${recipe.id}`)"
      >
        <div class="recipe-card__image-wrapper">
          <img
              v-if="recipe.imageUrl"
              :src="recipe.imageUrl"
              :alt="recipe.title"
              class="recipe-card__image"
          />
          <div v-else class="recipe-card__placeholder">🍽️</div>
        </div>

        <div class="recipe-card__body">
          <h2 class="recipe-card__title">{{ recipe.title }}</h2>
          <p class="recipe-card__desc">{{ recipe.description }}</p>

          <div class="recipe-card__meta">
            <span v-if="recipe.cookingTimeMinutes">⏱ {{ recipe.cookingTimeMinutes }} мин</span>
            <span v-if="recipe.difficulty">
              {{ recipe.difficulty === 'EASY' ? '🟢 Лёгкий' : recipe.difficulty === 'MEDIUM' ? '🟡 Средний' : '🔴 Сложный' }}
            </span>
            <span>🥘 {{ recipe.ingredients?.length || 0 }} ингред.</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="!loading && !error && recipes.length > 0" class="pagination">
      <button
          v-if="page > 0"
          class="btn btn--ghost"
          @click="prevPage"
      >
        ← Назад
      </button>

      <span style="color: rgba(226,232,240,0.4); font-size: 14px;">
        Страница {{ page + 1 }} из {{ totalPages }}
      </span>

      <button
          v-if="page < totalPages - 1"
          class="btn btn--ghost"
          @click="nextPage"
      >
        Вперёд →
      </button>
    </div>
  </div>
</template>
