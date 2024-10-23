const novaLanguages = [
  { language: 'Bulgarian', code: 'bg' },
  { language: 'Catalan', code: 'ca' },
  { language: 'Chinese (Mandarin, Simplified)', code: 'zh' },
  { language: 'Chinese (Mandarin, Simplified)', code: 'zh-CN' },
  { language: 'Chinese (Mandarin, Simplified)', code: 'zh-Hans' },
  { language: 'Chinese (Mandarin, Traditional)', code: 'zh-TW' },
  { language: 'Chinese (Mandarin, Traditional)', code: 'zh-Hant' },
  { language: 'Chinese (Cantonese, Traditional)', code: 'zh-HK' },
  { language: 'Czech', code: 'cs' },
  { language: 'Danish', code: 'da' },
  { language: 'Danish', code: 'da-DK' },
  { language: 'Dutch', code: 'nl' },
  { language: 'English', code: 'en' },
  { language: 'English', code: 'en-US' },
  { language: 'English', code: 'en-AU' },
  { language: 'English', code: 'en-GB' },
  { language: 'English', code: 'en-NZ' },
  { language: 'English', code: 'en-IN' },
  { language: 'Estonian', code: 'et' },
  { language: 'Finnish', code: 'fi' },
  { language: 'Flemish', code: 'nl-BE' },
  { language: 'French', code: 'fr' },
  { language: 'French', code: 'fr-CA' },
  { language: 'German', code: 'de' },
  { language: 'German (Switzerland)', code: 'de-CH' },
  { language: 'Greek', code: 'el' },
  { language: 'Hindi', code: 'hi' },
  { language: 'Hungarian', code: 'hu' },
  { language: 'Indonesian', code: 'id' },
  { language: 'Italian', code: 'it' },
  { language: 'Japanese', code: 'ja' },
  { language: 'Korean', code: 'ko' },
  { language: 'Korean', code: 'ko-KR' },
  { language: 'Latvian', code: 'lv' },
  { language: 'Lithuanian', code: 'lt' },
  { language: 'Malay', code: 'ms' },
  { language: 'Multilingual (Spanish + English)', code: 'multi' },
  { language: 'Norwegian', code: 'no' },
  { language: 'Polish', code: 'pl' },
  { language: 'Portuguese', code: 'pt' },
  { language: 'Portuguese', code: 'pt-BR' },
  { language: 'Portuguese', code: 'pt-PT' },
  { language: 'Romanian', code: 'ro' },
  { language: 'Russian', code: 'ru' },
  { language: 'Slovak', code: 'sk' },
  { language: 'Spanish', code: 'es' },
  { language: 'Spanish', code: 'es-419' },
  { language: 'Swedish', code: 'sv' },
  { language: 'Swedish', code: 'sv-SE' },
  { language: 'Thai', code: 'th' },
  { language: 'Thai', code: 'th-TH' },
  { language: 'Turkish', code: 'tr' },
  { language: 'Ukrainian', code: 'uk' },
  { language: 'Vietnamese', code: 'vi' },
] as const;

export default novaLanguages;
export type NovaLanguageName = (typeof novaLanguages)[number]['language'];
export type NovaLanguageCode = (typeof novaLanguages)[number]['code'];
export type NovaLanguage = (typeof novaLanguages)[number];
