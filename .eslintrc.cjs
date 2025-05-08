module.exports = {
    extends: [
        'plugin:@next/next/recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended'
    ],
    plugins: ['@typescript-eslint'],
    overrides: [
        {
            files: ['**/?(*.)+(spec|test).[jt]s?(x)'],
        },
    ],
    parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    rules: {
        'react/react-in-jsx-scope': 'off', // allow React to be used without importing
        'import/extensions': 'off', // allow imports without extensions
        'no-console': ['warn', {allow: ['warn', 'error']}], // allow console.warn and console.error
        'prettier/prettier': 'warn', // Optional: show Prettier violations as warnings
        '@typescript-eslint/no-explicit-any': 'warn', // flag lazy typing
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }], // ignore intentionally unused variables
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
};
