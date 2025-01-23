const fs = require("fs");

// Load the JSON file
const jsonFilePath = "translations.json"; // Replace with your JSON file path
const translations = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));

// Keyword replacements for Pidgin
const pidginReplacements = {
  "may not": "no fit",
  "must have": "go get",
  "must be": "go dey",
  "must not": "no suppose",
  "are not": "no dey",
  "have a": "get",
  "have an": "get",
  "is a": "na",
  "is an": "na",
  "whose imports will produce": "wey go use",
  "however, the referenced file": "but the file wey you refer to na",
  on: "for",
  at: "for",
  "in an": "for",
  "at a": "for",
  "at an": "for",
  "in a": "for",
  Cannot: "no fit",
  "can only": "fit only",
  "is not": "no be",
  "does not": "no dey",
  "do not": "no dey",
  required: "dem say make you get",
  imported: "carry come",
  using: "with",
  default: "normal",
  assignable: "fit match",
  type: "kind",
  flag: "switch",
  only: "just",
  must: "go",
  error: "wahala",
  category: "group",
  file: "file",
  module: "module",
  export: "export",
  import: "carry come",
  variable: "something",
  string: "word",
  number: "digit",
  boolean: "true or false",
  object: "container",
  expected: "dem expect",
  appear: "dey",
  "Use the syntax": "Make you use dis style:",
  "must be given a": "suppose get",
  initializer: "we you initialize",
};

// Keyword replacements for SimpleEnglish (simplify random words)
const simpleEnglishReplacements = {
  imported: "brought in",
  using: "with",
  default: "usual",
  assignable: "usable",
  flag: "switch",
  only: "just",
  required: "needed",
  cannot: "can't",
  must: "has to",
  export: "export",
  expected: "needed here",
};

// Function to replace keywords in a string (case-insensitive)
const replaceKeywords = (text, replacements) => {
  for (const [key, value] of Object.entries(replacements)) {
    const regex = new RegExp(`\\b${key}\\b`, "gi"); // Case-insensitive regex
    text = text.replace(regex, (match) => {
      // Preserve the original capitalization of the matched word
      if (match[0] === match[0].toUpperCase()) {
        return value[0].toUpperCase() + value.slice(1); // Capitalize the replacement
      } else {
        return value; // Use lowercase replacement
      }
    });
  }
  return text;
};

// Modify translations
for (const key in translations) {
  if (translations[key].Pidgin) {
    translations[key].Pidgin = replaceKeywords(
      translations[key].Pidgin,
      pidginReplacements
    );
  }
  if (translations[key].SimpleEnglish) {
    translations[key].SimpleEnglish = replaceKeywords(
      translations[key].SimpleEnglish,
      simpleEnglishReplacements
    );
  }
}

// Save the modified JSON back to the file
fs.writeFileSync(jsonFilePath, JSON.stringify(translations, null, 2), "utf8");

console.log("Translations modified and saved successfully!");
