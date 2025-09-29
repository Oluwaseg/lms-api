import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadToCloudinary(
  filePathOrBuffer: string,
  opts: any = {}
) {
  const res = await cloudinary.uploader.upload(filePathOrBuffer, opts);
  return res.secure_url as string;
}

export async function uploadFileStream(filePath: string, opts: any = {}) {
  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      opts,
      (error: any, result: any) => {
        try {
          fs.unlink(filePath, () => {});
        } catch (e) {
          // ignore
        }
        if (error) return reject(error);
        resolve(result.secure_url as string);
      }
    );
    const readStream = fs.createReadStream(filePath);
    readStream.on('error', (err) => {
      try {
        fs.unlink(filePath, () => {});
      } catch (e) {}
      reject(err);
    });
    readStream.pipe(stream);
  });
}

export async function uploadBuffer(buffer: Buffer, opts: any = {}) {
  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      opts,
      (error: any, result: any) => {
        if (error) return reject(error);
        resolve(result.secure_url as string);
      }
    );
    stream.end(buffer);
  });
}
