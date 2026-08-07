import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const skills = [
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "Express.js",
    "PostgreSQL",
    "MongoDB",
    "Prisma",
    "Solidity",
    "Ethereum",
    "Blockchain",
    "Tailwind CSS",
    "Java",
    "Python",
    "Machine Learning",
    "AI",
    "UI/UX",
    "Figma",
    "Docker",
  ];

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { name: skill },
      update: {},
      create: { name: skill },
    });
  }

  console.log("Skills seeded successfully");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });