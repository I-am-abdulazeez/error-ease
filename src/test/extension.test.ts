import * as assert from 'assert';
import * as vscode from 'vscode';
import { activate, deactivate } from '../extension';
import { getSelectedLanguage } from '../settings';
import { matchErrorPattern } from '../match-err-pattern';
import * as path from 'path';

// Mock vscode.ExtensionContext
class MockExtensionContext implements vscode.ExtensionContext {
  subscriptions: vscode.Disposable[] = [];
  workspaceState: vscode.Memento & { setKeysForSync(keys: readonly string[]): void } = {
    get: () => undefined,
    update: () => Promise.resolve(),
    setKeysForSync: () => { }, // Required for newer VS Code versions
    keys: () => [], // Add the `keys` method
  };
  globalState: vscode.Memento & { setKeysForSync(keys: readonly string[]): void } = {
    get: () => undefined,
    update: () => Promise.resolve(),
    setKeysForSync: () => { }, // Required for newer VS Code versions
    keys: () => [], // Add the `keys` method
  };
  secrets: vscode.SecretStorage = {
    get: () => Promise.resolve(undefined),
    store: () => Promise.resolve(),
    delete: () => Promise.resolve(),
    onDidChange: () => ({ dispose: () => { } }),
  };
  extensionPath: string = '';
  storagePath: string | undefined = '';
  globalStoragePath: string = '';
  logPath: string = '';
  extensionUri: vscode.Uri = vscode.Uri.parse('file:///mock-extension');
  storageUri: vscode.Uri | undefined = undefined;
  globalStorageUri: vscode.Uri = vscode.Uri.parse('file:///mock-global-storage');
  logUri: vscode.Uri = vscode.Uri.parse('file:///mock-log'); // Add logUri
  extension: vscode.Extension<any> = {
    id: 'mock-extension',
    extensionUri: vscode.Uri.parse('file:///mock-extension'),
    extensionPath: '',
    isActive: true,
    packageJSON: {},
    exports: {},
    activate: () => Promise.resolve(),
    extensionKind: vscode.ExtensionKind.UI, // Add this property
  };
  environmentVariableCollection: vscode.GlobalEnvironmentVariableCollection = {} as vscode.GlobalEnvironmentVariableCollection;
  extensionMode: vscode.ExtensionMode = vscode.ExtensionMode.Production;
  languageModelAccessInformation: vscode.LanguageModelAccessInformation = {
    onDidChange: () => ({ dispose: () => { } }),
    canSendRequest: () => true,
  };

  // Implement asAbsolutePath
  asAbsolutePath(relativePath: string): string {
    return path.join(this.extensionPath, relativePath);
  }
}

describe('Extension Tests', () => {
  let context: vscode.ExtensionContext;

  beforeEach(() => {
    // Initialize a mock extension context
    context = new MockExtensionContext();
  });

  afterEach(() => {
    // Clean up after each test
    deactivate();
  });

  it('should activate the extension', () => {
    // Activate the extension
    activate(context);

    // Check if the hover provider is registered
    assert.strictEqual(context.subscriptions.length, 1, 'Hover provider should be registered');
  });

  it('should translate error messages based on selected language', () => {
    // Mock diagnostics
    const errorMessage = "Cannot find name 'x'";
    const diagnostics: vscode.Diagnostic[] = [
      {
        message: errorMessage,
        range: new vscode.Range(0, 0, 0, 10),
        severity: vscode.DiagnosticSeverity.Error,
      },
    ];

    const document = {
      uri: vscode.Uri.parse('file:///test.ts'),
      fileName: 'test.ts',
      isUntitled: false,
      languageId: 'typescript',
      version: 1,
      isDirty: false,
      isClosed: false,
      save: () => Promise.resolve(true),
      eol: vscode.EndOfLine.LF,
      lineCount: 1,
      getText: () => '',
      getWordRangeAtPosition: () => undefined,
      validateRange: (range: vscode.Range) => range,
      validatePosition: (position: vscode.Position) => position,
      lineAt: (line: number) => ({
        lineNumber: line,
        text: '',
        range: new vscode.Range(line, 0, line, 0),
        rangeIncludingLineBreak: new vscode.Range(line, 0, line, 0),
        firstNonWhitespaceCharacterIndex: 0,
        isEmptyOrWhitespace: true,
      }),
      offsetAt: () => 0,
      positionAt: () => new vscode.Position(0, 0),
      getTextInRange: () => '',
    } as unknown as vscode.TextDocument; // Use type assertion

    // Mock position
    const position = new vscode.Position(0, 5);

    // Mock getDiagnostics
    const originalGetDiagnostics = vscode.languages.getDiagnostics;
    (vscode.languages.getDiagnostics as any) = (uri: vscode.Uri) => {
      if (uri.toString() === document.uri.toString()) {
        return diagnostics; // Return diagnostics for the specific URI
      }
      return []; // Return an empty array for other URIs
    };
    // Activate the extension
    activate(context);

    // Mock getSelectedLanguage to return 'Yoruba'
    const originalGetSelectedLanguage = getSelectedLanguage;
    (getSelectedLanguage as any) = () => 'Yoruba';

    // Mock matchErrorPattern to return a translated message
    const originalMatchErrorPattern = matchErrorPattern;
    (matchErrorPattern as any) = () => "A ko le ri oruko 'x'.";

    // Trigger the hover provider
    const hoverProvider = context.subscriptions[0] as vscode.Disposable;
    const hover = (hoverProvider as any).provideHover(document, position);

    // Check if the hover content is correct
    assert.strictEqual(
      hover?.contents[0].value,
      "### 🛠️ **Error Ease Translation**\n\nA ko le ri oruko 'x'.",
      'Hover content should match the translated message'
    );

    // Restore mocks
    vscode.languages.getDiagnostics = originalGetDiagnostics;
    (getSelectedLanguage as any) = originalGetSelectedLanguage;
    (matchErrorPattern as any) = originalMatchErrorPattern;
  });

  it('should handle configuration changes', () => {
    // Activate the extension
    activate(context);

    // Mock configuration change event
    const event: vscode.ConfigurationChangeEvent = {
      affectsConfiguration: (section: string) => section === 'errorEase.language',
    };

    // Trigger the configuration change handler
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('errorEase.language')) {
        const selectedLanguage = vscode.workspace
          .getConfiguration('errorEase')
          .get<string>('language', 'SimpleEnglish');
        console.log(`Language changed to: ${selectedLanguage}`);
      }
    });

    // Simulate a configuration change
    vscode.workspace.getConfiguration('errorEase').update('language', 'Pidgin', true);

    // Check if the hover provider is re-registered
    assert.strictEqual(context.subscriptions.length, 1, 'Hover provider should be re-registered');
  });
});
