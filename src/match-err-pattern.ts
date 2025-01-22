import * as vscode from "vscode";
import path from "path";
import fs from "fs";

import { Translation, Translations } from "./types";


export function matchErrorPattern(errorMessage: string, selectedLanguage: keyof Translation, context: vscode.ExtensionContext): string | null {
  // Load the translations.json file
  const translationsPath = path.join(context.extensionPath, 'translations.json');
  const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf8')) as Translations;
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
