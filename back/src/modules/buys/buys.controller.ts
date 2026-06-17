import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  UploadedFiles,
  BadRequestException,
  Query,
  Request,
} from '@nestjs/common';
import { BuysService } from './buys.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('buys')
export class BuysController {
  constructor(private readonly buysService: BuysService) {}

  // @Post('/post/create-buy')
  // @UseInterceptors(
  //   FilesInterceptor('imagenes', 10, {
  //     // Cambiamos a FilesInterceptor y permitimos hasta 10 imágenes
  //     storage: diskStorage({
  //       destination: './uploads',
  //       filename: (req, file, cb) => {
  //         const uniqueSuffix =
  //           Date.now() + '-' + Math.round(Math.random() * 1e9);
  //         cb(
  //           null,
  //           file.fieldname + '-' + uniqueSuffix + extname(file.originalname),
  //         );
  //       },
  //     }),
  //     fileFilter: (req, file, cb) => {
  //       if (file.mimetype.match(/\/(jpg|jpeg|png|gif|pdf)$/)) {
  //         cb(null, true);
  //       } else {
  //         cb(new Error('Tipo de archivo no soportado'), false);
  //       }
  //     },
  //     limits: {
  //       fileSize: 1024 * 1024 * 5, // 5 MB por archivo
  //     },
  //   }),
  // )
  // async create(@Body() body, @UploadedFiles() imagenes: Express.Multer.File[]) {
  //   return this.buysService.create(body, imagenes);
  // }

  @Post('/post/create-buy')
  async create(@Request() req, @Body() body) {
    return this.buysService.create({ ...body, userId: req.user.id });
  }

  @Get('/get/get-buys/:id')
  findAll(
    @Param('id') id: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.buysService.findAll(id, page, limit);
  }

  @Get('/get/get-by-id/:id')
  findOne(@Param('id') id: string) {
    return this.buysService.findOne(id);
  }

  @Patch('/patch/update-buy/:id')
  update(@Param('id') id: string, @Body() body) {
    return this.buysService.update(id, body);
  }

  @Delete('/delete/delete-buy/:id')
  remove(@Param('id') id: string) {
    return this.buysService.remove(id);
  }

  @Patch(':id/image/:imageIndex')
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            file.fieldname + '-' + uniqueSuffix + extname(file.originalname),
          );
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif|pdf)$/)) {
          cb(null, true);
        } else {
          cb(
            new Error(
              'Tipo de archivo no soportado. Solo se permiten imágenes y PDFs.',
            ),
            false,
          );
        }
      },
      limits: {
        fileSize: 1024 * 1024 * 10, // Aumentamos a 10 MB para permitir PDFs más grandes
      },
    }),
  )
  async updateImage(
    @Param('id') id: string,
    @Param('imageIndex') imageIndex: string,
    @UploadedFile() archivo: Express.Multer.File,
  ) {
    if (!archivo) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    const index = parseInt(imageIndex, 10);
    if (isNaN(index)) {
      throw new BadRequestException('Índice de imagen no válido');
    }

    return this.buysService.updateImage(id, index, archivo);
  }

  //Buscar compras por proveedor
  @Get('/get/search-by-provider')
  findByProvider(
    @Query('supplierName') supplierName: string,
    @Query('shopId') shopId: string,
  ) {
    return this.buysService.findBySupplier(supplierName, shopId);
  }

  //Filtrar compras
  @Get('/get/filter-buys')
  filter(
    @Query('shopId') shopId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('supplierId') supplierId: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
    @Query('category') category: string,
    @Query('paymentMethod') paymentMethod: string,
    @Query('minAmount') minAmount?: number,
    @Query('maxAmount') maxAmount?: number,
    @Query('isPaid') isPaid?: string,
  ) {
    return this.buysService.filterBuys(
      shopId,
      page,
      limit,
      supplierId,
      startDate,
      endDate,
      category,
      paymentMethod,
      minAmount,
      maxAmount,
      isPaid,
    );
  }
}
