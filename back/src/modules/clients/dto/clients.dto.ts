import {
  IsBoolean,
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateClientDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  shopId: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  address: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsNumber()
  debt: number;

  @IsOptional()
  @IsString()
  password: string;

  @IsOptional()
  @IsBoolean()
  createdOffline: boolean;

  @IsOptional()
  @IsBoolean()
  updatedOffline: boolean;

  @IsOptional()
  @IsString()
  typeOfClient: string;

  @IsOptional()
  @IsString()
  isAuthorized: string;

  @IsOptional()
  @IsString()
  clientList: string;
}
