import multer, { diskStorage } from "multer";

export const fileValidation = {
  images: ["image/png", "image/jpeg", "image/jpg"],
  files: ["application/pdf"],
};

export const uploadCloud = () => {
  const storage = diskStorage({});
  const multerUpload = multer({ storage });

  return multerUpload;
};
