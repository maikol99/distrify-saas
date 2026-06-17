import { IsDefined, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class createCategoryDto {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  shopId: string;

  @IsOptional()
  description?: string;
}
