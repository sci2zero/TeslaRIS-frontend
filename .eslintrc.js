module.exports = {
    env: {
        node: true,
    },
    extends: ["eslint:recommended", "plugin:vue/vue3-recommended"],
    rules: {
        "vue/html-indent": ["error", 4],
        "vue/max-attributes-per-line": [
            "error",
            {
                singleline: 4,
                multiline: 4,
            },
        ],
        "vue/html-closing-bracket-newline": "off",
        "vue/html-self-closing": "off",
    },
    parserOptions: {
        sourceType: "module",
        ecmaVersion: 2020,
    },
};
