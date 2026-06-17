import { IsDefined, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSupplierDto {
  @IsDefined()
  @IsNotEmpty()
  shopId: string;

  @IsDefined()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  address: string;

  @IsOptional()
  phone: number;

  @IsOptional()
  email: string;

  @IsOptional()
  cuit: string;

  @IsOptional()
  buyId: string[];

  @IsDefined()
  @IsNotEmpty()
  debt: number;

  @IsDefined()
  @IsNotEmpty()
  company: string;

  @IsOptional()
  creationDate: Date;

  @IsOptional()
  userName: string;
}
