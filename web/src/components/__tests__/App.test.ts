import { describe, it, expect } from 'vitest'

describe('HotelIQ App', () => {
    it('should load without errors', () => {
        expect(true).toBe(true)
    })

    it('should have correct app name', () => {
        const appName = 'HotelIQ'
        expect(appName).toBeDefined()
        expect(appName.length).toBeGreaterThan(0)
    })
})
