import * as ciInfo from "ci-info";
import * as execa from "execa";

describe("The bundled github actions should not have been been modified after building in CI", () => {
    it("should not have been modified", () => {
        if (ciInfo.isCI) {
            execa.execaCommandSync(
                "git diff --exit-code .github/actions/workflow-level-service/connect/connect.bundle.mjs .github/actions/workflow-level-service/expose/expose.bundle.mjs",
                {
                    stdio: "inherit",
                }
            );
        } else {
            expect(true).toBe(true);
        }
    });
});
