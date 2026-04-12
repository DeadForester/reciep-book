<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import { recipeService } from "../services/recipeService"
import type { Recipe } from "../types/recipe"

const route = useRoute()
const router = useRouter()

const recipe = ref<Recipe | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const showDeleteModal = ref(false)

const loadRecipe = async () => {
  loading.value = true
  error.value = null
  try {
    recipe.value = await recipeService.getById(route.params.id as string)
  } catch (e) {
    error.value = "Не удалось загрузить рецепт. Возможно, он был удалён."
    console.error(e)
  } finally {
    loading.value = false
  }
}

const removeRecipe = async () => {
  if (!recipe.value) return
  try {
    await recipeService.delete(recipe.value.id)
    router.push("/")
  } catch (e) {
    error.value = "Не удалось удалить рецепт"
    console.error(e)
  }
}

const difficultyLabel = (d: string) => {
  const map: Record<string, string> = { EASY: "🟢 Лёгкий", MEDIUM: "🟡 Средний", HARD: "🔴 Сложный" }
  return map[d] || d
}

onMounted(loadRecipe)
</script>

<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="loading__spinner" />
      <div>Загружаем рецепт…</div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="alert alert--error" style="max-width: 720px; margin: 48px auto;">
      <span>⚠️</span>
      <span>{{ error }}</span>
      <button class="btn btn--ghost btn--sm" style="margin-left: auto;" @click="loadRecipe">
        Повторить
      </button>
    </div>

    <!-- Recipe detail -->
    <div v-else-if="recipe" class="page-container page-container--medium">
      <!-- Hero image -->
      <div class="detail-hero">
        <img
            v-if="recipe.imageUrl"
            :src="recipe.imageUrl"
            :alt="recipe.title"
            class="detail-hero__image"
        />
        <div v-else class="detail-hero__placeholder">🍽️</div>
      </div>

      <!-- Title -->
      <h1 class="detail-title">{{ recipe.title }}</h1>

      <!-- Badges -->
      <div class="detail-badges">
        <span class="detail-badge" v-if="recipe.cookingTimeMinutes">
          ⏱ {{ recipe.cookingTimeMinutes }} мин
        </span>
        <span class="detail-badge" v-if="recipe.difficulty">
          {{ difficultyLabel(recipe.difficulty) }}
        </span>
        <span class="detail-badge">
          🥘 {{ recipe.ingredients?.length || 0 }} ингредиентов
        </span>
        <span class="detail-badge">
          📝 {{ recipe.steps?.length || 0 }} шагов
        </span>
      </div>

      <!-- Ingredients -->
      <div class="detail-section">
        <div class="detail-section__title">Ингредиенты</div>
        <ul class="detail-ingredients">
          <li v-for="(ing, index) in recipe.ingredients" :key="index">
            {{ ing }}
          </li>
        </ul>
      </div>

      <!-- Steps -->
      <div class="detail-section">
        <div class="detail-section__title">Шаги приготовления</div>
        <ol class="detail-steps">
          <li v-for="(step, index) in recipe.steps" :key="index">
            {{ step }}
          </li>
        </ol>
      </div>

      <!-- Description -->
      <div class="detail-section">
        <div class="detail-section__title">Описание</div>
        <p class="detail-description">{{ recipe.description }}</p>
      </div>

      <!-- Actions -->
      <div class="detail-actions">
        <button class="btn btn--ghost" @click="router.push('/')">
          ← Назад к списку
        </button>

        <div class="detail-actions__right">
          <button class="btn btn--primary" @click="router.push(`/edit/${recipe.id}`)">
            ✏️ Редактировать
          </button>
          <button class="btn btn--danger" @click="showDeleteModal = true">
            🗑 Удалить
          </button>
        </div>
      </div>

      <!-- Delete modal -->
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
        <div class="modal">
          <div class="modal__icon">🗑️</div>
          <h3 class="modal__title">Удалить рецепт?</h3>
          <p class="modal__desc">Это действие нельзя отменить.</p>
          <div class="modal__actions">
            <button class="btn btn--ghost" @click="showDeleteModal = false">
              Отмена
            </button>
            <button class="btn btn--danger" @click="removeRecipe">
              Удалить
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
