import{IsString,MinLength,IsNumber,IsBoolean,IsOptional,IsDate} from 'class-validator';
export class CreateCategoryDto{
    @IsString()
    @MinLength(2)
    name:string;

    @IsString()
      @MinLength(10)
    description:string;
    @IsOptional()
 @IsBoolean()
    catagories:Boolean;
@IsOptional()
@IsNumber()
parentCategoryId?:number; 
@IsOptional()
@IsDate()
createdAt:Date;
@IsOptional()
@IsDate()
updatedAt:Date
}
