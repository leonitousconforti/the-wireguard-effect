// This is a workaround for https://github.com/eslint/eslint/issues/3458
require("@rushstack/eslint-config/patch/modern-module-resolution");

module.exports = {
    root: true,
    extends: [
        "@rushstack/eslint-config/profile/node",
        "@rushstack/eslint-config/mixins/tsdoc",
        "@rushstack/eslint-config/mixins/friendly-locals",
        "plugin:unicorn/recommended",
        "plugin:prettier/recommended",
    ],
    plugins: ["unicorn", "prettier"],
    env: { node: true, es2022: true },
    parserOptions: { ecmaVersion: 2022, sourceType: "module" },
    rules: {
        "no-console": "warn",
        "@typescript-eslint/typedef": "off",
        "unicorn/no-array-callback-reference": "off",
        "unicorn/no-array-method-this-argument": "off",
        "@typescript-eslint/naming-convention": [
            "error",
            { format: null, selector: "parameter", filter: { regex: "^_", match: false } },
        ],
    },
    overrides: [
        {
            files: ["src/index.ts"],
            rules: {
                "dot-notation": "off",
                "unicorn/switch-case-braces": "off",
                "unicorn/no-this-assignment": "off",
                "unicorn/consistent-function-scoping": "off",
                "@rushstack/security/no-unsafe-regexp": "off",
            },
        },
    ],
    ignorePatterns: ["dist/", ".eslintrc.cjs"],
};
