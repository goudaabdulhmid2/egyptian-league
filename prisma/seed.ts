import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  await prisma.team.createMany({
    data: [
      { id: "1", name: "Al Ahly", shirtColor: "Red" },
      { id: "2", name: "Zamalek", shirtColor: "White" },
    ],
  });

  await prisma.player.createMany({
    data: [
      {
        id: "1",
        name: "Mohamed Salah",
        salary: 50000,
        teamId: "1",
        position: "st",
      },
      {
        id: "2",
        name: "Ahmed Hassan",
        salary: 40000,
        teamId: "2",
        position: "cd",
      },
    ],
  });

  console.log("datbase seeded");
}

seed()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
