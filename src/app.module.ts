import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Entities
import { Show } from './shows/show.entity';
import { User } from './users/user.entity';
import { Setting } from './settings/setting.entity';
import { Backstage } from './backstage/backstage.entity';
import { News } from './news/news.entity';

// Modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SettingsModule } from './settings/settings.module';

// Controllers and Services
import { ShowsController } from './shows/shows.controller';
import { ShowsService } from './shows/shows.service';
import { BackstageService } from './backstage/backstage.service';
import { NewsController } from './news/news.controller';
import { NewsService } from './news/news.service';
import { BackstageController } from './backstage/backstage.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'root'),
        database: configService.get<string>('DB_DATABASE', 'ali_fadhil'),
        entities: [Show, User, Setting, Backstage, News],
        synchronize: false, // Turned off for manual migrations
      }),
    }),
    TypeOrmModule.forFeature([Show, User, Setting, Backstage, News]),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    AuthModule,
    UsersModule,
    SettingsModule,
  ],
  controllers: [AppController, ShowsController, BackstageController, NewsController],
  providers: [AppService, ShowsService, BackstageService, NewsService],
})
export class AppModule { }
