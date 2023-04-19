module.exports = {
    parser: "babel-eslint",
    env: {
      node: true,
    },
    extends: [
      'eslint:recommended',
      'plugin:vue/vue3-recommended',
    ],
    rules: {
      // override/add rules settings here, such as:
      // 'vue/no-unused-vars': 'error'
    },
    "parserOptions": {
        "sourceType": "module",
        "ecmaVersion": 2020
    }
  }