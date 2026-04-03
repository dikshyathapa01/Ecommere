import { Body, Delete, Get, Param, ParseIntPipe, Post, Put, Query, Controller } from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { UpdateCategoryDto } from "./dto/update-categories.dto";
import { CreateCategoryDto } from "./dto/create-categories.dto";

@Controller('categories')
export class CategoriesController{
    constructor(private readonly categoriesService:CategoriesService){}
 @Get()
 findAll(
     @Query('isActive') isActive?: string,
    @Query('search') search?: string,
  ) {
    const filters = {
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      search,
    };
    return this.categoriesService.findAll(filters);
  }
    @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }
@Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
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
    return this.categoriesService.remove(id);
  }
  
}