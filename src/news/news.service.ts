import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from './news.entity';
import { slugify } from './slug.util';

@Injectable()
export class NewsService implements OnModuleInit {
  constructor(
    @InjectRepository(News)
    private newsRepository: Repository<News>,
  ) {}

  async onModuleInit() {
    await this.backfillMissingSlugs();
    await this.enforceSlugNotNull();
  }

  findAll(): Promise<News[]> {
    return this.newsRepository.find({
      order: { date: 'DESC' },
    });
  }

  async findAllPaginated(page: number, limit: number) {
    const [data, total] = await this.newsRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { date: 'DESC' },
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number): Promise<News> {
    const news = await this.newsRepository.findOne({ where: { id } });
    if (!news) {
      throw new NotFoundException(`News item with ID ${id} not found`);
    }
    return news;
  }

  async findBySlug(slug: string): Promise<News> {
    const decoded = decodeURIComponent(slug).trim();
    const news = await this.newsRepository.findOne({ where: { slug: decoded } });
    if (!news) {
      throw new NotFoundException(`News item with slug "${decoded}" not found`);
    }
    return news;
  }

  async create(newsData: Partial<News>): Promise<News> {
    const payload = { ...newsData };
    payload.slug = await this.resolveSlug(
      payload.slug,
      payload.title || '',
    );
    const news = this.newsRepository.create(payload);
    return this.newsRepository.save(news);
  }

  async update(id: number, newsData: Partial<News>): Promise<News> {
    const existing = await this.findOne(id);
    const payload = { ...newsData };

    if (payload.slug?.trim()) {
      payload.slug = await this.resolveSlug(payload.slug, existing.title, id);
    } else if (!existing.slug) {
      payload.slug = await this.resolveSlug(
        undefined,
        payload.title || existing.title,
        id,
      );
    } else {
      delete payload.slug;
    }

    await this.newsRepository.update(id, payload);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.newsRepository.delete(id);
  }

  private async backfillMissingSlugs() {
    const items = await this.newsRepository.find();

    for (const item of items) {
      if (item.slug?.trim()) continue;
      item.slug = await this.resolveSlug(undefined, item.title, item.id);
      await this.newsRepository.save(item);
    }

    // احتياط: أي صف بقي بدون slug
    await this.newsRepository.query(`
      UPDATE "news"
      SET "slug" = 'خبر-' || "id"::text
      WHERE "slug" IS NULL OR TRIM("slug") = ''
    `);
  }

  private async enforceSlugNotNull() {
    const [{ count }] = await this.newsRepository.query(
      `SELECT COUNT(*)::int AS count FROM "news" WHERE "slug" IS NULL`,
    );

    if (Number(count) > 0) return;

    await this.newsRepository.query(`
      ALTER TABLE "news" ALTER COLUMN "slug" SET NOT NULL
    `);
  }

  private async resolveSlug(
    requested: string | null | undefined,
    title: string,
    excludeId?: number,
  ): Promise<string> {
    const base = slugify(requested?.trim() || '') || slugify(title) || 'خبر';
    return this.ensureUniqueSlug(base, excludeId);
  }

  private async ensureUniqueSlug(base: string, excludeId?: number): Promise<string> {
    let candidate = base;
    let suffix = 1;

    while (true) {
      const existing = await this.newsRepository.findOne({
        where: { slug: candidate },
      });
      if (!existing || existing.id === excludeId) {
        return candidate;
      }
      suffix += 1;
      candidate = `${base}-${suffix}`;
    }
  }
}
