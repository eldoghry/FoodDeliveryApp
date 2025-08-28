import { MigrationInterface, QueryRunner } from "typeorm";

export class AddItemAvailableIndex implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_item_available
      ON item(item_id)
      WHERE is_available = true AND deleted_at IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_item_available`);
  }
}
