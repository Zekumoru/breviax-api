import whisperXTranscribe from './transcribe-handlers/local-whisperx/local-whisperx';
import novaTranscribe from './transcribe-handlers/nova/nova';

const handler = {
  'local-whisperx': whisperXTranscribe,
  'nova-2': novaTranscribe,
};

type Options = {
  // iterate over the handler functions and infer the options parameter as O
  // then return a union of all the options
  [K in keyof typeof handler]: (typeof handler)[K] extends (
    filename: string,
    options: infer O
  ) => Promise<string>
    ? O
    : never;
}[keyof typeof handler];

const transcribe = async (filename: string, options: Options) => {
  return await handler[options.model](filename, options as any);
};

export default transcribe;
