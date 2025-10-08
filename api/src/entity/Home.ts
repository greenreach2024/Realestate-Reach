import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'homes' })
export class Home {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  name!: string;
}

export default Home;
