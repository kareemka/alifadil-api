import { Controller, Get, Post, Delete, Param, UseInterceptors, UploadedFile, Body, UseGuards, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BackstageService } from './backstage.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('backstage')
export class BackstageController {
  constructor(private readonly backstageService: BackstageService) {}

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    if (page && limit) {
      return this.backstageService.findAllPaginated(+page, +limit);
    }
    if (limit) {
      return this.backstageService.findAll(+limit);
    }
    return this.backstageService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  create(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    return this.backstageService.create({
      image: file.filename,
      title: body.title,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.backstageService.remove(+id);
  }
}
