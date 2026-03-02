<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import { recipeService } from "@/services/recipeService"
import type { RecipeRequest } from "@/types/recipe"

const route = useRoute()
const router = useRouter()
const isEdit = route.params.id as string | undefined

const recipe = ref<RecipeRequest>({
  title: "",
  description: "",
  ingredients: []
})

const imageFile = ref<File | null>(null)
const loading = ref(false)

const addIngredient = () => {
  recipe.value.ingredients.push("")
}

const removeIngredient = (index: number) => {
  recipe.value.ingredients.splice(index, 1)
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    imageFile.value = target.files[0]
  }
}

const save = async () => {
  loading.value = true
  try {
    let saved
    if (isEdit) {
      saved = await recipeService.update(isEdit, recipe.value)
    } else {
      saved = await recipeService.create(recipe.value)
    }

    if (imageFile.value) {
      await recipeService.uploadImage(saved.id, imageFile.value)
    }

    router.push("/")
  } finally {
    loading.value = false
  }
}

const loadRecipe = async () => {
  if (!isEdit) return
  const data = await recipeService.getById(isEdit)
  recipe.value = {
    title: data.title,
    description: data.description,
    ingredients: data.ingredients
  }
}

onMounted(loadRecipe)
</script>

<template>
  <div class="card" style="max-width: 700px; margin: 40px auto;">
    <h2 style="font-size: 28px; margin-bottom: 24px;">
      {{ isEdit ? "Редактировать рецепт" : "Создать рецепт" }}
    </h2>

    <input v-model="recipe.title" placeholder="Название рецепта" class="input" />

    <h3 style="margin-bottom: 10px;">Ингредиенты</h3>

    <div v-for="(ing, index) in recipe.ingredients" :key="index" style="display:flex; gap:10px;">
      <input v-model="recipe.ingredients[index]" class="input" />
      <button class="button button-danger" @click="removeIngredient(index)">
        ✕
      </button>
    </div>

    <button class="button button-secondary" @click="addIngredient">
      + Добавить ингредиенты
    </button>

    <h3 style="margin: 24px 0 10px;">Описание</h3>

    <textarea v-model="recipe.description" class="input" rows="4"></textarea>

    <input type="file" @change="handleFileChange" class="input" />

    <button class="button button-primary" @click="save" style="width:100%; margin-top:20px;">
      {{ loading ? "Сохранение..." : "Сохранение изменения" }}
    </button>
  </div>
</template>