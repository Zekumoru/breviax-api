# BreviaX API: An Audio Transcription and Summarization API

BreviaX is a NodeJS backend API which processes audio files by transcribing them using WhisperX which is run locally and then generating a concise summary using OpenAI's GPT-4o mini model.

> [WARNING]: This project is in its prototype stage. The current code will be completely replaced in the future with a new design and structure. This prototype is intended to demonstrate the potential of the API and does not reflect the final implementation.

## Running this app

1. Clone this repository then create a `.env` with the contents below replacing the brackets with your appropriate API keys:

```env
HUGGING_FACE_TOKEN=<HF_TOKEN>
OPENAI_API_KEY=<OPENAI_KEY>
SUPPORT_LARGE_MODEL=false
PORT=3000
```

If `SUPPORT_LARGE_MODEL` is false then only uses Whisper's medium, small, and tiny models. Set it to `true` if your server can handle larger models.

2. And then run the following commands to install the necessary packages and finally start the app:

```cmd
yarn
yarn start
```

3. To make the server visible in the Internet, forward the port using the `PORTS` tab in VSCode which is next to the `TERMINAL` tab. Click on the `Forward a Port` button, type the port, and finally set the forwarded's address `Visibility` to public.

> If you used VSCode to forward the port, you'll be given a link such as `https://xxxx.euw.devtunnels.ms/`, use the API endpoints using that link. For example: `https://xxxx.euw.devtunnels.ms/api/upload`.

## API Endpoints

### GET: /

Returns a 200 message that the server is up and running.

### GET: /api

Returns a 200 message that the API route is available.

### POST: /api/upload

The endpoint to upload the audio file for processing.
