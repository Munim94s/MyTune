/*
  Warnings:

  - The primary key for the `History` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Library` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `userId` to the `History` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Library` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Playlist` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "History" DROP CONSTRAINT "History_pkey",
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "History_pkey" PRIMARY KEY ("userId", "videoId");

-- AlterTable
ALTER TABLE "Library" DROP CONSTRAINT "Library_pkey",
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "Library_pkey" PRIMARY KEY ("userId", "videoId");

-- AlterTable
ALTER TABLE "Playlist" ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Library" ADD CONSTRAINT "Library_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Playlist" ADD CONSTRAINT "Playlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
