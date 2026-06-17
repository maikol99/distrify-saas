import { PartialType } from '@nestjs/mapped-types';
import { IsDefined, IsNotEmpty } from 'class-validator';

export class CreateNotificationDto {
  @IsDefined()
  @IsNotEmpty()
  shopId: string;

  @IsDefined()
  @IsNotEmpty()
  status: string;

  @IsDefined()
  @IsNotEmpty()
  type: string;

  @IsDefined()
  @IsNotEmpty()
  title: string;

  @IsDefined()
  @IsNotEmpty()
  message: string;
}


export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {}
