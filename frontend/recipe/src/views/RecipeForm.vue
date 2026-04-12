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
const imagePreview = ref<string | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

const difficulties: { label: string; value: Difficulty }[] = [
  { label: "🟢 Лёгкий", value: "EASY" },
  { label: "🟡 Средний", value: "MEDIUM" },
  { label: "🔴 Сложный", value: "HARD" }
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
    imagePreview.value = URL.createObjectURL(target.files[0])
  }
}

const removeImage = () => {
  imageFile.value = null
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value)
    imagePreview.value = null
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
    if (data.imageUrl) {
      imagePreview.value = data.imageUrl
    }
  } catch (e) {
    error.value = "Не удалось загрузить рецепт"
    console.error(e)
  }
}

onMounted(loadRecipe)
</script>

<template>
  <div class="page-container page-container--narrow">
    <div class="glass-card">
      <!-- Header -->
      <h2 class="detail-title" style="text-align: center; margin-bottom: 32px;">
        {{ isEdit ? '✏️ Редактировать рецепт' : '✨ Новый рецепт' }}
      </h2>

      <!-- Alerts -->
      <div v-if="error" class="alert alert--error">
        <span>⚠️</span>
        <span>{{ error }}</span>
      </div>

      <div v-if="success" class="alert alert--success">
        <span>✅</span>
        <span>Рецепт успешно сохранён!</span>
      </div>

      <!-- Basic info -->
      <div class="form-section">
        <div class="form-section__title">Основное</div>

        <label class="form-label">Название</label>
        <input v-model="recipe.title" placeholder="Например: Борщ по-украински" class="form-input" />
      </div>

      <!-- Ingredients -->
      <div class="form-section">
        <div class="form-section__title">Ингредиенты</div>

        <div class="form-list">
          <div v-for="(ing, index) in recipe.ingredients" :key="index" class="form-list__item">
            <input
                v-model="recipe.ingredients[index]"
                :placeholder="`Ингредиент ${index + 1}`"
                class="form-list__input"
            />
            <button class="form-list__remove" @click="removeIngredient(index)" :disabled="recipe.ingredients.length <= 1">
              ✕
            </button>
          </div>
        </div>

        <button class="form-list__add" @click="addIngredient">
          ＋ Добавить ингредиент
        </button>
      </div>

      <!-- Steps -->
      <div class="form-section">
        <div class="form-section__title">Шаги приготовления</div>

        <div class="form-list">
          <div v-for="(step, index) in recipe.steps" :key="index" class="form-list__item">
            <input
                v-model="recipe.steps[index]"
                :placeholder="`Шаг ${index + 1}`"
                class="form-list__input"
            />
            <button class="form-list__remove" @click="removeStep(index)" :disabled="recipe.steps.length <= 1">
              ✕
            </button>
          </div>
        </div>

        <button class="form-list__add" @click="addStep">
          ＋ Добавить шаг
        </button>
      </div>

      <!-- Description -->
      <div class="form-section">
        <div class="form-section__title">Описание</div>
        <textarea v-model="recipe.description" placeholder="Расскажите о вашем рецепте…" class="form-textarea" rows="4" />
      </div>

      <!-- Time & Difficulty -->
      <div class="form-section">
        <div class="form-section__title">Параметры</div>

        <div class="form-row">
          <div>
            <label class="form-label">Время (минуты)</label>
            <input v-model.number="recipe.cookingTimeMinutes" type="number" min="5" class="form-input" />
          </div>

          <div>
            <label class="form-label">Сложность</label>
            <select v-model="recipe.difficulty" class="form-select">
              <option v-for="d in difficulties" :key="d.value" :value="d.value">
                {{ d.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Image -->
      <div class="form-section">
        <div class="form-section__title">Фото</div>

        <div v-if="imagePreview" class="image-preview">
          <img :src="imagePreview" alt="Превью" class="image-preview__img" />
          <button class="image-preview__remove" @click="removeImage">
            ✕ Убрать
          </button>
        </div>

        <label v-else class="form-file">
          <input type="file" @change="handleFileChange" accept="image/*" />
          <div class="form-file__icon">📷</div>
          <div class="form-file__text">
            <strong>Нажмите для загрузки</strong> или перетащите файл
          </div>
        </label>
      </div>

      <!-- Submit -->
      <button class="btn btn--primary btn--lg btn--full" @click="save" :disabled="loading">
        {{ loading ? '⏳ Сохранение…' : (isEdit ? '💾 Сохранить изменения' : '✨ Создать рецепт') }}
      </button>
    </div>
  </div>
</template>
