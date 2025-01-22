import * as path from 'path';
import { runTests } from 'vscode-test';

async function main() {
  try {
    // The folder containing the extension's `package.json`
    const extensionDevelopmentPath = path.resolve(__dirname, '../../');

    // The path to the test runner script
    const extensionTestsPath = path.resolve(__dirname, './index');

    // Download VS Code, unzip it, and run the integration test
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
    });
  } catch (err) {
    console.error('Failed to run tests:', err);
    process.exit(1);
  }
}

main();
