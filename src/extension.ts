import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { getHoverContent } from './hover-content';
import { getSelectedLanguage } from './settings';

import { Translation, Translations } from './types';


export function activate(context: vscode.ExtensionContext) {
  // Load the translations.json file
  const translationsPath = path.join(context.extensionPath, 'translations.json');
  const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf8')) as Translations;

  const selectedLanguage = getSelectedLanguage();

  function matchErrorPattern(errorMessage: string): string | null {
    for (const pattern in translations) {
      const regexPattern = pattern.replace(/{(.*?)}/g, (_, name) => `(?<${name}>.+?)`);
      const regex = new RegExp(regexPattern);

      const match = regex.exec(errorMessage);

      if (match) {
        const translation = translations[pattern][selectedLanguage];
        let formattedTranslation = translation;

        const placeholders = pattern.match(/{.*?}/g) || [];

        // Replace placeholders in translation with matched values
        placeholders.forEach((placeholder) => {
          const name = placeholder.replace(/[{}]/g, "");
          const value = match?.groups?.[name] || "unknown";

          formattedTranslation = formattedTranslation.replace(placeholder, value);
        });

        return formattedTranslation;
      }
    }

    return null;
  }




  // Hover Provider logic
  const hoverProvider = vscode.languages.registerHoverProvider(['typescript', 'javascript'], {
    provideHover(document, position, token) {
      // Get the diagnostics at the current position. Meaning the error message from current the Vscode user.
      const diagnostics = vscode.languages.getDiagnostics(document.uri);
      const diagnostic = diagnostics.find((diag) => diag.range.contains(position));

      if (diagnostic) {
        const errorMessage = diagnostic.message;
        const translatedMessage = matchErrorPattern(errorMessage);

        if (translatedMessage) {
          return new vscode.Hover(getHoverContent(translatedMessage));
        }
      }
      return undefined;
    },
  });

  context.subscriptions.push(hoverProvider);
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
