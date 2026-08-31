import type { Config } from 'jest';

const config: Config = {
    testEnvironment: 'node',
    testMatch: ['**/*.spec.ts'],
    // @swc/jest transpila TypeScript sin depender de la API del compilador TS,
    // por eso funciona con TypeScript 7 (ts-jest aún no lo soporta)
    transform: {
        '^.+\\.tsx?$': ['@swc/jest', {
            jsc: {
                parser: {
                    syntax: 'typescript',
                    decorators: true,
                },
                target: 'es2022',
                keepClassNames: true,
            },
            module: {
                type: 'commonjs',
            },
        }],
    },
    // Resuelve imports con .js al final (patrón ESModules de NestJS/NodeNext)
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    // NestJS usa decoradores (@Injectable, etc.) que requieren reflect-metadata
    setupFiles: ['reflect-metadata'],
};

export default config;
