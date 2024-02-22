module.exports.runAsync = async function () {
    console.log("[build:wireguard-go] Building wireguard-go...");
    const exec = await import("execa");
    exec.execaCommandSync("./build.bash", { cwd: __dirname });
};
