import cloudinary from "../config/cloudinary";
import { Readable } from "stream";

export const CloudinaryContext = {
  async uploadImage(
    buffer: Buffer,
    userId: string,
    originalname: string
  ): Promise<{
    cloudinaryId: string;
    url: string;
    secureUrl: string;
    format: string;
    width: number;
    height: number;
    bytes: number;
  }> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `diary/${userId}`,
          resource_type: "image",
        },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error("Cloudinary upload failed"));
          }
          resolve({
            cloudinaryId: result.public_id,
            url: result.url,
            secureUrl: result.secure_url,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
          });
        }
      );

      const readable = new Readable();
      readable.push(buffer);
      readable.push(null);
      readable.pipe(stream);
    });
  },

  async deleteImage(cloudinaryId: string) {
    return cloudinary.uploader.destroy(cloudinaryId);
  },
};
