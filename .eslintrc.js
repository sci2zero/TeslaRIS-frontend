module.exports = {
    env: {
        node: true,
    },
    extends: ["eslint:recommended", "plugin:vue/vue3-recommended", "@vue/typescript/recommended"],
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
        "@typescript-eslint/no-explicit-any": "off", // Disable the rule after we figure how to bypass any for some types
    },
    parserOptions: {
        parser: "@typescript-eslint/parser",
        sourceType: "module",
        ecmaVersion: 2020,
    },
};