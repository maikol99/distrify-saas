import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateClientDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  shopId: string;

  name: string;

  @IsString()
  @IsOptional()
  address: string;

  @IsOptional()
  @IsString()
  phone: number;

  @IsOptional()
  @IsEmail()
  email: string;



  @IsOptional()
  password: string;

  @IsOptional()
  createdOffline: boolean;

  @IsOptional()
  updatedOffline: boolean;

  @IsOptional()
  @IsString()
  typeOfClient: string;

  @IsOptional()
  isAuthorized: string;

  @IsOptional()
  clientList: string;
}
