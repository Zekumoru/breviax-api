declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: 'development' | 'production';
      SUPPORT_LARGE_MODEL?: string;
      PORT?: string;
      HUGGING_FACE_TOKEN?: string;
      OPENAI_API_KEY?: string;
    }
  }
}

export {};
