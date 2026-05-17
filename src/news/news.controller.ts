import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { NewsService } from './news.service';
import { News } from './news.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import sharp from 'sharp';
import * as fs from 'fs';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    if (page && limit) {
      return this.newsService.findAllPaginated(+page, +limit);
    }
    return this.newsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.newsService.findOne(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: join(process.cwd(), 'uploads'),
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `news-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  async create(@Body() newsData: any, @UploadedFile() file: Express.Multer.File) {
    const news: Partial<News> = { ...newsData };
    if (file) {
      news.image = file.filename;
      await this.processImage(news);
    }
    return this.newsService.create(news);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: join(process.cwd(), 'uploads'),
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `news-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  async update(
    @Param('id') id: string,
    @Body() newsData: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const existingNews = await this.newsService.findOne(+id);
    const news: Partial<News> = { ...newsData };
    
    if (file) {
      news.image = file.filename;
      if (existingNews?.image) {
        this.deleteFile(existingNews.image);
      }
      if (existingNews?.seoImage) {
        this.deleteFile(existingNews.seoImage);
      }
      await this.processImage(news);
    }
    
    return this.newsService.update(+id, news);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    const news = await this.newsService.findOne(+id);
    if (news?.image) {
      this.deleteFile(news.image);
    }
    if (news?.seoImage) {
      this.deleteFile(news.seoImage);
    }
    return this.newsService.remove(+id);
  }

  private async processImage(news: Partial<News>) {
    if (!news.image || news.image.startsWith('opt-')) return;

    const uploadsDir = join(process.cwd(), 'uploads');
    const inputPath = join(uploadsDir, news.image);
    
    const seoName = `seo-${news.image}`;
    const seoPath = join(uploadsDir, seoName);
    
    const optimizedName = `opt-${news.image}`;
    const outputPath = join(uploadsDir, optimizedName);

    try {
      // 1. Generate SEO cropped image (1200x630, perfect aspect ratio for open graph preview cards)
      await sharp(inputPath)
        .resize(1200, 630, { fit: 'cover', position: 'center' })
        .toFormat('jpeg', { quality: 80 })
        .toFile(seoPath);
      
      news.seoImage = seoName;

      // 2. Generate regular optimized image (1200 max-width)
      await sharp(inputPath)
        .resize(1200, null, { withoutEnlargement: true })
        .toFormat('jpeg', { quality: 80 })
        .toFile(outputPath);
      
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      news.image = optimizedName;
    } catch (err) {
      console.error('Image processing failed for news', err);
    }
  }

  private deleteFile(filename: string) {
    const filePath = join(process.cwd(), 'uploads', filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error(`Failed to delete file: ${filePath}`, err);
      }
    }
  }
}
