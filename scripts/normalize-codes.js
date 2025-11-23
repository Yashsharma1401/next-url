/**
 * Migration script to normalize all existing link codes to lowercase
 * Run with: node scripts/normalize-codes.js
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting code normalization...");

  // Get all links
  const links = await prisma.link.findMany();
  console.log(`Found ${links.length} links to process`);

  let updated = 0;
  const failed = [];

  for (const link of links) {
    const lowerCode = link.code.toLowerCase();

    // Only update if code is different
    if (link.code !== lowerCode) {
      try {
        // Check if lowercase version already exists (collision)
        const existing = await prisma.link.findUnique({
          where: { code: lowerCode },
        });

        if (existing && existing.id !== link.id) {
          console.warn(`⚠️  Skipping ${link.code}: lowercase version ${lowerCode} already exists (ID: ${existing.id})`);
          failed.push({
            code: link.code,
            reason: `Collision with ID ${existing.id}`,
          });
          continue;
        }

        // Update the code to lowercase
        await prisma.link.update({
          where: { id: link.id },
          data: { code: lowerCode },
        });

        console.log(`✓ Updated ${link.code} → ${lowerCode}`);
        updated++;
      } catch (error) {
        console.error(`✗ Failed to update ${link.code}:`, error.message);
        failed.push({
          code: link.code,
          reason: error.message,
        });
      }
    }
  }

  console.log(`\n✓ Migration complete!`);
  console.log(`  - Updated: ${updated}`);
  console.log(`  - Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log("\nFailed items:");
    failed.forEach((item) => {
      console.log(`  - ${item.code}: ${item.reason}`);
    });
  }
}

main()
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
