-- CreateTable
CREATE TABLE "CompressedImage" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "compressedFilename" TEXT NOT NULL,
    "quality" INTEGER NOT NULL,
    "bpp" DOUBLE PRECISION NOT NULL,
    "psnr" DOUBLE PRECISION NOT NULL,
    "ssim" DOUBLE PRECISION NOT NULL,
    "msSsim" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompressedImage_pkey" PRIMARY KEY ("id")
);
