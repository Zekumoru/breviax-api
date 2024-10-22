import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import upload from '../middlewares/upload';
import writeSummary from '../utils/writeSummary';
import appConfig from '../appConfig';
import logger from '../utils/logger';
import languages, { Language } from '../utils/languages';
import models from '../utils/models';

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

let isProcessing = false;
apiRouter.post('/upload', upload.single('audio'), (req, res) => {
  if (isProcessing) {
    res.status(429).json({
      status: 429,
      message: 'Server is already processing an audio. Please try again later.',
    });
    return;
  }

  // language option
  let language: Language | undefined;
  if (req.body && req.body.language) {
    language = languages.find(
      (language) =>
        language.language === req.body.language ||
        language.code === req.body.language
    ) as Language | undefined;

    if (!language) {
      res
        .status(400)
        .json({ status: 400, message: 'Invalid language option.' });
      return;
    }
  }

  // model option
  let model: string | undefined;
  if (req.body && req.body.model) {
    model = models.find((model) => model === req.body.model);

    if (!model) {
      res.status(400).json({
        status: 400,
        message: `Invalid model option. The available models are: ${models.reduce(
          (str, model, index) => {
            if (index === 0) return model;
            if (index === models.length - 1) return `${str}, and ${model}`;
            return `${str}, ${model}`;
          },
          ''
        )}. Default is medium.`,
      });
      return;
    }

    if (process.env.SUPPORT_LARGE_MODEL !== 'true' && model.includes('large')) {
      res.status(501).json({
        status: 501,
        message: `Model '${model}' is not supported by the CPU of the server. Please try using lower models.`,
      });
      return;
    }
  }

  // check if file exists
  const filename = req.file?.filename;
  if (!filename) {
    res.status(400).json({
      status: 400,
      message: 'Missing file or unsupported',
    });
    logger.error('Error: Missing file or unsupported.');
    return;
  }

  // process audio
  isProcessing = true;
  logger.info(`Processing file: ${filename}`);

  const uploadDir = appConfig.paths.UPLOAD_FOLDER;
  exec(
    `whisperx --compute_type float32 --output_format srt ${
      model ? model : ''
    } ${language ? `--language ${language.code}` : ''} --hf_token ${
      process.env.HUGGING_FACE_TOKEN
    } ${path.join(uploadDir, filename)} -o ${uploadDir}`,
    async (error, stdout, stderr) => {
      isProcessing = false;

      if (error) {
        logger.error(
          error,
          `Error executing command: ${stderr || error.message}`
        );
        res.status(500).json({
          status: 500,
          message: `Could not transcribe audio`,
        });
        return;
      }

      logger.info(`Processed file: ${filename}`);

      logger.info(`Creating summary: ${filename}`);
      const transcription = await fs.readFile(
        path.join(uploadDir, `${filename}.srt`),
        {
          encoding: 'utf-8',
        }
      );

      const summary = await writeSummary(transcription, language);
      if (!summary) {
        logger.error(
          `Error while creating summary for ${filename}. GPT returned a null string.`
        );
        res.status(500).json({
          status: 500,
          message: `Could not write summary`,
        });
        await removeTmpFiles();
        return;
      }

      logger.info(`Created summary: ${filename}`);

      await removeTmpFiles();

      res.json({
        status: 200,
        message: summary,
      });
    }
  );
});

export default apiRouter;
