import * as ciInfo from "ci-info";
import * as execa from "execa";

describe("The bundled github actions should not have been been modified after building in CI", () => {
    it("should not have been modified", () => {
        if (ciInfo.isCI) {
            execa.execaCommandSync("git diff --exit-code .github/", { stdio: "inherit" });
        } else {
            expect(true).toBe(true);
        }
    });
});
