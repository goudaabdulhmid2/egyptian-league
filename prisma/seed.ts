import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  // await prisma.team.createMany({
  //   data: [
  //     { name: "Man city", shirtColor: "Blue" },
  //     { name: "Barca", shirtColor: "Red" },
  //   ],
  // });

  await prisma.player.createMany({
    data: [
      {
        id: "d4fe0692-bf0e-4db2-8723-edadcb57fa53",
        name: "mo",
        salary: 50000,
        teamId: "46e3129d-59ee-4e53-976d-ba053a53a7f0",
        position: "st",
      },
      {
        id: "d4fe0692-bf0e-4db2-8723-edadcb57fa43",
        name: "hamid",
        salary: 40000,
        teamId: "46e3129d-59ee-4e53-976d-ba053a53a7f0",
        position: "cd",
      },
    ],
  });

  console.log("datbase seeded");
}

seed()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
