import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import upload from '../middlewares/upload';
import writeSummary from '../utils/writeSummary';
import appConfig from '../appConfig';
import logger from '../utils/logger';
import { Language, languages } from '../utils/languages';

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
  let language: Language | null | undefined = null;
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

  // check if file exists
  const filename = req.file?.filename;
  if (!filename) {
    res.status(500).json({
      status: 500,
      message: 'An internal error occurred.',
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
      language ? `--language ${language.code}` : ''
    } --hf_token ${process.env.HUGGING_FACE_TOKEN} ${path.join(
      uploadDir,
      filename
    )} -o ${uploadDir}`,
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

      const summary = await writeSummary(transcription);
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
