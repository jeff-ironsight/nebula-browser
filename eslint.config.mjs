import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'
import importPlugin from 'eslint-plugin-import'
import simpleImportSort from 'eslint-plugin-simple-import-sort'

export default tseslint.config(
    {
        name: 'register-plugins',
        plugins: {
            ['@typescript-eslint']: tseslint.plugin,
            ['import']: importPlugin,
            ['prettier']: prettierPlugin,
            ['simple-import-sort']: simpleImportSort,
        },
    },
    {
        name: 'global-ignores',
        // Replacement for `.eslintignore`
        ignores: [
            '*.!(ts)',
            'src/**/_*/*.ts',
            '.nx/',
            '.yarn/',
            '**/node_modules/**',
            '**/dist/**',
            '**/fixtures/**',
            '**/coverage/**',
            '**/config/**',
            '**/__snapshots__/**',
            '**/build/**',
            '.nx/*',
            '.yarn/*',
        ],
    },
    eslint.configs.recommended,
    tseslint.configs.strictTypeCheckedOnly,
    tseslint.configs.stylisticTypeCheckedOnly,
    prettierConfig,
    {
        name: 'base-config',
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
                warnOnUnsupportedTypeScriptVersion: false,
            },
        },
        rules: {
            //
            // off
            //
            'import/prefer-default-export': 'off',
            'import/no-named-export': 'off',
            //
            // typescript-eslint
            //
            '@typescript-eslint/array-type': [
                'error',
                {
                    default: 'array-simple',
                },
            ],
            '@typescript-eslint/await-thenable': 'error',
            '@typescript-eslint/ban-ts-comment': [
                'error',
                {
                    minimumDescriptionLength: 5,
                    'ts-check': false,
                    'ts-expect-error': 'allow-with-description',
                    'ts-ignore': true,
                    'ts-nocheck': true,
                },
            ],
            '@typescript-eslint/consistent-type-assertions': [
                'error',
                {
                    assertionStyle: 'as',
                },
            ],
            '@typescript-eslint/consistent-type-definitions': [
                'error',
                'interface',
            ],
            '@typescript-eslint/consistent-indexed-object-style': [
                'error',
                'record',
            ],
            '@typescript-eslint/consistent-type-exports': 'error',
            '@typescript-eslint/default-param-last': 'error',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-confusing-void-expression': [
                'error',
                {
                    ignoreVoidReturningFunctions: true,
                },
            ],
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-extra-non-null-assertion': 'error',
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/no-invalid-void-type': 'error',
            '@typescript-eslint/no-misused-promises': 'error',
            '@typescript-eslint/no-non-null-asserted-nullish-coalescing':
                'error',
            '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
            '@typescript-eslint/no-non-null-assertion': 'error',
            '@typescript-eslint/no-redundant-type-constituents': 'error',
            '@typescript-eslint/no-require-imports': [
                'error',
                {
                    allow: ['/package\\.json$'],
                },
            ],
            '@typescript-eslint/no-unnecessary-condition': [
                'error',
                {
                    allowConstantLoopConditions: true,
                    checkTypePredicates: true,
                },
            ],
            '@typescript-eslint/no-unnecessary-qualifier': 'error',
            '@typescript-eslint/no-unnecessary-type-assertion': 'error',
            '@typescript-eslint/no-unnecessary-type-conversion': 'error',
            '@typescript-eslint/no-unnecessary-type-parameters': 'error',
            '@typescript-eslint/no-unsafe-argument': 'error',
            '@typescript-eslint/no-unsafe-assignment': 'error',
            '@typescript-eslint/no-unsafe-call': 'error',
            '@typescript-eslint/no-unsafe-member-access': 'error',
            '@typescript-eslint/no-unsafe-return': 'error',
            '@typescript-eslint/no-unused-expressions': 'error',
            '@typescript-eslint/unbound-method': 'off',
            '@typescript-eslint/no-var-requires': 'error',
            '@typescript-eslint/prefer-literal-enum-member': [
                'error',
                {
                    allowBitwiseExpressions: true,
                },
            ],
            '@typescript-eslint/prefer-nullish-coalescing': [
                'error',
                {
                    ignoreConditionalTests: true,
                    ignorePrimitives: true,
                },
            ],
            '@typescript-eslint/member-ordering': 'error',

            '@typescript-eslint/require-await': 'error',
            //
            // eslint
            //
            curly: ['error', 'all'],
            eqeqeq: [
                'error',
                'always',
                {
                    null: 'never',
                },
            ],
            'space-infix-ops': 'error',
            'logical-assignment-operators': 'error',
            'no-console': 'error',
            'no-else-return': [
                'error',
                {
                    allowElseIf: false,
                },
            ],
            'no-implicit-coercion': [
                'error',
                {
                    boolean: false,
                },
            ],
            'no-lonely-if': 'error',
            'no-mixed-operators': 'error',
            'no-process-exit': 'error',
            'no-unreachable-loop': 'error',
            'no-useless-call': 'error',
            'no-useless-computed-key': 'error',
            'no-useless-concat': 'error',
            'no-var': 'error',
            'no-void': [
                'error',
                {
                    allowAsStatement: true,
                },
            ],
            'object-shorthand': 'error',
            'one-var': ['error', 'never'],
            'operator-assignment': 'error',
            'prefer-arrow-callback': 'error',
            'prefer-const': 'error',
            'prefer-object-has-own': 'error',
            'prefer-object-spread': 'error',
            'prefer-rest-params': 'error',
            'prefer-template': 'error',
            quotes: ['error', 'single'],
            radix: 'error',
            //
            // typescript-eslint override
            //
            'no-shadow': 'off',
            '@typescript-eslint/no-shadow': [
                'error',
                {
                    ignoreTypeValueShadow: true,
                    ignoreFunctionTypeParameterNameValueShadow: true,
                },
            ],
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    caughtErrors: 'all',
                    varsIgnorePattern: '^_',
                },
            ],
            //
            // eslint-plugin-import
            //
            'import/consistent-type-specifier-style': 'error',
            'import/first': 'error',
            'import/newline-after-import': 'error',
            'import/no-absolute-path': 'error',
            'import/no-amd': 'error',
            'import/no-default-export': 'error',
            'import/no-duplicates': 'error',
            'import/no-extraneous-dependencies': [
                'error',
                {
                    devDependencies: true,
                    optionalDependencies: false,
                    peerDependencies: true,
                },
            ],
            'import/no-mutable-exports': 'error',
            'import/no-named-default': 'error',
            'import/no-self-import': 'error',
            'simple-import-sort/imports': 'error',
            'simple-import-sort/exports': 'error',
        },
    },
    {
        name: 'dts-overrides',
        files: ['**/*.d.ts'],
        rules: {
            'import/no-default-export': 'off',
        },
    },
)
