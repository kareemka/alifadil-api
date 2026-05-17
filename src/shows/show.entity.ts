import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Show {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  coverImage: string; // Landscape for background

  @Column({ nullable: true })
  thumbnailImage: string; // Portrait for cards

  @Column({ nullable: true })
  youtubeTrailerLink: string;


  @Column({ nullable: true })
  seoImage: string; // Optimized image for SEO/Social sharing

  @Column({ default: '2026' })
  releaseYear: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
