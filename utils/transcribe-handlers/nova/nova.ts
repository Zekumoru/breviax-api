import { createClient, PrerecordedSchema } from '@deepgram/sdk';
import { srt } from '@deepgram/captions';
import fs from 'fs/promises';
import logger from '../../logger';
import appConfig from '../../../appConfig';
import path from 'path';
import { NovaLanguage } from './nova-languages';

interface DeepgramOptions {
  model: 'nova-2';
  language?: NovaLanguage;
}

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

const CONCURRENT_REQUEST_LIMIT = 5;
let nProcesses = 0;
const novaTranscribe = async (
  filename: string,
  { model, language }: DeepgramOptions
) => {
  if (nProcesses >= CONCURRENT_REQUEST_LIMIT) {
    throw new Error(
      'Server has already reached the limit of the maximum audio processes. Please try again later.'
    );
  }

  nProcesses++;
  logger.info(
    `Processing audio file: ${filename} (model: ${model}, language: ${
      language?.code ?? 'auto'
    })`
  );

  const uploadDir = appConfig.paths.UPLOAD_FOLDER;
  const file = await fs.readFile(path.join(uploadDir, filename));
  const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
    file,
    Object.assign<PrerecordedSchema, PrerecordedSchema>(
      {
        model: 'nova-2',
        smart_format: true,
        detect_language: true, // For more info, check: https://developers.deepgram.com/docs/language-detection#restricting-the-detectable-languages
      },
      // Okay... For some reason, if language is undefined, deepgram returns an
      // error which I guess they process 'undefined' value as invalid -.-
      language ? { language: language.code } : {}
    )
  );

  nProcesses--;

  if (error) {
    logger.error(error, `Could not transcribe ${filename}: ${error.message}`);
    throw new Error('Could not transcribe audio');
  }

  logger.info(`Processed audio file: ${filename}`);
  try {
    return srt(result);
  } catch (error) {
    logger.error(error, `Could not convert transcribed audio to srt`);
    return '';
  }
};

export default novaTranscribe;
