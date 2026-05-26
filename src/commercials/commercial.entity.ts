import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('commercial')
export class Commercial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  title: string | null;

  @Column({ type: 'varchar', nullable: true })
  coverImage: string | null;

  @Column({ type: 'varchar', nullable: true })
  thumbnailImage: string | null;

  @Column({ type: 'varchar', nullable: true })
  youtubeTrailerLink: string | null;

  @Column({ type: 'varchar', nullable: true })
  seoImage: string | null;

  @Column({ type: 'varchar', default: '2026' })
  releaseYear: string;

  @Column({ type: 'varchar', nullable: true })
  meta: string | null;

  @Column({ type: 'text', nullable: true })
  synopsis: string | null;

  @Column({ type: 'varchar', nullable: true })
  director: string | null;

  @Column({ type: 'varchar', nullable: true })
  writer: string | null;

  @Column({ type: 'varchar', nullable: true })
  dop: string | null;

  @Column({ type: 'varchar', nullable: true })
  music: string | null;

  @Column({ type: 'varchar', nullable: true })
  editor: string | null;

  @Column({ type: 'text', nullable: true })
  cast: string | null;

  @Column({ type: 'simple-array', nullable: true })
  stills: string[] | null;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
