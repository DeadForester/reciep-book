<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import { recipeService } from "../services/recipeService"
import type { Recipe } from "../types/recipe"

const route = useRoute()
const router = useRouter()

const recipe = ref<Recipe | null>(null)
const loading = ref(false)

const showDeleteModal = ref(false)

const loadRecipe = async () => {
  loading.value = true
  try {
    recipe.value = await recipeService.getById(route.params.id as string)
  } finally {
    loading.value = false
  }
}

const removeRecipe = async () => {
  if (!recipe.value) return
  await recipeService.delete(recipe.value.id)
  router.push("/")
}

onMounted(loadRecipe)
</script>

<template>
  <div v-if="loading" class="text-center mt-10">
    Загрузка...
  </div>

  <div
      v-if="recipe"
      class="max-w-3xl mx-auto bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg"
  >
    <img
        v-if="recipe.imageUrl"
        :src="recipe.imageUrl"
        class="max-h-96 mx-auto rounded-xl mb-6"
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

    <div v-if="showDeleteModal" class="modal-overlay">
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
</template>