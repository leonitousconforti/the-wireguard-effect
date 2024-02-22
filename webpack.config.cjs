const path = require("node:path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = () => ({
    target: "node",
    mode: "production",
    resolve: { extensions: [".js", ".json"] },
    entry: {
        expose: path.join(__dirname, "dist", "actions", "expose.js"),
        connect: path.join(__dirname, "dist", "actions", "connect.js"),
    },
    output: {
        path: path.join(__dirname, ".github", "actions", "workflow-level-service"),
        filename: `[name]${path.sep}[name].cjs`,
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                extractComments: false,
            }),
        ],
    },
});
