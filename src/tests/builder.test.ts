import { describe, it, expect } from 'vitest';
import { createBuilder } from '../Builder.js';
import { z } from '../index.js';

const TestSchema = z.object({
    name: z.string(),
    age: z.number().min(0),
    email: z.string().email(),
});

describe('Builder - Validation Caching', () => {
    it('caches a successful validation and reuses the result for the same value', () => {
        const builder = createBuilder(TestSchema);
        builder.setAge(30);
        builder.setAge(30);

        expect((builder as any).validationCache.size).toBe(1);
        expect((builder as any).validationCache.get('age')?.success).toBe(true);
    });

    it('updates the cache when a field value changes', () => {
        const builder = createBuilder(TestSchema);
        builder.setAge(25);
        builder.setAge(35);

        expect((builder as any).validationCache.size).toBe(1);
        expect((builder as any).validationCache.get('age')?.value).toBe(35);
    });

    it('throws an error from cache when validation fails again on the same value', () => {
        const builder = createBuilder(TestSchema);
        try {
            builder.setAge(-1);
        } catch (e) {}

        expect(() => builder.setAge(-1)).toThrow('Validation error for age');
    });

    it('clears the cache when the schema validation fails on any new value', () => {
        const builder = createBuilder(TestSchema);
        builder.setAge(30);
        
        try {
            builder.setAge(-10);
        } catch (e) {}

        expect((builder as any).validationCache.size).toBe(0);
    });

    it('does not cache successful validation for different fields', () => {
        const builder = createBuilder(TestSchema);
        builder.setName('Alice');
        builder.setAge(30);
        builder.setEmail('alice@example.com');

        expect((builder as any).validationCache.size).toBe(3);
    });
});

describe('Builder - Build Method', () => {
    it('returns a data object if all schema validations pass', () => {
        const builder = createBuilder(TestSchema)
            .setName('Alice')
            .setAge(25)
            .setEmail('alice@example.com');

        const result = builder.build();
        expect(result).toEqual({ name: 'Alice', age: 25, email: 'alice@example.com' });
    });

    it('throws an error if build is called with missing required fields', () => {
        const builder = createBuilder(TestSchema).setName('Alice');
        expect(() => builder.build()).toThrow();
    });

    it('throws an error if build is called after setting an invalid field', () => {
        const builder = createBuilder(TestSchema)
            .setName('Alice')
            .setEmail('invalid-email');

        expect(() => builder.build()).toThrow('Validation error for email');
    });

    it('rethrows errors for different fields if previous validations failed', () => {
        const builder = createBuilder(TestSchema);

        try {
            builder.setAge(-5);
        } catch (e) {}

        builder.setName('Bob');
        builder.setEmail('bob@example.com');

        expect(() => builder.build()).toThrow('Validation error for age');
    });

    it('allows building with valid values after correcting a previous invalid value', () => {
        const builder = createBuilder(TestSchema);
        builder.setName('Alice');

        try {
            builder.setAge(-1);
        } catch (e) {}

        builder.setAge(30);
        builder.setEmail('alice@example.com');

        const result = builder.build();
        expect(result).toEqual({ name: 'Alice', age: 30, email: 'alice@example.com' });
    });

    it('correctly throws an error when an invalid email is set', () => {
        const builder = createBuilder(TestSchema).setName('Alice').setAge(25);
        
        expect(() => builder.setEmail('not-an-email')).toThrow('Validation error for email');
    });

    it('handles multiple invalid fields and throws appropriate errors', () => {
        const builder = createBuilder(TestSchema);
        
        try {
            builder.setAge(-10);
        } catch (e) {}

        try {
            builder.setEmail('invalid-email');
        } catch (e) {}

        expect(() => builder.build()).toThrow('Validation error for age');
    });
    
    it('should throw appropriate error messages for invalid fields in development mode', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';

        const builder = createBuilder(TestSchema).setName('Alice');
        
        expect(() => builder.setEmail('invalid-email')).toThrow('Validation error for email');
        
        process.env.NODE_ENV = originalEnv;
    });
});
