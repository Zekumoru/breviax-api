import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import upload from '../middlewares/upload';
import writeSummary from '../utils/writeSummary';
import appConfig from '../appConfig';

const apiRouter = express.Router();

apiRouter.get('/', (req, res) => {
  res.json({
    status: 200,
    message: 'API is up.',
  });
});

const removeTmpFiles = async () => {
  const directory = appConfig.UPLOAD_FOLDER;
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

  isProcessing = true;
  const filename = req.file?.filename;
  const uploadDir = appConfig.UPLOAD_FOLDER;

  if (!filename) {
    res.status(500).json({
      status: 500,
      message: 'An internal error occurred.',
    });
    console.error(
      'Error: Filename is undefined. It may probably has been deleted.'
    );
    return;
  }

  console.log(`Processing file: ${filename}`);

  exec(
    `whisperx --compute_type float32 --hf_token ${
      process.env.HUGGING_FACE_TOKEN
    } ${path.join(uploadDir, filename)} -o ${uploadDir}`,
    async (error, stdout, stderr) => {
      isProcessing = false;

      if (error) {
        console.error(`Error executing command: ${stderr}`);
        res.status(500).json({
          status: 500,
          message: `Something went wrong: ${stderr || error.message}`,
        });
        return;
      }

      console.log(`Processed file: ${filename}`);

      console.log(`Creating summary: ${filename}`);
      const transcription = await fs.readFile(
        path.join(uploadDir, `${filename}.srt`),
        {
          encoding: 'utf-8',
        }
      );
      console.log(`Created summary: ${filename}`);

      await removeTmpFiles();

      res.json({
        status: 200,
        message: (await writeSummary(transcription)) ?? 'Transcription failed.',
      });
    }
  );
});

export default apiRouter;
