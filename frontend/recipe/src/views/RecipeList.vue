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
    <div v-if="loading" class="text-center mb-6">
      Загрузка...
    </div>

    <div v-else-if="error" class="text-center mb-6 text-red-400">
      {{ error }}
      <button class="btn btn-ghost ml-4" @click="loadRecipes">
        Повторить
      </button>
    </div>

    <div v-else-if="recipes.length === 0" class="text-center mb-6 opacity-70">
      Рецептов пока нет. Создайте первый!
    </div>

    <!-- СЕТКА -->
    <div v-else class="grid md:grid-cols-3 gap-6">
      <div
          v-for="recipe in recipes"
          :key="recipe.id"
          class="bg-white/10 p-6 rounded-xl backdrop-blur-md transition hover:-translate-y-1 hover:shadow-xl"
      >
        <img
            v-if="recipe.imageUrl"
            :src="recipe.imageUrl"
            :alt="recipe.title"
            class="recipe-image rounded-lg mb-4 w-full object-cover"
        />

        <h2
            class="recipe-title cursor-pointer"
            @click="router.push(`/recipe/${recipe.id}`)"
        >
          {{ recipe.title }}
        </h2>

        <p class="mt-2 text-sm opacity-70 line-clamp-2">
          {{ recipe.description }}
        </p>
      </div>
    </div>

    <div class="text-center mt-10">
      <button
          class="btn btn-primary"
          @click="router.push('/create')"
      >
        + Добавить рецепт
      </button>
    </div>

    <div class="flex justify-center gap-6 mt-8">

      <button
          v-if="page > 0"
          class="btn btn-ghost"
          @click="prevPage"
      >
        ← Предыдущая
      </button>

      <button
          v-if="page < totalPages - 1"
          class="btn btn-ghost"
          @click="nextPage"
      >
        Следующая →
      </button>

    </div>
  </div>
</template>