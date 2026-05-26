
import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, UseInterceptors, UploadedFiles, Query } from '@nestjs/common';
import { CommercialsService } from './commercials.service';
import { Commercial } from './commercial.entity';
 import { JwtAuthGuard } from '../auth/jwt-auth.guard';
 import { RolesGuard } from '../auth/roles.guard';
 import { Roles } from '../auth/roles.decorator';
 import { UserRole } from '../users/user.entity';
 import { FileFieldsInterceptor } from '@nestjs/platform-express';
 import { diskStorage } from 'multer';
 import { extname, join } from 'path';
import sharp from 'sharp';
import * as fs from 'fs';

@Controller('commercials')
export class CommercialsController {
  constructor(private readonly commercialsService: CommercialsService) {}

   @Get()
   findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
     if (page && limit) {
       return this.commercialsService.findAllPaginated(+page, +limit);
     }
     return this.commercialsService.findAll();
   }

   @Get(':id')
   findOne(@Param('id') id: string) {
     return this.commercialsService.findOne(+id);
   }

   @Post()
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles(UserRole.ADMIN)
   @UseInterceptors(FileFieldsInterceptor([
     { name: 'coverImage', maxCount: 1 },
     { name: 'thumbnailImage', maxCount: 1 },
     { name: 'stills', maxCount: 30 },
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
     @Body() commercialData: any,
     @UploadedFiles() files: { coverImage?: Express.Multer.File[], thumbnailImage?: Express.Multer.File[], stills?: Express.Multer.File[] }
   ) {
     const commercial = this.normalizeCommercialData(commercialData);
     if (files.coverImage?.[0]) commercial.coverImage = files.coverImage[0].filename;
     if (files.thumbnailImage?.[0]) commercial.thumbnailImage = files.thumbnailImage[0].filename;
     if (files.stills?.length) commercial.stills = files.stills.map((file) => file.filename);

     await this.processImages(commercial);
     return this.commercialsService.create(commercial);
   }

   private normalizeCommercialData(commercialData: any): Partial<Commercial> {
     const commercial: Partial<Commercial> = { ...commercialData };

     if (typeof commercialData.sortOrder === 'string') {
       commercial.sortOrder = Number(commercialData.sortOrder) || 0;
     }

     if (typeof commercialData.stills === 'string') {
       commercial.stills = commercialData.stills
         .split(',')
         .map((still: string) => still.trim())
         .filter(Boolean);
     }

     return commercial;
   }

   private async processImages(commercial: Partial<Commercial>) {
     const uploadsDir = join(process.cwd(), 'uploads');
     
     // Optimize Cover Image & Generate SEO Image
     if (commercial.coverImage && !commercial.coverImage.startsWith('opt-')) {
       const inputPath = join(uploadsDir, commercial.coverImage);
       const seoFilename = `seo-${commercial.coverImage}`;
       const seoPath = join(uploadsDir, seoFilename);

       try {
         // 1. Generate SEO Image (1200x630 for OpenGraph)
         await sharp(inputPath)
           .resize(1200, 630, { fit: 'cover' })
           .toFormat('jpeg', { quality: 80 })
           .toFile(seoPath);
         
         commercial.seoImage = seoFilename;

         // 2. Optimize original cover (Limit width to 1920px)
         const optimizedCoverName = `opt-${commercial.coverImage}`;
         const optimizedCoverPath = join(uploadsDir, optimizedCoverName);
         await sharp(inputPath)
           .resize(1920, null, { withoutEnlargement: true })
           .toFormat('jpeg', { quality: 85 })
           .toFile(optimizedCoverPath);
         
         // Delete old one and update reference
         if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
         commercial.coverImage = optimizedCoverName;
       } catch (err) {
         console.error('Image processing failed for cover', err);
       }
     }

     // Optimize Thumbnail Image
     if (commercial.thumbnailImage && !commercial.thumbnailImage.startsWith('opt-')) {
       const inputPath = join(uploadsDir, commercial.thumbnailImage);
       const optimizedThumbName = `opt-${commercial.thumbnailImage}`;
       const optimizedThumbPath = join(uploadsDir, optimizedThumbName);

       try {
         await sharp(inputPath)
           .resize(500, null, { withoutEnlargement: true })
           .toFormat('jpeg', { quality: 85 })
           .toFile(optimizedThumbPath);
         
         if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
         commercial.thumbnailImage = optimizedThumbName;
       } catch (err) {
         console.error('Image processing failed for thumbnail', err);
       }
     }

     if (commercial.stills?.length) {
       const optimizedStills: string[] = [];

       for (const filename of commercial.stills) {
         if (
           !filename ||
           filename.startsWith('opt-') ||
           filename.startsWith('http://') ||
           filename.startsWith('https://')
         ) {
           optimizedStills.push(filename);
           continue;
         }

         const inputPath = join(uploadsDir, filename);
         const optimizedStillName = `opt-${filename}`;
         const optimizedStillPath = join(uploadsDir, optimizedStillName);

         try {
           await sharp(inputPath)
             .resize(1600, null, { withoutEnlargement: true })
             .toFormat('jpeg', { quality: 85 })
             .toFile(optimizedStillPath);

           if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
           optimizedStills.push(optimizedStillName);
         } catch (err) {
           console.error('Image processing failed for still image', err);
           optimizedStills.push(filename);
         }
       }

       commercial.stills = optimizedStills;
     }
   }

   @Put(':id')
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles(UserRole.ADMIN)
   @UseInterceptors(FileFieldsInterceptor([
     { name: 'coverImage', maxCount: 1 },
     { name: 'thumbnailImage', maxCount: 1 },
     { name: 'stills', maxCount: 30 },
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
      @Body() commercialData: any,
      @UploadedFiles() files: { coverImage?: Express.Multer.File[], thumbnailImage?: Express.Multer.File[], stills?: Express.Multer.File[] }
    ) {
      const existingCommercial = await this.commercialsService.findOne(+id);
      const commercial = this.normalizeCommercialData(commercialData);

      const shouldRemoveCover =
        commercialData.removeCoverImage === 'true' ||
        commercialData.removeCoverImage === true ||
        commercialData.coverImage === '' ||
        commercialData.coverImage === 'null';

      if (shouldRemoveCover && existingCommercial) {
        this.deleteFiles([existingCommercial.coverImage, existingCommercial.seoImage]);
        commercial.coverImage = null;
        commercial.seoImage = null;
      } else if (files.coverImage?.[0]) {
        commercial.coverImage = files.coverImage[0].filename;
        if (existingCommercial) {
          this.deleteFiles([existingCommercial.coverImage, existingCommercial.seoImage]);
        }
      }
      
      if (files.thumbnailImage?.[0]) {
        commercial.thumbnailImage = files.thumbnailImage[0].filename;
        // Delete old thumbnail if it exists
        if (existingCommercial) {
          this.deleteFiles([existingCommercial.thumbnailImage]);
        }
      }

      if (files.stills?.length) {
        commercial.stills = files.stills.map((file) => file.filename);

        if (existingCommercial) {
          this.deleteFiles(existingCommercial.stills || []);
        }
      }

      await this.processImages(commercial);
      return this.commercialsService.update(+id, commercial);
    }

   @Delete(':id')
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles(UserRole.ADMIN)
   async remove(@Param('id') id: string) {
     const commercial = await this.commercialsService.findOne(+id);
     if (commercial) {
       this.deleteFiles([
         commercial.coverImage,
         commercial.thumbnailImage,
         commercial.seoImage,
         ...(commercial.stills || []),
       ]);
     }
     return this.commercialsService.remove(+id);
   }

   private deleteFiles(filenames: (string | null | undefined)[]) {
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
