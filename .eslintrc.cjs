module.exports = {
    extends: [
        'plugin:@next/next/recommended',
        'plugin:jest/recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended'
    ],
    plugins: ['testing-library', 'jest', '@typescript-eslint'],
    overrides: [
        {
            files: ['**/?(*.)+(spec|test).[jt]s?(x)'],
            extends: ['plugin:testing-library/react'],
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
        'react/react-in-jsx-scope': 'off',
        'import/extensions': 'off',
        'no-console': ['warn', {allow: ['warn', 'error']}],
        'prettier/prettier': 'warn', // Optional: show Prettier violations as warnings
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
};
