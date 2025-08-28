import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGeoLocationIndex implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Ensure PostGIS extension is enabled
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis`);

        // Create GIST index for spatial filtering
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_restaurant_geo_location 
            ON restaurant 
            USING GIST(geo_location)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS idx_restaurant_geo_location`);
    }
}
