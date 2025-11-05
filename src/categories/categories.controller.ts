import { Body, Delete, Get, Param,Res, ParseIntPipe, Post, Put, Query, HttpStatus, Controller } from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { UpdateCategoryDto } from "./dto/update-categories.dto";
import { CreateCategoryDto } from "./dto/create-categories.dto";
import type { Response } from "express";  
@Controller('categories')
export class CategoriesController{
    constructor(private readonly categoriesService:CategoriesService){}
 @Get()
 findAll(
     @Query('isActive') isActive?: string,
    @Query('search') search?: string,
  ) {
    const filters = { isActive, search };
    console.log(`Fetching all categories with filters:{filters}`);
    // return this.categoriesService.findAll(filters);
      return{ success: true,message: "Categories fetched successfully",appliedFilters: filters}
  }
    @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }
@Post()
  create(@Body() createCategoryDto: CreateCategoryDto,@Res() res:Response) {
    console.log("Received Category DTO:", createCategoryDto);
      return res.status(HttpStatus.CREATED).json({
      success: true,
      message: "Successfully created "
    });
}


  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
     console.log(`Deleting category with ID:{id}`);
     return {success:true,
      message:"Successfully deleted"
     }
  }
  
}