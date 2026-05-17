 import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, UseInterceptors, UploadedFiles, Query } from '@nestjs/common';
 import { ShowsService } from './shows.service';
 import { Show } from './show.entity';
 import { JwtAuthGuard } from '../auth/jwt-auth.guard';
 import { RolesGuard } from '../auth/roles.guard';
 import { Roles } from '../auth/roles.decorator';
 import { UserRole } from '../users/user.entity';
 import { FileFieldsInterceptor } from '@nestjs/platform-express';
 import { diskStorage } from 'multer';
 import { extname, join } from 'path';
import sharp from 'sharp';
import * as fs from 'fs';

 @Controller('shows')
 export class ShowsController {
   constructor(private readonly showsService: ShowsService) {}

   @Get()
   findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
     if (page && limit) {
       return this.showsService.findAllPaginated(+page, +limit);
     }
     return this.showsService.findAll();
   }

   @Get(':id')
   findOne(@Param('id') id: string) {
     return this.showsService.findOne(+id);
   }

   @Post()
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles(UserRole.ADMIN)
   @UseInterceptors(FileFieldsInterceptor([
     { name: 'coverImage', maxCount: 1 },
     { name: 'thumbnailImage', maxCount: 1 },
   ], {
     storage: diskStorage({
       destination: join(process.cwd(), 'uploads'),
       filename: (req, file, cb) => {
         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
         cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
       },
     }),
   }))
   async create(
     @Body() showData: any,
     @UploadedFiles() files: { coverImage?: Express.Multer.File[], thumbnailImage?: Express.Multer.File[] }
   ) {
     const show: Partial<Show> = { ...showData };
     if (files.coverImage?.[0]) show.coverImage = files.coverImage[0].filename;
     if (files.thumbnailImage?.[0]) show.thumbnailImage = files.thumbnailImage[0].filename;
     
     await this.processImages(show);
     return this.showsService.create(show);
   }

   private async processImages(show: Partial<Show>) {
     const uploadsDir = join(process.cwd(), 'uploads');
     
     // Optimize Cover Image & Generate SEO Image
     if (show.coverImage && !show.coverImage.startsWith('opt-')) {
       const inputPath = join(uploadsDir, show.coverImage);
       const seoFilename = `seo-${show.coverImage}`;
       const seoPath = join(uploadsDir, seoFilename);

       try {
         // 1. Generate SEO Image (1200x630 for OpenGraph)
         await sharp(inputPath)
           .resize(1200, 630, { fit: 'cover' })
           .toFormat('jpeg', { quality: 80 })
           .toFile(seoPath);
         
         show.seoImage = seoFilename;

         // 2. Optimize original cover (Limit width to 1920px)
         const optimizedCoverName = `opt-${show.coverImage}`;
         const optimizedCoverPath = join(uploadsDir, optimizedCoverName);
         await sharp(inputPath)
           .resize(1920, null, { withoutEnlargement: true })
           .toFormat('jpeg', { quality: 85 })
           .toFile(optimizedCoverPath);
         
         // Delete old one and update reference
         if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
         show.coverImage = optimizedCoverName;
       } catch (err) {
         console.error('Image processing failed for cover', err);
       }
     }

     // Optimize Thumbnail Image
     if (show.thumbnailImage && !show.thumbnailImage.startsWith('opt-')) {
       const inputPath = join(uploadsDir, show.thumbnailImage);
       const optimizedThumbName = `opt-${show.thumbnailImage}`;
       const optimizedThumbPath = join(uploadsDir, optimizedThumbName);

       try {
         await sharp(inputPath)
           .resize(500, null, { withoutEnlargement: true })
           .toFormat('jpeg', { quality: 85 })
           .toFile(optimizedThumbPath);
         
         if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
         show.thumbnailImage = optimizedThumbName;
       } catch (err) {
         console.error('Image processing failed for thumbnail', err);
       }
     }
   }

   @Put(':id')
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles(UserRole.ADMIN)
   @UseInterceptors(FileFieldsInterceptor([
     { name: 'coverImage', maxCount: 1 },
     { name: 'thumbnailImage', maxCount: 1 },
   ], {
     storage: diskStorage({
       destination: join(process.cwd(), 'uploads'),
       filename: (req, file, cb) => {
         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
         cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
       },
     }),
   }))
     async update(
      @Param('id') id: string,
      @Body() showData: any,
      @UploadedFiles() files: { coverImage?: Express.Multer.File[], thumbnailImage?: Express.Multer.File[] }
    ) {
      // Find existing show to handle old files
      const existingShow = await this.showsService.findOne(+id);
      
      const show: Partial<Show> = { ...showData };
      
      if (files.coverImage?.[0]) {
        show.coverImage = files.coverImage[0].filename;
        // Delete old cover and seo images if they exist
        if (existingShow) {
          this.deleteFiles([existingShow.coverImage, existingShow.seoImage]);
        }
      }
      
      if (files.thumbnailImage?.[0]) {
        show.thumbnailImage = files.thumbnailImage[0].filename;
        // Delete old thumbnail if it exists
        if (existingShow) {
          this.deleteFiles([existingShow.thumbnailImage]);
        }
      }

      await this.processImages(show);
      return this.showsService.update(+id, show);
    }

   @Delete(':id')
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles(UserRole.ADMIN)
   async remove(@Param('id') id: string) {
     const show = await this.showsService.findOne(+id);
     if (show) {
       this.deleteFiles([show.coverImage, show.thumbnailImage, show.seoImage]);
     }
     return this.showsService.remove(+id);
   }

   private deleteFiles(filenames: (string | undefined)[]) {
     const uploadsDir = join(process.cwd(), 'uploads');
     filenames.forEach(filename => {
       if (filename) {
         const filePath = join(uploadsDir, filename);
         if (fs.existsSync(filePath)) {
           try {
             fs.unlinkSync(filePath);
           } catch (err) {
             console.error(`Failed to delete file: ${filePath}`, err);
           }
         }
       }
     });
   }
 }
