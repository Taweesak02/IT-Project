CREATE TYPE "ApprovalStatus" AS ENUM ('APPROVED', 'UNAPPROVED', 'RESUBMIT');

ALTER TABLE "Comic" ADD COLUMN "resubmitAt" TIMESTAMP(3);
ALTER TABLE "Comic" ADD COLUMN "approved_new" "ApprovalStatus";

UPDATE "Comic"
SET "approved_new" = CASE
    WHEN "approved" = true THEN 'APPROVED'::"ApprovalStatus"
    ELSE 'UNAPPROVED'::"ApprovalStatus"
END;

ALTER TABLE "Comic" ALTER COLUMN "approved_new" SET NOT NULL;
ALTER TABLE "Comic" ALTER COLUMN "approved_new" SET DEFAULT 'APPROVED';
ALTER TABLE "Comic" DROP COLUMN "approved";
ALTER TABLE "Comic" RENAME COLUMN "approved_new" TO "approved";
