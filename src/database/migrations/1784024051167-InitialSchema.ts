import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1784024051167 implements MigrationInterface {
    name = 'InitialSchema1784024051167'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "mitre_techniques" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "techniqueId" character varying NOT NULL, "tactic" character varying NOT NULL, "name" character varying NOT NULL, "description" text, CONSTRAINT "UQ_052ebf536600dbd8fab83478877" UNIQUE ("techniqueId"), CONSTRAINT "PK_7f6c8b1fbf9a3025b1b7f81c647" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "alert_techniques" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "alert_id" uuid, "technique_id" uuid, CONSTRAINT "PK_caa6895084ce778ed4302d43c50" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "alert_scores" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "severityScore" double precision NOT NULL, "techniqueScore" double precision NOT NULL, "frequencyScore" double precision NOT NULL, "finalScore" double precision NOT NULL, "alert_id" uuid, CONSTRAINT "REL_2a7f2ded870537da96c3f5d314" UNIQUE ("alert_id"), CONSTRAINT "PK_559bc320a9f3d6929bdb66a6c21" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "alerts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ruleId" integer NOT NULL, "ruleLevel" integer NOT NULL, "ruleDescription" text, "rawPayload" jsonb NOT NULL, "agentName" character varying, "alertTime" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_60f895662df096bfcdfab7f4b96" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."alert_dispositions_status_enum" AS ENUM('open', 'reviewed', 'false_positive', 'escalated')`);
        await queryRunner.query(`CREATE TABLE "alert_dispositions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."alert_dispositions_status_enum" NOT NULL DEFAULT 'open', "analyst" character varying, "notes" text, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "alert_id" uuid, CONSTRAINT "REL_9b3436f1b39ee3dd5167039a83" UNIQUE ("alert_id"), CONSTRAINT "PK_1c3e0a99b583cb3708b8c707b8a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "alert_techniques" ADD CONSTRAINT "FK_386fbe920209b7341b4560103d4" FOREIGN KEY ("alert_id") REFERENCES "alerts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "alert_techniques" ADD CONSTRAINT "FK_48e9f043f4397459a6ae0355772" FOREIGN KEY ("technique_id") REFERENCES "mitre_techniques"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "alert_scores" ADD CONSTRAINT "FK_2a7f2ded870537da96c3f5d314f" FOREIGN KEY ("alert_id") REFERENCES "alerts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "alert_dispositions" ADD CONSTRAINT "FK_9b3436f1b39ee3dd5167039a83a" FOREIGN KEY ("alert_id") REFERENCES "alerts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alert_dispositions" DROP CONSTRAINT "FK_9b3436f1b39ee3dd5167039a83a"`);
        await queryRunner.query(`ALTER TABLE "alert_scores" DROP CONSTRAINT "FK_2a7f2ded870537da96c3f5d314f"`);
        await queryRunner.query(`ALTER TABLE "alert_techniques" DROP CONSTRAINT "FK_48e9f043f4397459a6ae0355772"`);
        await queryRunner.query(`ALTER TABLE "alert_techniques" DROP CONSTRAINT "FK_386fbe920209b7341b4560103d4"`);
        await queryRunner.query(`DROP TABLE "alert_dispositions"`);
        await queryRunner.query(`DROP TYPE "public"."alert_dispositions_status_enum"`);
        await queryRunner.query(`DROP TABLE "alerts"`);
        await queryRunner.query(`DROP TABLE "alert_scores"`);
        await queryRunner.query(`DROP TABLE "alert_techniques"`);
        await queryRunner.query(`DROP TABLE "mitre_techniques"`);
    }

}
