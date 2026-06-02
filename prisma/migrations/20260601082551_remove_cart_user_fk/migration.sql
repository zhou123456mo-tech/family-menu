-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CartItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "dishId" TEXT NOT NULL,
    "methodId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "remark" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CartItem_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "Dish" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CartItem_methodId_fkey" FOREIGN KEY ("methodId") REFERENCES "DishMethod" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CartItem" ("createdAt", "dishId", "id", "methodId", "quantity", "remark", "updatedAt", "userId") SELECT "createdAt", "dishId", "id", "methodId", "quantity", "remark", "updatedAt", "userId" FROM "CartItem";
DROP TABLE "CartItem";
ALTER TABLE "new_CartItem" RENAME TO "CartItem";
CREATE UNIQUE INDEX "CartItem_userId_dishId_methodId_key" ON "CartItem"("userId", "dishId", "methodId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
