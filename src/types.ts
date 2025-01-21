type Translation = {
  Yoruba: string;
  Pidgin: string;
  SimpleEnglish: string;
};

export type Translations = {
  [errorMessage: string]: Translation;
};
