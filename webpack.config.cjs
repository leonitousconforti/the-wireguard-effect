const path = require("node:path");

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
        minimize: false,
    },
});
