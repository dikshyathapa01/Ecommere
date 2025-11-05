import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Upload } from './upload.entity';
export interface CloudinaryResponse {
  public_id: string;
  secure_url: string;
  original_filename: string;
  bytes: number;
  format: string;
  width?: number;
  height?: number;
}

export interface MulterFile {
  path: string;
  mimetype: string;
  size: number;
}
@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(Upload)
    private readonly uploadRepository: Repository<Upload>,
  ) {}

  async findAll() {
    return this.uploadRepository.find();
  }

  async uploadImage(file: Express.Multer.File): Promise<CloudinaryResponse> {
    try {
      console.log('uploaded file buffer', file.buffer);
      return await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'uploads/images', resource_type: 'auto' },
          (error, result) => {
            if (error) {
              reject(new Error(error.message || 'Upload failed'));
            } else {
              resolve(result as CloudinaryResponse);
            }
          },
        );
        stream.end(file.buffer);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Uplaod failed';
      throw new InternalServerErrorException(`Upload failed: ${message}`);
    }
  }
  async uploadMultipleImages(
    files: Express.Multer.File[],
  ): Promise<CloudinaryResponse[]> {
    try {
      const uploadPromises = files.map((file) => this.uploadImage(file));
      return await Promise.all(uploadPromises);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Uplaod failed';
      throw new InternalServerErrorException(`Upload failed:${message}`);
    }
  }
  async deleteSingle(publicId: string): Promise<{ result: string }> {
    try {
      return cloudinary.uploader.destroy(publicId) as Promise<{
        result: string;
      }>;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Deletion failed';
      throw new InternalServerErrorException(`Deletion failed: ${message}`);
    }
  }
  async saveToDatabase(cloudinaryResult: CloudinaryResponse): Promise<Upload> {
    try {
      const upload = this.uploadRepository.create({
        publicId: cloudinaryResult.public_id,
        secureUrl: cloudinaryResult.secure_url,
        originalFilename: cloudinaryResult.original_filename,
        bytes: cloudinaryResult.bytes,
        format: cloudinaryResult.format,
        width: cloudinaryResult.width,
        height: cloudinaryResult.height,
      });
      return await this.uploadRepository.save(upload);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to save upload to database',
      );
    }
  }
  async findUploadById(uploadId: string): Promise<Upload> {
    const upload = await this.uploadRepository.findOne({
      where: { id: uploadId },
    });
    if (!upload)
      throw new NotFoundException(`Upload with ID ${uploadId} not found`);
    return upload;
  }
  async deleteUpload(uploadId: string): Promise<void> {
    const upload = await this.findUploadById(uploadId);
    await this.deleteSingle(upload.publicId);
    await this.uploadRepository.remove(upload);
  }
  async deleteMultiple(
    uploadIds: string[],
  ): Promise<{ success: string[]; failed: string[] }> {
    const success: string[] = [];
    const failed: string[] = [];

    for (const id of uploadIds) {
      try {
        await this.deleteUpload(id);
        success.push(id);
      } catch {
        failed.push(id);
      }
    }

    return { success, failed };
  }
}
//         this.validateFile(file);
//         const result=await cloudinary .uploader.upload(file.path,{
//             folder:'uploads',
//         });
//         return result;
//     }
//     validateFile(file:MulterFile):void{
//         const allowedMimeTypes=['image/jpeg','image/png','image/gif'];
//         const maxSizeInBytes=5*1024*1024; //5MB

//         if(!allowedMimeTypes.includes(file.mimetype)){
//             throw new Error(
//                 'Invalid file type.Only JPEG<PNG< and GIF are allowed.',
//             );
//         }
//         if ( file.size> maxSizeInBytes){
//             throw new Error('File size exceeds the 5Mb limit.');
//         }
//     }
// }
