import { BadRequestException, Body, Controller, Delete, Param, Post, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

@Controller('upload')
export class UploadController {
    constructor(private readonly uploadService:UploadService){}

    @Post('single')
    @UseInterceptors(FileInterceptor('file'))
    async uploadSingle(@UploadedFile() file:Express.Multer.File){
        //eslint-disable-next-line @typescript-eslint/no-unsafe-argumnet
        const result=await this.uploadService.uploadImage(file);
        return{
            message:'File uploaded successfully',
            data:result,
        }
    }
    @Post('multiple')
    @UseInterceptors(FilesInterceptor('files'))
    async uploadMutiple(@UploadedFiles() files:Express.Multer.File[]){
        if(!files || files.length === 0){
            throw new BadRequestException('No files provided for upload');
        }
        if(files.length>10){
            throw new BadRequestException('Maximum 10 files are allowed');
        }
        return this.uploadService.uploadMultipleImages(files);
    }
    @Delete('single')
  async deleteSingle(@Body('uploadId') uploadId: string) {
    if (!uploadId) throw new BadRequestException('uploadId is required');
    await this.uploadService.deleteSingle(uploadId);
    return { message: `Upload ${uploadId} deleted successfully` };
  }

  @Delete('multiple')
  async deleteMultiple(@Body() { uploadIds }: { uploadIds: string[] }) {
    if (!uploadIds || uploadIds.length === 0)
      throw new BadRequestException('uploadIds array is required');

    const result = await this.uploadService.deleteMultiple(uploadIds);
    return {
      message: 'Multiple uploads delete attempt completed',
      ...result,
    };
  }
}


//delete multiple
