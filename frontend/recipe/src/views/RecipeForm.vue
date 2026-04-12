<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import { recipeService } from "@/services/recipeService"
import type { RecipeRequest, Difficulty } from "@/types/recipe"

const route = useRoute()
const router = useRouter()
const isEdit = route.params.id as string | undefined

const recipe = ref<RecipeRequest>({
  title: "",
  description: "",
  ingredients: [""],
  steps: [""],
  cookingTimeMinutes: 15,
  difficulty: "EASY"
})

const imageFile = ref<File | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

const difficulties: { label: string; value: Difficulty }[] = [
  { label: "Лёгкий", value: "EASY" },
  { label: "Средний", value: "MEDIUM" },
  { label: "Сложный", value: "HARD" }
]

const addIngredient = () => {
  recipe.value.ingredients.push("")
}

const removeIngredient = (index: number) => {
  recipe.value.ingredients.splice(index, 1)
}

const addStep = () => {
  recipe.value.steps.push("")
}

const removeStep = (index: number) => {
  recipe.value.steps.splice(index, 1)
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files?.[0]) {
    imageFile.value = target.files[0]
  }
}

const validate = (): boolean => {
  if (!recipe.value.title.trim()) {
    error.value = "Название рецепта обязательно"
    return false
  }
  if (!recipe.value.description.trim()) {
    error.value = "Описание обязательно"
    return false
  }
  const nonEmptyIngredients = recipe.value.ingredients.filter(i => i.trim())
  if (nonEmptyIngredients.length === 0) {
    error.value = "Добавьте хотя бы один ингредиент"
    return false
  }
  const nonEmptySteps = recipe.value.steps.filter(s => s.trim())
  if (nonEmptySteps.length === 0) {
    error.value = "Добавьте хотя бы один шаг приготовления"
    return false
  }
  if (recipe.value.cookingTimeMinutes < 5) {
    error.value = "Время приготовления должно быть не менее 5 минут"
    return false
  }
  return true
}

const save = async () => {
  error.value = null
  if (!validate()) return

  loading.value = true
  try {
    const cleanedRecipe: RecipeRequest = {
      title: recipe.value.title.trim(),
      description: recipe.value.description.trim(),
      ingredients: recipe.value.ingredients.filter(i => i.trim()),
      steps: recipe.value.steps.filter(s => s.trim()),
      cookingTimeMinutes: recipe.value.cookingTimeMinutes,
      difficulty: recipe.value.difficulty
    }

    let saved
    if (isEdit) {
      saved = await recipeService.update(isEdit, cleanedRecipe)
    } else {
      saved = await recipeService.create(cleanedRecipe)
    }

    if (imageFile.value) {
      await recipeService.uploadImage(saved.id, imageFile.value)
    }

    success.value = true
    setTimeout(() => router.push("/"), 500)
  } catch (e: unknown) {
    const axiosError = e as { response?: { status?: number; data?: unknown } }
    const status = axiosError.response?.status
    const data = axiosError.response?.data

    if (status === 404) {
      error.value = "Сервер не найден. Убедитесь, что бэкенд запущен на порту 8080."
    } else if (status === 400 && data && typeof data === 'object') {
      const errors = Object.values(data as Record<string, string>).join("; ")
      error.value = `Ошибка валидации: ${errors}`
    } else {
      error.value = isEdit
        ? "Не удалось обновить рецепт. Попробуйте позже."
        : "Не удалось создать рецепт. Попробуйте позже."
    }
    console.error(e)
  } finally {
    loading.value = false
  }
}

const loadRecipe = async () => {
  if (!isEdit) return
  try {
    const data = await recipeService.getById(isEdit)
    recipe.value = {
      title: data.title,
      description: data.description,
      ingredients: data.ingredients.length > 0 ? data.ingredients : [""],
      steps: data.steps?.length > 0 ? data.steps : [""],
      cookingTimeMinutes: data.cookingTimeMinutes || 15,
      difficulty: data.difficulty || "EASY"
    }
  } catch (e) {
    error.value = "Не удалось загрузить рецепт"
    console.error(e)
  }
}

onMounted(loadRecipe)
</script>

<template>
  <div class="card" style="max-width: 700px; margin: 40px auto;">
    <h2 style="font-size: 28px; margin-bottom: 24px;">
      {{ isEdit ? "Редактировать рецепт" : "Создать рецепт" }}
    </h2>

    <div v-if="error" class="text-red-400 mb-4 p-3 bg-red-500/10 rounded-lg">
      {{ error }}
    </div>

    <div v-if="success" class="text-green-400 mb-4 p-3 bg-green-500/10 rounded-lg">
      Рецепт успешно сохранён!
    </div>

    <label class="block mb-2 text-sm opacity-70">Название</label>
    <input v-model="recipe.title" placeholder="Название рецепта" class="input" />

    <h3 style="margin-bottom: 10px;">Ингредиенты</h3>

    <div v-for="(ing, index) in recipe.ingredients" :key="index" style="display:flex; gap:10px; align-items: center;">
      <input v-model="recipe.ingredients[index]" :placeholder="`Ингредиент ${index + 1}`" class="input" style="margin-bottom: 12px;" />
      <button class="button button-danger" @click="removeIngredient(index)" :disabled="recipe.ingredients.length <= 1">
        ✕
      </button>
    </div>

    <button class="button button-secondary" @click="addIngredient">
      + Добавить ингредиент
    </button>

    <h3 style="margin: 24px 0 10px;">Шаги приготовления</h3>

    <div v-for="(step, index) in recipe.steps" :key="index" style="display:flex; gap:10px; align-items: center;">
      <input v-model="recipe.steps[index]" :placeholder="`Шаг ${index + 1}`" class="input" style="margin-bottom: 12px;" />
      <button class="button button-danger" @click="removeStep(index)" :disabled="recipe.steps.length <= 1">
        ✕
      </button>
    </div>

    <button class="button button-secondary" @click="addStep">
      + Добавить шаг
    </button>

    <h3 style="margin: 24px 0 10px;">Описание</h3>

    <textarea v-model="recipe.description" placeholder="Описание рецепта" class="input" rows="4"></textarea>

    <label class="block mb-2 text-sm opacity-70">Время приготовления (минуты)</label>
    <input v-model.number="recipe.cookingTimeMinutes" type="number" min="5" class="input" />

    <label class="block mb-2 text-sm opacity-70">Сложность</label>
    <select v-model="recipe.difficulty" class="input">
      <option v-for="d in difficulties" :key="d.value" :value="d.value">
        {{ d.label }}
      </option>
    </select>

    <label class="block mb-2 text-sm opacity-70">Изображение</label>
    <input type="file" @change="handleFileChange" class="input" accept="image/*" />

    <button class="button button-primary" @click="save" style="width:100%; margin-top:20px;" :disabled="loading">
      {{ loading ? "Сохранение..." : (isEdit ? "Сохранить изменения" : "Создать рецепт") }}
    </button>
  </div>
</template>