<script setup lang="ts">
import { useRouter } from "vue-router"

const router = useRouter()

const goHome = () => {
  router.push("/")
}
</script>

<template>
  <div class="min-h-screen p-8">
    <h1
        class="text-4xl font-bold text-center mb-10 cursor-pointer transition hover:opacity-80"
        @click="goHome"
    >
      🍲 Recipe Manager
    </h1>

    <router-view />
  </div>
</template>