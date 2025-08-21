-- CreateTable
CREATE TABLE "AuctionSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "capturedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "itemName" TEXT NOT NULL,
    "itemId" TEXT,
    "nbtHash" TEXT,
    "quantity" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "seller" TEXT,
    "endsAt" DATETIME,
    "sourceRaw" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "FlipRecipe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "inputItem" TEXT NOT NULL,
    "outputItem" TEXT NOT NULL,
    "inputPerCraft" INTEGER NOT NULL,
    "outputPerCraft" INTEGER NOT NULL,
    "inputStackSize" INTEGER NOT NULL DEFAULT 64,
    "outputStackSize" INTEGER NOT NULL DEFAULT 64,
    "isCompress919" BOOLEAN NOT NULL DEFAULT false,
    "metadata" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "FlipRecipeAlias" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    CONSTRAINT "FlipRecipeAlias_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "FlipRecipe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FlipOpportunity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "computedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recipeId" TEXT NOT NULL,
    "inputStackPrice" INTEGER NOT NULL,
    "outputStackPrice" INTEGER NOT NULL,
    "stacksOutPerStackIn" REAL NOT NULL,
    "grossPerInputStack" INTEGER NOT NULL,
    "profitPerStack" INTEGER NOT NULL,
    "roiPercent" REAL NOT NULL,
    "liquidityNote" TEXT,
    "sampleListings" TEXT,
    "score" REAL NOT NULL,
    CONSTRAINT "FlipOpportunity_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "FlipRecipe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "AuctionSnapshot_capturedAt_idx" ON "AuctionSnapshot"("capturedAt");

-- CreateIndex
CREATE INDEX "AuctionSnapshot_itemName_capturedAt_idx" ON "AuctionSnapshot"("itemName", "capturedAt");

-- CreateIndex
CREATE INDEX "FlipRecipe_inputItem_outputItem_idx" ON "FlipRecipe"("inputItem", "outputItem");

-- CreateIndex
CREATE UNIQUE INDEX "FlipRecipeAlias_recipeId_name_key" ON "FlipRecipeAlias"("recipeId", "name");

-- CreateIndex
CREATE INDEX "FlipOpportunity_computedAt_idx" ON "FlipOpportunity"("computedAt");

-- CreateIndex
CREATE INDEX "FlipOpportunity_roiPercent_idx" ON "FlipOpportunity"("roiPercent");
