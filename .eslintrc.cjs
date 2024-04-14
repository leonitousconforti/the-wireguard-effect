/* eslint-disable no-undef */
module.exports = {
    ignorePatterns: ["dist", "*.mjs", "docs", "*.md", "submodules", "build"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: "module",
    },
    settings: {
        "import/parsers": {
            "@typescript-eslint/parser": [".ts", ".tsx"],
        },
        "import/resolver": {
            typescript: {
                alwaysTryTypes: true,
            },
        },
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@effect/recommended",
    ],
    plugins: ["deprecation", "import", "sort-destructure-keys", "codegen"],
    rules: {
        "no-case-declarations": "off",
        "codegen/codegen": "error",
        "object-shorthand": "error",
        "import/newline-after-import": "error",
        "import/no-duplicates": "error",
        "import/no-unresolved": "off",
        "sort-destructure-keys/sort-destructure-keys": "error",
        "@typescript-eslint/array-type": ["warn", { default: "generic", readonly: "generic" }],
        "@typescript-eslint/consistent-type-imports": "off",
        "@typescript-eslint/no-unused-vars": [
            "error",
            {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
            },
        ],
        "@effect/dprint": "off",
    },
};
