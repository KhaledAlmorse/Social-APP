import multer, { diskStorage } from "multer";
import { nanoid } from "nanoid";

import path from "path";
import fs from "fs";
import User from "../../DB/model/user.model.js";
//* disk Storage  => save file in fileSystem
// multer

export const fileValidation = {
  images: ["image/png", "image/jpeg", "image/jpg"],
  files: ["application/pdf"],
};

export const upload = (filetype, folderName) => {
  const storage = diskStorage({
    // destination: folderName || "Uploads",
    destination: async (req, file, cb) => {
      const folder_name = `${folderName}/${req.user.userName}_${req.user._id}`;
      const folderPath = path.resolve(".", `${folder_name}`);
      fs.mkdirSync(folderPath, { recursive: true });

      cb(null, folder_name);
    },
    filename: (req, file, cb) => {
      // console.log(file);
      //*Save File
      const originalName = `${nanoid()}_${file.originalname}`;
      cb(null, originalName);
    },
  });

  const fileFilter = function (req, file, cb) {
    if (!filetype.includes(file.mimetype))
      cb(
        new Error(`Invalid Format! we only accept ${JSON.stringify(filetype)}`),
        false,
      );
    return cb(null, true);
  };

  const multerUpload = multer({ storage, fileFilter });

  return multerUpload;
};
