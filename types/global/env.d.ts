declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: 'development' | 'production';
      PORT?: string;
      HUGGING_FACE_TOKEN?: string;
      OPENAI_API_KEY?: string;
    }
  }
}

export {};
