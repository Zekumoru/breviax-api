declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: 'development' | 'production';
      SUPPORT_LARGE_MODEL?: string;
      DEEPGRAM_API_KEY?: String;
      PORT?: string;
      HUGGING_FACE_TOKEN?: string;
      OPENAI_API_KEY?: string;
    }
  }
}

export {};
