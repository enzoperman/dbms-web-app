const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const staffPassword = await bcrypt.hash("staff123", 10);
  const chairPassword = await bcrypt.hash("chair123", 10);
  const studentPassword = await bcrypt.hash("student123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@pup.edu.ph" },
    update: {},
    create: { email: "admin@pup.edu.ph", password: adminPassword, role: "ADMIN" }
  });

  const staff = await prisma.user.upsert({
    where: { email: "staff@pup.edu.ph" },
    update: {},
    create: { email: "staff@pup.edu.ph", password: staffPassword, role: "STAFF" }
  });

  const chair = await prisma.user.upsert({
    where: { email: "chairperson@pup.edu.ph" },
    update: {},
    create: { email: "chairperson@pup.edu.ph", password: chairPassword, role: "CHAIR" }
  });

  const student = await prisma.user.upsert({
    where: { email: "student@pup.edu.ph" },
    update: {},
    create: { email: "student@pup.edu.ph", password: studentPassword, role: "STUDENT" }
  });

  await prisma.studentProfile.upsert({
    where: { userId: student.id },
    update: {},
    create: {
      userId: student.id,
      studentNo: "2024-0001",
      firstName: "Juan",
      lastName: "Dela Cruz",
      phone: "09123456789",
      section: "CPE-3A",
      yearLevel: 3,
      course: "Computer Engineering"
    }
  });

  await prisma.request.create({
    data: {
      type: "OVERLOAD",
      semester: "2nd Sem 2025-2026",
      reason: "Need extra units for graduation plan",
      requestedById: student.id,
      subjects: {
        create: [
          {
            code: "CPE-401",
            title: "Embedded Systems",
            units: 3,
            section: "CPE-3A",
            schedule: "MWF 08:00-09:30"
          },
          {
            code: "CPE-402",
            title: "Computer Networks",
            units: 3,
            section: "CPE-3A",
            schedule: "TTh 10:00-11:30"
          }
        ]
      },
      status: "FOR_EVALUATION",
      remarks: "Reviewing overload justification.",
      statusHistory: {
        create: {
          status: "FOR_EVALUATION",
          remark: "Seeded request",
          changedById: staff.id
        }
      }
    }
  });

  console.log("Seed complete");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
