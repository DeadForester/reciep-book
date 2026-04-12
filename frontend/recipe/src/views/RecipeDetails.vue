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
  const map: Record<string, string> = { EASY: "Лёгкий", MEDIUM: "Средний", HARD: "Сложный" }
  return map[d] || d
}

onMounted(loadRecipe)
</script>

<template>
  <div>
    <div v-if="loading" class="text-center mt-10">
      Загрузка...
    </div>

    <div v-else-if="error" class="text-center mt-10 text-red-400">
      {{ error }}
      <button class="btn btn-ghost ml-4" @click="loadRecipe">
        Повторить
      </button>
    </div>

    <div
        v-else-if="recipe"
        class="max-w-3xl mx-auto bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg"
    >
      <img
          v-if="recipe.imageUrl"
          :src="recipe.imageUrl"
          :alt="recipe.title"
          class="max-h-96 mx-auto rounded-xl mb-6 w-full object-cover"
      />

      <h1 class="text-3xl font-bold mb-6 text-center">
        {{ recipe.title }}
      </h1>

      <h3 class="text-xl font-bold mb-3">
        Ингредиенты:
      </h3>

      <ul class="mb-6 list-disc list-inside space-y-1">
        <li v-for="(ing, index) in recipe.ingredients" :key="index">
          {{ ing }}
        </li>
      </ul>

      <h3 class="text-xl font-bold mb-3">
        Шаги приготовления:
      </h3>

      <ol class="mb-6 list-decimal list-inside space-y-2">
        <li v-for="(step, index) in recipe.steps" :key="index" class="leading-relaxed">
          {{ step }}
        </li>
      </ol>

      <div class="flex gap-6 mb-6 text-sm opacity-80">
        <span>⏱ {{ recipe.cookingTimeMinutes }} мин</span>
        <span>📊 {{ difficultyLabel(recipe.difficulty) }}</span>
      </div>

      <h3 class="text-xl font-bold mb-3">
        Описание:
      </h3>

      <p class="mb-8 leading-relaxed">
        {{ recipe.description }}
      </p>

      <div class="flex gap-4 justify-between flex-wrap">
        <button
            class="btn btn-ghost"
            @click="router.push('/')"
        >
          Назад
        </button>

        <div class="flex gap-4">
          <button
              class="btn btn-primary"
              @click="router.push(`/edit/${recipe.id}`)"
          >
            Редактировать
          </button>

          <button
              class="btn btn-danger"
              @click="showDeleteModal = true"
          >
            Удалить
          </button>
        </div>
      </div>

      <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
        <div class="modal">
          <h3>Удалить рецепт?</h3>
          <p>Это действие нельзя отменить.</p>

          <div class="modal-actions">
            <button
                class="btn btn-ghost"
                @click="showDeleteModal = false"
            >
              Отмена
            </button>

            <button
                class="btn btn-danger"
                @click="removeRecipe"
            >
              Удалить
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>