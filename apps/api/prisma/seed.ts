import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEAL_TITLES = [
  "Enterprise rollout",
  "Platform migration",
  "Annual renewal",
  "Team expansion",
  "Pilot to full deployment",
  "Multi-region license",
];

const COMPANIES = [
  "Northwind Traders",
  "Initech",
  "Globex",
  "Umbrella Corp",
  "Stark Industries",
  "Wayne Enterprises",
  "Hooli",
  "Soylent Corp",
  "Vandelay Industries",
  "Wonka Industries",
];

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("Password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@meridiancrm.dev" },
    update: {},
    create: {
      name: "Avery Chen",
      email: "admin@meridiancrm.dev",
      passwordHash,
      role: "ADMIN",
      isVerified: true,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@meridiancrm.dev" },
    update: {},
    create: {
      name: "Priya Nair",
      email: "manager@meridiancrm.dev",
      passwordHash,
      role: "SALES_MANAGER",
      isVerified: true,
    },
  });

  const exec = await prisma.user.upsert({
    where: { email: "exec@meridiancrm.dev" },
    update: {},
    create: {
      name: "Jordan Lee",
      email: "exec@meridiancrm.dev",
      passwordHash,
      role: "SALES_EXECUTIVE",
      isVerified: true,
    },
  });

  const owners = [admin, manager, exec];

  // Spread customer creation across the last 6 months for a meaningful growth chart.
  const customers = [];
  for (let i = 0; i < COMPANIES.length; i++) {
    const owner = owners[i % owners.length];
    const customer = await prisma.customer.create({
      data: {
        name: `${COMPANIES[i]} Contact`,
        company: COMPANIES[i],
        email: `contact@${COMPANIES[i].toLowerCase().replace(/\s+/g, "")}.com`,
        ownerId: owner.id,
        status: "active",
        createdAt: daysAgo(randomBetween(10, 170)),
      },
    });
    customers.push(customer);
  }

  // Leads, spread over recent months.
  const leadSources = ["Website", "Referral", "Cold Outreach", "Event", "Inbound Call"];
  for (const customer of customers) {
    await prisma.lead.create({
      data: {
        customerId: customer.id,
        source: leadSources[randomBetween(0, leadSources.length - 1)],
        score: randomBetween(20, 95),
        status: "QUALIFIED",
        assignedTo: customer.ownerId,
        createdAt: daysAgo(randomBetween(1, 150)),
      },
    });
  }

  // Deals across every pipeline stage, with WON deals backdated across 6 months for the revenue chart.
  const stages = [
    "NEW_LEAD",
    "CONTACTED",
    "QUALIFIED",
    "PROPOSAL_SENT",
    "NEGOTIATION",
    "WON",
    "WON",
    "WON",
    "LOST",
  ] as const;

  const stageOrderCounters: Record<string, number> = {
    NEW_LEAD: 0,
    CONTACTED: 0,
    QUALIFIED: 0,
    PROPOSAL_SENT: 0,
    NEGOTIATION: 0,
    WON: 0,
    LOST: 0,
  };

  for (let i = 0; i < 24; i++) {
    const customer = customers[randomBetween(0, customers.length - 1)];
    const stage = stages[randomBetween(0, stages.length - 1)];
    const isClosed = stage === "WON" || stage === "LOST";
    const closedAt = isClosed ? daysAgo(randomBetween(0, 175)) : null;
    const order = stageOrderCounters[stage]++;

    const deal = await prisma.deal.create({
      data: {
        title: `${DEAL_TITLES[randomBetween(0, DEAL_TITLES.length - 1)]} — ${customer.company}`,
        customerId: customer.id,
        stage,
        order,
        value: randomBetween(4000, 85000),
        currency: "USD",
        ownerId: customer.ownerId,
        expectedCloseDate: isClosed ? undefined : daysAgo(-randomBetween(5, 45)),
        closedAt: closedAt ?? undefined,
        createdAt: daysAgo(randomBetween(5, 180)),
      },
    });

    await prisma.activity.create({
      data: {
        type: isClosed ? `deal.${stage.toLowerCase()}` : "deal.stage_changed",
        actorId: deal.ownerId,
        relatedType: "DEAL",
        relatedId: deal.id,
        metadata: { title: deal.title, stage },
        createdAt: closedAt ?? daysAgo(randomBetween(0, 20)),
      },
    });
  }

  // Tasks — mix of overdue, due today, and upcoming, for each user.
  const taskTitles = [
    "Follow up on proposal",
    "Send contract for signature",
    "Prep demo deck",
    "Check in after onboarding",
    "Confirm renewal terms",
  ];
  for (const owner of owners) {
    for (let i = 0; i < 4; i++) {
      const dueOffset = [0, 0, -1, 3][i]; // two due today, one overdue, one upcoming
      const due = new Date();
      due.setDate(due.getDate() - dueOffset);
      due.setHours(randomBetween(9, 17), 0, 0, 0);

      await prisma.task.create({
        data: {
          title: taskTitles[randomBetween(0, taskTitles.length - 1)],
          assignedTo: owner.id,
          dueDate: due,
          status: "TODO",
          priority: i === 2 ? "high" : "normal",
        },
      });
    }
  }

  console.log("Seed complete.");
  console.log("Demo logins (password: Password123):");
  console.log("  admin@meridiancrm.dev   — Admin");
  console.log("  manager@meridiancrm.dev — Sales Manager");
  console.log("  exec@meridiancrm.dev    — Sales Executive");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
