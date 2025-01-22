import * as vscode from "vscode";
import path from "path";
import fs from "fs";

import { Translation, Translations } from "./types";

type ExtContext = vscode.ExtensionContext;

export function matchErrorPattern(errorMessage: string, selectedLanguage: keyof Translation, context: ExtContext) {
  let translations: Translations;

  try {
    const translationsPath = path.join(context.extensionPath, 'translations.json');
    translations = JSON.parse(fs.readFileSync(translationsPath, 'utf8')) as Translations;
  } catch (error) {
    console.error("Failed to load translations.json:", error);
    vscode.window.showErrorMessage("Failed to load translations.json. Please check the file.");
    translations = {}; // Fallback to an empty object if translations.json is not found.
  }

  for (const pattern in translations) {
    const regexPattern = pattern.replace(/{(.*?)}/g, (_, name) => `(?<${name}>.+?)`);
    const regex = new RegExp(regexPattern);

    const match = regex.exec(errorMessage);

    if (match) {
      const translation = translations[pattern][selectedLanguage];
      let formattedTranslation = translation;

      const placeholders = pattern.match(/{.*?}/g) || [];

      // Replace placeholders in translation with matched values -- Be like string interpolation
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
