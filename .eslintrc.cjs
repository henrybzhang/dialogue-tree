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
