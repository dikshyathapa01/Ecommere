import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-products.dto';
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}
  getAllProducts():Promise<Product[]>{
    try{
return this.productRepository.find();
    }catch(error){
throw new InternalServerErrorException(error);
    }
  } 
  getOneProduct(id:string):Promise<Product|null>{
    try{
      return this.productRepository.findOneBy({id});
    }catch(error){
      throw new InternalServerErrorException(error);
    }
  }
  async deleteOneProduct(id:string):Promise<void>{
    try{
        await this.productRepository.delete(id)
      }
    catch(error){
       throw new InternalServerErrorException(error);
    }
  
  }
  addProduct(createProductDto: CreateProductDto):Promise<Product>{
    try {
      const product = this.productRepository.create(createProductDto);
      return this.productRepository.save(product);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async updateProduct(id:string,updateProductDto:UpdateProductDto):Promise<Product>{
    try{
const existingProduct=await this.productRepository.findOneBy({id});
if(!existingProduct){
  throw new NotFoundException('Product not found');
}
const  updatedProduct =this.productRepository.merge(
  existingProduct,
  updateProductDto,
);
return this.productRepository.save(updatedProduct);
    }catch(error){
      throw new InternalServerErrorException(error);
    }
  }
  }
