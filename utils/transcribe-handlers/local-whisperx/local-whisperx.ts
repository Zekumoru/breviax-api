import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { LocalWhisperXLanguage } from './local-whisperx-languages';
import { LocalWhisperXModels } from './local-whisperx-models';
import logger from '../../logger';
import appConfig from '../../../appConfig';

interface LocalOptions {
  model: 'local-whisperx';
  language?: LocalWhisperXLanguage;
  localModel?: LocalWhisperXModels;
}

let isProcessing = false;
const whisperXTranscribe = async (
  filename: string,
  { language, localModel }: LocalOptions
) => {
  if (isProcessing) {
    throw new Error(
      'Server is already processing an audio. Please try again later.'
    );
  }

  isProcessing = true;
  logger.info(
    `Processing audio file: ${filename} (model: ${
      localModel ?? 'medium'
    }, language: ${language?.code ?? 'auto'})`
  );

  const uploadDir = appConfig.paths.UPLOAD_FOLDER;
  return await new Promise<string>((resolve, reject) => {
    exec(
      `whisperx --compute_type float32 --output_format srt ${
        localModel ? `--model ${localModel}` : ''
      } ${language ? `--language ${language.code}` : ''} --hf_token ${
        process.env.HUGGING_FACE_TOKEN
      } ${path.join(uploadDir, filename)} -o ${uploadDir}`,
      async (error, _stdout, stderr) => {
        isProcessing = false;

        if (error) {
          logger.error(
            error,
            `Error executing command: ${stderr || error.message}`
          );
          return reject('Could not transcribe audio');
        }

        logger.info(`Processed audio file: ${filename}`);

        const transcriptFile = path.join(uploadDir, `${filename}.srt`);
        const transcription = await fs.readFile(transcriptFile, {
          encoding: 'utf-8',
        });
        await fs.unlink(transcriptFile);
        resolve(transcription);
      }
    );
  });
};

export default whisperXTranscribe;
