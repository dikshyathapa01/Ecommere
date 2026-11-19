import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Put,
  Param,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-products.dto';
import { Product } from './entities/product.entity';
import { UploadService } from '../upload/upload.service';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productService: ProductsService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('imageIds'))
  addProduct(
    @Body() productBody: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[] = [],
  ) {
    if (files.length > 0) {
      return this.uploadService
        .uploadMultipleImages(files)
        .then(async (uploads) => {
          productBody.imageIds = uploads.map((upload) => upload.secure_url);
          return this.productService.addProduct(productBody);
        });
    }
    return this.productService.addProduct(productBody);
  }

  @Put('/:id')
  updateProduct(
    @Body() updateProductDto: UpdateProductDto,
    @Param('id') id: string,
  ) {
    return this.productService.updateProduct(id, updateProductDto);
  }

  @Get('/')
  getAllProducts(): Promise<Product[]> {
    return this.productService.getAllProducts();
  }

  @Get('/:id')
  getOneProduct(@Param('id') id: string) {
    return this.productService.getOneProduct(id);
  }

  @Delete('/:id')
  DeleteOneProduct(@Param('id') id: string) {
    return this.productService.deleteOneProduct(id);
  }
}
