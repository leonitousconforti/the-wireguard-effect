module.exports.runAsync = async function () {
    const exec = await import("execa");
    exec.execaCommandSync("./build.bash", { cwd: __dirname });
};
