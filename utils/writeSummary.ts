import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import appConfig from '../appConfig';
import { Language } from './languages';
import { ChatCompletionMessageParam } from 'openai/resources';

let prompt = '';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const writeSummary = async (
  transcription: string,
  language?: Language | null
) => {
  if (!prompt) {
    prompt = await fs.readFile(path.join(appConfig.paths.PROMPT_FILE), {
      encoding: 'utf-8',
    });
  }

  const messages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: prompt,
    },
    {
      role: 'user',
      content: transcription,
    },
  ];

  if (language) {
    messages.unshift({
      role: 'system',
      content: `Do the summary in ${language.language} language.`,
    });
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
  });

  return completion.choices[0].message.content;
};

export default writeSummary;
