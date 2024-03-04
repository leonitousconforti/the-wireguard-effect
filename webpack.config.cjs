const path = require("node:path");

module.exports = () => ({
    target: "node",
    mode: "production",
    resolve: { extensions: [".js"] },
    module: { parser: { javascript: { importMeta: false } } },
    entry: {
        expose: path.join(__dirname, "dist", "actions", "expose.js"),
        connect: path.join(__dirname, "dist", "actions", "connect.js"),
    },
    output: {
        module: true,
        libraryTarget: "module",
        chunkFormat: "module",
        path: path.join(__dirname, ".github", "actions", "workflow-level-service"),
        filename: `[name]${path.sep}[name].bundle.mjs`,
    },
    optimization: {
        minimize: false,
    },
    experiments: {
        outputModule: true,
    },
});
