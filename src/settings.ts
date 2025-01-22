import * as vscode from 'vscode';

import { Translation } from './types';

export function getSelectedLanguage(): keyof Translation {
  const availableLanguages: Array<keyof Translation> = ["Yoruba", "Pidgin", "SimpleEnglish"];
  const configuredLanguage = vscode.workspace
    .getConfiguration("errorEase")
    .get<string>("language", "SimpleEnglish"); // Default Language is SimpleEnglish
  console.log("Selected language from settings:", configuredLanguage);

  return availableLanguages.includes(configuredLanguage as keyof Translation)
    ? (configuredLanguage as keyof Translation)
    : "SimpleEnglish"; // Fallback to SimpleEnglish, if any problem sele
}
