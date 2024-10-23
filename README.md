# BreviaX API: An Audio Transcription and Summarization API

BreviaX is a NodeJS backend API which processes audio files by transcribing them using WhisperX which is run locally and then generating a concise summary using OpenAI's GPT-4o mini model.

> [WARNING]: This project is in its prototype stage. The current code will be completely replaced in the future with a new design and structure. This prototype is intended to demonstrate the potential of the API and does not reflect the final implementation.

## Online API

BreviaX API is now finally live through <https://breviax.zekumoru.com>! Do not expect to see a webpage though. Also, since it's running in my server and I don't want it to hog my server's resources, local transcription through WhisperX is disabled, therefore only the `nova-2` model is available.

There are, of course, limitations. First off, `nova-2`, which is Deepgram's model, is running through their API and they have $200 free credit to use. **I am not paying for it** therefore someday this API will stop its services when the credits are exhausted. Also, for the summarization part, it is using my OpenAI's API key and if my credits there as well (which I paid for) are exhausted then no summarization will be done. DO NOT ABUSE THE API OR ELSE I'LL TAKE IT DOWN (or I'll implement a rate limiter).

### Example curl request

```cmd
curl -X POST https://breviax.zekumoru.com/api/upload -F "audio=@sample.mp3" -F "model=nova-2" -F "language=it"
```

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

Returns 200 if transcription and summarization is successful.

#### Sample response

```json
{
  "status": 200,
  "message": "**Il Concetto di Polimorfismo e Gerarchia**\n\n---\n\n**Introduzione al Polimorfismo**  \n[00:00:30 - 00:00:45]\n\n- Il polimorfismo è definito come la possibilità che un oggetto assuma diverse forme. \n- Non tutti gli oggetti possono trasformarsi, è necessario che ci siano delle condizioni.\n\n**Gerarchia Necessaria**  \n[00:00:45 - 00:01:08]\n\n- È fondamentale avere una gerarchia per permettere il polimorfismo.\n- La semplice presenza di una gerarchia non è sufficiente; devono esistere metodi specifici associati agli oggetti nella gerarchia, come i metodi utilizzati nei telefoni.",
  "options": { "language": "it", "model": "nova-2" }
}
```

#### Options

- audio: The audio file.
- model: either `nova-2` or the models available on WhisperX which are `tiny.en`, `tiny`, `base.en`, `base`, `small.en`, `small`, `medium.en`, `medium`, `large-v1`, `large-v2`, `large-v3`, `large`, `distil-large-v2`, `distil-medium.en`, and `distil-small.en`. Default is `nova-2`.
- language: `nova-2` supports the languages listed at <https://developers.deepgram.com/docs/models-languages-overview> while the other models, which is used by WhisperX, is listed at the `utils/transcribe-handlers/local-whisperx/local-whisperx-languages.ts` file. Default is `auto`. (**WARNING:** `auto` is NOT an option.)

#### HTTP error codes

- 400 Bad Request: Malformed input, missing file, or unsupported file.
- 500 Internal Error: Transcription failure, summarization failure, or server's failure.
- 501 Not Implemented: Model unavailable for use.
