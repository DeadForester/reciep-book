import { createRouter, createWebHistory } from "vue-router"
import RecipeList from "@/views/RecipeList.vue"
import RecipeForm from "@/views/RecipeForm.vue"
import RecipeDetails from "@/views/RecipeDetails.vue"

const routes = [
    { path: "/", component: RecipeList },
    { path: "/create", component: RecipeForm },
    { path: "/edit/:id", component: RecipeForm },
    { path: "/recipe/:id", component: RecipeDetails }
]

export default createRouter({
    history: createWebHistory(),
    routes
})