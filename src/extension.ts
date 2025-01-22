import * as vscode from 'vscode';

import { getHoverContent } from './hover-content';
import { getSelectedLanguage } from './settings';

import { matchErrorPattern } from './match-err-pattern';


export function activate(context: vscode.ExtensionContext) {
  let hoverProvider: vscode.Disposable | undefined;

  function registerHoverProvider() {
    if (hoverProvider) {
      hoverProvider.dispose(); // Dispose the old provider, when the language is changed -- Be like refresh
    }

    // If you want to contribute, you can add more languages here, translations.json file, types.ts file, settings.ts file and package.json file.
    hoverProvider = vscode.languages.registerHoverProvider(['typescript', 'javascript'], {
      provideHover(document, position) {
        const selectedLanguage = getSelectedLanguage();
        const diagnostics = vscode.languages.getDiagnostics(document.uri);
        const diagnostic = diagnostics.find((diag) => diag.range.contains(position));

        if (diagnostic) {
          const errorMessage = diagnostic.message;
          const translatedMessage = matchErrorPattern(errorMessage, selectedLanguage, context);

          if (translatedMessage) {
            return new vscode.Hover(getHoverContent(translatedMessage));
          }
        }
        return undefined;
      },
    });

    context.subscriptions.push(hoverProvider);
  }

  registerHoverProvider();
}


vscode.workspace.onDidChangeConfiguration((event) => {
  if (event.affectsConfiguration("errorEase.language")) {
    const selectedLanguage = vscode.workspace
      .getConfiguration("errorEase")
      .get<string>("language", "SimpleEnglish");
    console.log(`Language changed to: ${selectedLanguage}`);
  }
});


// deactivate function - called when the extension is deactivated
export function deactivate() { }
