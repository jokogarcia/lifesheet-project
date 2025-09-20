import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility function', () => {
    it('should merge class names correctly', () => {
        const result = cn('px-4', 'py-2', 'bg-blue-500');
        expect(result).toBe('px-4 py-2 bg-blue-500');
    });

    it('should handle conditional classes', () => {
        const isActive = true;
        const result = cn('base-class', isActive && 'active-class');
        expect(result).toBe('base-class active-class');
    });

    it('should handle falsy values', () => {
        const isActive = false;
        const result = cn('base-class', isActive && 'active-class');
        expect(result).toBe('base-class');
    });

    it('should merge conflicting Tailwind classes', () => {
        const result = cn('px-4', 'px-2');
        expect(result).toBe('px-2');
    });

    it('should handle empty inputs', () => {
        const result = cn();
        expect(result).toBe('');
    });

    it('should handle undefined and null values', () => {
        const result = cn('base-class', undefined, null, 'other-class');
        expect(result).toBe('base-class other-class');
    });
});
