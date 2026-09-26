-- AlterTable
ALTER TABLE "PaymentMethod" ADD COLUMN     "promptPayId" TEXT;

-- AlterTable
ALTER TABLE "PaymentTransaction" ADD COLUMN     "slipImageUrl" TEXT,
ADD COLUMN     "verifiedAt" TIMESTAMP(3);
