module.exports = {
    env: {
        node: true,
        es2022: true,
    },
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
    },
    ignorePatterns: ['node_modules/'],
    rules: {
        'no-unused-vars': 'warn',
        'no-undef': 'error',
        'no-console': 'off',
        'eqeqeq': 'error',
        'no-var': 'error',
        'prefer-const': 'warn',
    },
    overrides: [
        {
            // browser-side scripts served as static files
            files: ['public/logIn.js', 'public/newUserInfo.js'],
            env: {
                browser: true,
                node: false,
            },
        },
        {
            // Jest test files
            files: ['testing/**/*.js'],
            env: {
                jest: true,
            },
        },
    ],
};
