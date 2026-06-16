import { describe, it, expect } from 'vitest'
import router from './index'

describe('Router Configuration', () => {
    it('should have 4 routes defined', () => {
        const routes = router.getRoutes()
        expect(routes.length).toBe(4)
    })

    it('should have "/" route', async () => {
        await router.push('/')
        await router.isReady()
        expect(router.currentRoute.value.path).toBe('/')
    })

    it('should have "/create" route', async () => {
        await router.push('/create')
        await router.isReady()
        expect(router.currentRoute.value.path).toBe('/create')
    })

    it('should have "/edit/:id" route with parameter', async () => {
        await router.push('/edit/123')
        await router.isReady()
        expect(router.currentRoute.value.path).toBe('/edit/123')
        expect(router.currentRoute.value.params.id).toBe('123')
    })

    it('should have "/recipe/:id" route with parameter', async () => {
        await router.push('/recipe/456')
        await router.isReady()
        expect(router.currentRoute.value.path).toBe('/recipe/456')
        expect(router.currentRoute.value.params.id).toBe('456')
    })

    it('should navigate between routes correctly', async () => {
        await router.push('/')
        await router.isReady()
        expect(router.currentRoute.value.path).toBe('/')

        await router.push('/create')
        await router.isReady()
        expect(router.currentRoute.value.path).toBe('/create')

        await router.push('/edit/789')
        await router.isReady()
        expect(router.currentRoute.value.params.id).toBe('789')

        await router.push('/recipe/999')
        await router.isReady()
        expect(router.currentRoute.value.params.id).toBe('999')
    })
})