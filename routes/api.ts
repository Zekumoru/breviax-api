import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import upload from '../middlewares/upload';
import writeSummary from '../utils/writeSummary';
import appConfig from '../appConfig';
import logger from '../utils/logger';
import asyncHandler from 'express-async-handler';
import localWhisperXLanguages, {
  LocalWhisperXLanguage,
} from '../utils/transcribe-handlers/local-whisperx/local-whisperx-languages';
import localWhisperXModels, {
  LocalWhisperXModels,
} from '../utils/transcribe-handlers/local-whisperx/local-whisperx-models';
import novaLanguages, {
  NovaLanguage,
} from '../utils/transcribe-handlers/nova/nova-languages';
import transcribe from '../utils/transcribe';

const apiRouter = express.Router();

apiRouter.get('/', (req, res) => {
  res.json({
    status: 200,
    message: 'API is up.',
  });
});

const removeTmpFiles = async () => {
  const directory = appConfig.paths.UPLOAD_FOLDER;
  for (const file of await fs.readdir(directory))
    await fs.unlink(path.join(directory, file));
};

type localWhisperXModels = LocalWhisperXModels | 'nova-2';
apiRouter.post(
  '/upload',
  upload.single('audio'),
  asyncHandler(async (req, res) => {
    // model option
    let model: string | undefined;
    if (req.body && req.body.model && req.body.model !== 'nova-2') {
      model = localWhisperXModels.find((model) => model === req.body.model);

      if (!model) {
        res.status(400).json({
          status: 400,
          message: `Invalid model option. The available models are: ${[
            'nova-2',
            ...localWhisperXModels,
          ].reduce((str, model, index) => {
            if (index === 0) return model;
            if (index === localWhisperXModels.length - 1)
              return `${str}, and ${model}`;
            return `${str}, ${model}`;
          }, '')}. Default is nova-2.`,
        });
        return;
      }

      if (
        process.env.SUPPORT_LARGE_MODEL !== 'true' &&
        model.includes('large')
      ) {
        res.status(501).json({
          status: 501,
          message: `Model '${model}' is not supported by the CPU of the server. Please try using lower models or use the nova-2 model which is processed by Deepgram and not by this server's CPU.`,
        });
        return;
      }
    }

    if (!model) model = 'nova-2'; // default to using nova-2 if model isn't given

    // language option
    let language: LocalWhisperXLanguage | NovaLanguage | undefined;
    if (req.body && req.body.language) {
      if (model === 'nova-2') {
        language = novaLanguages.find(
          (language) =>
            language.language === req.body.language ||
            language.code === req.body.language
        ) as LocalWhisperXLanguage | undefined;
      } else {
        language = localWhisperXLanguages.find(
          (language) =>
            language.language === req.body.language ||
            language.code === req.body.language
        ) as LocalWhisperXLanguage | undefined;
      }

      if (!language) {
        res.status(400).json({
          status: 400,
          message: 'Invalid language option or unsupported.',
        });
        return;
      }
    }

    // check if file exists
    const filename = req.file?.filename;
    if (!filename) {
      res.status(400).json({
        status: 400,
        message: 'Missing audio file or unsupported',
      });
      logger.error('Error: Missing audio file or unsupported.');
      return;
    }

    // process audio
    try {
      let transcription = '';
      if (model === 'nova-2') {
        transcription = await transcribe(filename, {
          model: 'nova-2',
          language: language as NovaLanguage,
        });
      } else {
        if (process.env.SUPPORT_LOCAL_TRANSCRIPTION !== 'true') {
          res.status(501).json({
            status: 501,
            message: `Local transcription is not supported by the server. Use the 'nova-2' model.`,
          });
          return;
        }

        transcription = await transcribe(filename, {
          model: 'local-whisperx',
          localModel: model as LocalWhisperXModels,
          language: language as LocalWhisperXLanguage,
        });
      }

      if (!transcription) {
        res.status(500).json({
          status: 500,
          message: `Transcription failed`,
        });
        await fs.unlink(path.join(appConfig.paths.UPLOAD_FOLDER, filename));
        return;
      }

      // create summary
      logger.info(`Creating summary: ${filename}`);
      const summary = await writeSummary(transcription, language);
      if (!summary) {
        logger.error(
          `Error while creating summary for ${filename}. GPT returned a null string.`
        );
        res.status(500).json({
          status: 500,
          message: `Could not write summary`,
        });
        await fs.unlink(path.join(appConfig.paths.UPLOAD_FOLDER, filename));
        return;
      }

      await fs.unlink(path.join(appConfig.paths.UPLOAD_FOLDER, filename));
      logger.info(`Created summary: ${filename}`);

      res.json({
        status: 200,
        message: summary,
        options: {
          language: language?.code ?? 'auto',
          model,
        },
      });
    } catch (error) {
      await fs.unlink(path.join(appConfig.paths.UPLOAD_FOLDER, filename));
      res.status(500).json({
        status: 500,
        message:
          error instanceof Error
            ? error.message
            : 'An internal error occurred.',
      });
    }
  })
);

export default apiRouter;
