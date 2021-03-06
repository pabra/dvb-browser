// http://eslint.org/docs/user-guide/configuring

module.exports = {
    root: true,
    parserOptions: {
        parser: "babel-eslint",
        sourceType: "module"
    },
    env: {
        browser: true
    },
    extends: ["plugin:vue/recommended", "airbnb-base"],
    plugins: ["compat", "vue"],
    // check if imports actually resolve
    settings: {
        "import/resolver": {
            webpack: {
                config: "build/webpack.base.conf.js"
            }
        }
    },
    // add your custom rules here
    rules: {
        // indent: [
        //     "error",
        //     2,
        //     {
        //         ignoredNodes: ["TemplateLiteral"]
        //     }
        // ],
        indent: 0,
        "prefer-object-spread": 0,
        "operator-linebreak": 0,
        "arrow-parens": 0,
        "object-curly-newline": 0,
        "max-classes-per-file": 0,
        "import/no-cycle": 0,
        "no-param-reassign": ["error", { props: false }],
        "vue/script-indent": [
            "error",
            4,
            {
                switchCase: 1,
                baseIndent: 1
            }
        ],
        "vue/html-indent": ["error", 4],
        // don't require .vue extension when importing
        "import/extensions": [
            "error",
            "always",
            {
                js: "never",
                vue: "never"
            }
        ],
        // allow optionalDependencies
        "import/no-extraneous-dependencies": [
            "error",
            {
                optionalDependencies: ["test/unit/index.js"]
            }
        ],
        // allow debugger during development
        "no-debugger": process.env.NODE_ENV === "production" ? 2 : 0
    }
};
