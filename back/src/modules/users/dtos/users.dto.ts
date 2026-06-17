import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class RegisterUserDto {
  @IsEmail()
  @IsNotEmpty()
  @IsDefined()
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  username: string;

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  phone:string

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  password: string;

  @IsOptional()
  shopId: string;

  @IsOptional()
  createShop:boolean
}
