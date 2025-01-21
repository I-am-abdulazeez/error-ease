import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { getHoverContent } from './hover-content';
import { Translations } from './types';


export function activate(context: vscode.ExtensionContext) {
  // Load the translations.json file
  const translationsPath = path.join(context.extensionPath, 'translations.json');
  const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf8')) as Translations;

  // Match the error message with the translations
  function matchErrorPattern(errorMessage: string): string | null {
    for (const pattern in translations) {
      // Replace placeholders in the pattern with named capture groups - AI generated this shit Regex,
      const regexPattern = pattern.replace(/{(.*?)}/g, (_, name) => `(?<${name}>.+?)`);
      const regex = new RegExp(regexPattern);

      const match = regex.exec(errorMessage);

      if (match) {
        const translation = translations[pattern].Pidgin;
        let formattedTranslation = translation;

        // Extract placeholders from the pattern
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

// deactivate function - called when the extension is deactivated
export function deactivate() { }
