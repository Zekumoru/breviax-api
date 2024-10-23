const localWhisperXModels = [
  'tiny.en',
  'tiny',
  'base.en',
  'base',
  'small.en',
  'small',
  'medium.en',
  'medium',
  'large-v1',
  'large-v2',
  'large-v3',
  'large',
  'distil-large-v2',
  'distil-medium.en',
  'distil-small.en',
] as const;

export default localWhisperXModels;
export type LocalWhisperXModels = (typeof localWhisperXModels)[number];
