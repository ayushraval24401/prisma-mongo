import multer from "multer";
import { BlockBlobClient } from "@azure/storage-blob";
import path from "path";
import { Request, Response, NextFunction } from "express";
import { Readable } from "stream";

const inMemoryStorage = multer.memoryStorage();
const containerName: any = process.env.AZURE_STORAGE_CONTAINER_NAME as string;
const connectionString: string = process.env
  .AZURE_STORAGE_CONNECTION_STRING as string;

const getBlobName = (file: any) => {
  const fileName: any = `${new Date().getTime().toString()}-${
    file.fieldname
  }${path.extname(file.originalname)}`;
  return fileName;
};

const uploadFile = multer({
  storage: inMemoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, callback) {
    const extension: boolean =
      [".png", ".jpg", ".jpeg"].indexOf(
        path.extname(file.originalname).toLowerCase()
      ) >= 0;
    const mimeType: boolean =
      ["image/png", "image/jpg", "image/jpeg"].indexOf(file.mimetype) >= 0;

    if (extension && mimeType) {
      return callback(null, true);
    }
    callback(
      new Error(
        "Invalid file type. Only picture file on type PNG and JPG are allowed!"
      )
    );
  },
}).single("image");

const uploadToBlobStorage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  return new Promise((resolve, reject): void => {
    uploadFile(req, res, (error) => {
      if (error) {
        reject(error);
      }
      const request: any = req;

      const blobName = getBlobName(request.file);
      const blobService = new BlockBlobClient(
        connectionString,
        containerName,
        blobName
      );
      const stream = Readable.from(request.file.buffer);
      //   const stream = getStream(request.file.buffer);
      const streamLength = request.file?.buffer.length;
      blobService
        .uploadStream(stream, streamLength)
        .then((res: any) => {
          resolve({ file: { filename: blobName }, body: req.body });
        })
        .catch((err: any) => {
          reject(error);
        });
    });
  });
};

export default uploadToBlobStorage;
