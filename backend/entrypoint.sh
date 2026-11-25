#!/bin/sh
set -e

echo "==> Running prisma migrate deploy..."
npx prisma migrate deploy

echo "==> Checking if database is empty (user count)..."
USER_COUNT=$(node -e "
const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    const count = await prisma.user.count();
    console.log(count);
  } finally {
    await prisma.\$disconnect();
  }
})().catch((e) => { console.error(e); process.exit(1); });
")

if [ "$USER_COUNT" = "0" ]; then
  echo "==> Database is empty (0 users). Seeding..."
  npm run seed
else
  echo "==> Database already has $USER_COUNT user(s). Skipping seed."
fi

echo "==> Starting backend..."
exec node dist/src/main.js
