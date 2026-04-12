<script setup lang="ts">
import { useRouter } from "vue-router"

const router = useRouter()

const goHome = () => {
  router.push("/")
}
</script>

<template>
  <div class="min-h-screen">
    <header class="app-header">
      <div class="app-logo" @click="goHome">🍲 Книга Рецептов</div>
      <router-link to="/create" class="app-nav-btn">
        <span>＋</span> Новый рецепт
      </router-link>
    </header>

    <main class="page-container">
      <router-view />
    </main>
  </div>
</template>
