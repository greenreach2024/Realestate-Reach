import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateHomeShares1690000000000 implements MigrationInterface {
  name = 'CreateHomeShares1690000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "home_shares" (
        "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        "home_id" uuid NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
        "seller_id" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "buyer_id" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "scope" jsonb NOT NULL,
        "thread_id" uuid NULL,
        "expires_at" timestamptz NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_home_shares_home_buyer" UNIQUE ("home_id", "buyer_id")
      )`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "home_shares"');
  }
}
