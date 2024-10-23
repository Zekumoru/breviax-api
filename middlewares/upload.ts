import multer from 'multer';
import appConfig from '../appConfig';
import fs from 'fs';

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (!fs.existsSync(appConfig.paths.UPLOAD_FOLDER)) {
        fs.mkdirSync(appConfig.paths.UPLOAD_FOLDER, { recursive: true });
      }

      cb(null, appConfig.paths.UPLOAD_FOLDER);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${file.fieldname}-${uniqueSuffix}`);
    },
  }),
});

export default upload;
