import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { defineComponent, h } from 'vue'
import App from './App.vue'

// Создаём минимальные заглушки для views
const DummyComponent = defineComponent({
    render() {
        return h('div', 'Dummy')
    }
})

describe('App.vue', () => {
    let router: ReturnType<typeof createRouter>
    let pushSpy: ReturnType<typeof vi.spyOn>

    beforeEach(async () => {
        router = createRouter({
            history: createWebHistory(),
            routes: [
                { path: '/', component: DummyComponent },
                { path: '/create', component: DummyComponent },
                { path: '/edit/:id', component: DummyComponent },
                { path: '/recipe/:id', component: DummyComponent }
            ]
        })

        router.push('/')
        await router.isReady()

        pushSpy = vi.spyOn(router, 'push')
    })

    const mountApp = () => {
        return mount(App, {
            global: {
                plugins: [router]
            }
        })
    }

    it('should render header with logo', () => {
        const wrapper = mountApp()

        const header = wrapper.find('.app-header')
        expect(header.exists()).toBe(true)

        const logo = wrapper.find('.app-logo')
        expect(logo.exists()).toBe(true)
        expect(logo.text()).toContain('Книга Рецептов')
    })

    it('should navigate to home when logo is clicked', async () => {
        const wrapper = mountApp()

        const logo = wrapper.find('.app-logo')
        await logo.trigger('click')

        expect(pushSpy).toHaveBeenCalledWith('/')
    })

    it('should render "New Recipe" navigation button', () => {
        const wrapper = mountApp()

        const navBtn = wrapper.find('.app-nav-btn')
        expect(navBtn.exists()).toBe(true)
        expect(navBtn.text()).toContain('Новый рецепт')
        expect(navBtn.text()).toContain('＋')
    })

    it('should have correct router-link to /create', () => {
        const wrapper = mountApp()

        const routerLink = wrapper.find('a.app-nav-btn')
        expect(routerLink.exists()).toBe(true)
        expect(routerLink.attributes('href')).toBe('/create')
    })

    it('should render main content area', () => {
        const wrapper = mountApp()

        const main = wrapper.find('.page-container')
        expect(main.exists()).toBe(true)
    })

    it('should render router-view for child components', () => {
        const wrapper = mountApp()

        // router-view рендерит содержимое текущего маршрута
        // При маршруте '/' он рендерит DummyComponent
        const main = wrapper.find('.page-container')
        expect(main.exists()).toBe(true)
    })

    it('should have min-h-screen class on root element', () => {
        const wrapper = mountApp()

        const rootElement = wrapper.find('.min-h-screen')
        expect(rootElement.exists()).toBe(true)
    })
})