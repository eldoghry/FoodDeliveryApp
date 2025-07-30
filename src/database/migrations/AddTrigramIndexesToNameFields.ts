import { MigrationInterface, QueryRunner } from "typeorm";

// Add trigram indexes to name fields for better search performance
export class AddTrigramIndexesToNameFields implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY idx_restaurant_name_trgm
      ON restaurant USING GIN (name gin_trgm_ops)
    `);
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY idx_cuisine_name_trgm
      ON cuisine USING GIN (name gin_trgm_ops)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS idx_restaurant_name_trgm`);
    await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS idx_cuisine_name_trgm`);
  }
}
