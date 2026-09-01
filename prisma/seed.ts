import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.message.deleteMany();
  await prisma.buyer.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.benefit.deleteMany();
  await prisma.company.deleteMany();
  await prisma.seller.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      id: "demo-seller",
      email: "seller@marketplace.dev",
      role: "SELLER",
      status: "ACTIVE",
    },
  });

  const seller = await prisma.seller.create({
    data: {
      userId: user.id,
    },
  });

  const [buyerUser, secondBuyerUser] = await Promise.all([
    prisma.user.create({
      data: {
        id: "demo-buyer",
        email: "alex.rivera@apexcapital.dev",
        role: "BUYER",
        status: "ACTIVE",
      },
    }),
    prisma.user.create({
      data: {
        id: "demo-buyer-sophia",
        email: "sophia.chen@novapayments.dev",
        role: "BUYER",
        status: "ACTIVE",
      },
    }),
  ]);

  await prisma.buyer.createMany({
    data: [
      {
        contactName: "Alex Rivera",
        companyName: "Apex Capital Ventures",
        investmentInterests:
          "Looking for European EMI, PI, or Crypto licenses with active client base, budget up to €15M.",
        userId: buyerUser.id,
      },
      {
        contactName: "Sophia Chen",
        companyName: "Nova Payments Ltd",
        investmentInterests:
          "Seeking operational payment institutions in North America or LatAm (Canada MSB, Brazil PI).",
        userId: secondBuyerUser.id,
      },
    ],
  });

  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: "Maple Payments MSB",
        overviewText:
          "A licensed money service business focused on cross-border disbursement and wallet operations in North America.",
        accountDetails:
          "USD account, settlement rails, merchant processing privileges, risk controls in place.",
        sellerId: seller.id,
      },
    }),
    prisma.company.create({
      data: {
        name: "Rio Digital Instituição de Pagamento",
        overviewText:
          "Digital payments operator with card processing and local payment infrastructure serving Brazil and Europe.",
        accountDetails:
          "EUR and BRL settlement accounts, PSP infrastructure, multi-currency wallet support.",
        sellerId: seller.id,
      },
    }),
    prisma.company.create({
      data: {
        name: "Northstar FX Group",
        overviewText:
          "Foreign exchange and treasury platform providing B2B FX settlement and treasury management services.",
        accountDetails:
          "Treasury accounts, liquidity partners, stablecoin rails, compliance reporting configuration.",
        sellerId: seller.id,
      },
    }),
  ]);

  const benefitNames = [
    "Foreign-Exchange",
    "Virtual-Currency",
    "Money-Transfer",
    "API Access",
    "Payment Accounts",
  ];

  const benefits = await Promise.all(
    benefitNames.map((name) =>
      prisma.benefit.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  const benefitMap = new Map(benefits.map((benefit) => [benefit.name, benefit]));

  const assetSeeds = [
    {
      descriptionShort:
        "Licensed MSB platform offering wallet and international payment processing for fintech clients.",
      country: "Canada",
      askingPrice: 4200000,
      currency: "EUR",
      typeOfBusiness: "Bank",
      typeOfLicense: "MSB",
      businessStatus: "Active",
      assetType: "Active Business (Licensed)",
      regulatory: "FINTRAC regulated",
      employees: "45",
      yearOfIssue: "2021",
      companyId: companies[0].id,
      benefitNames: ["Foreign-Exchange", "Money-Transfer", "Payment Accounts"],
    },
    {
      descriptionShort:
        "Digital payments company with high-volume card acquisition and local transfer rails across LATAM.",
      country: "Brazil",
      askingPrice: 6800000,
      currency: "EUR",
      typeOfBusiness: "Fintech",
      typeOfLicense: "Payment Institution",
      businessStatus: "Active",
      assetType: "Active Business (Licensed)",
      regulatory: "Brazilian Central Bank supervised",
      employees: "82",
      yearOfIssue: "2022",
      companyId: companies[1].id,
      benefitNames: ["API Access", "Payment Accounts", "Virtual-Currency"],
    },
    {
      descriptionShort:
        "FX and treasury advisory business with multi-jurisdiction treasury relationships and settlement workflows.",
      country: "United Kingdom",
      askingPrice: 3100000,
      currency: "EUR",
      typeOfBusiness: "Payment",
      typeOfLicense: "FX License",
      businessStatus: "Active",
      assetType: "Active Business (Licensed)",
      regulatory: "FCA monitored",
      employees: "31",
      yearOfIssue: "2020",
      companyId: companies[2].id,
      benefitNames: ["Foreign-Exchange", "API Access", "Money-Transfer"],
    },
    {
      descriptionShort:
        "Consumer fintech platform with lending rails, revenue-sharing partnerships, and strong recurring customer demand.",
      country: "Australia",
      askingPrice: 5100000,
      currency: "USD",
      typeOfBusiness: "EMI",
      typeOfLicense: "Credit License",
      businessStatus: "Not active",
      assetType: "Active Business (Licensed)",
      regulatory: "ASIC regulated",
      employees: "58",
      yearOfIssue: "2023",
      companyId: companies[0].id,
      benefitNames: ["API Access", "Payment Accounts", "Virtual-Currency"],
    },
    {
      descriptionShort:
        "Cross-border settlement platform with institutional client onboarding and treasury connectivity across Europe.",
      country: "Germany",
      askingPrice: 2900000,
      currency: "EUR",
      typeOfBusiness: "Crypto",
      typeOfLicense: "Fintech License",
      businessStatus: "Active",
      assetType: "Active Business (Licensed)",
      regulatory: "BaFin monitored",
      employees: "26",
      yearOfIssue: "2021",
      companyId: companies[2].id,
      benefitNames: ["Foreign-Exchange", "Money-Transfer"],
    },
    {
      descriptionShort:
        "Processing business for SMB merchants with debit card coverage and regional settlement relationships.",
      country: "France",
      askingPrice: 3700000,
      currency: "EUR",
      typeOfBusiness: "Bank",
      typeOfLicense: "PSP",
      businessStatus: "Active",
      assetType: "Active Business (Licensed)",
      regulatory: "French regulator supervised",
      employees: "41",
      yearOfIssue: "2022",
      companyId: companies[1].id,
      benefitNames: ["API Access", "Payment Accounts"],
    },
    {
      descriptionShort:
        "Blockchain and wallet infrastructure provider focused on remittance and stablecoin settlement for enterprise clients.",
      country: "United States",
      askingPrice: 7800000,
      currency: "USD",
      typeOfBusiness: "Fintech",
      typeOfLicense: "Money Transmission",
      businessStatus: "Active",
      assetType: "Active Business (Licensed)",
      regulatory: "State and federal compliance",
      employees: "67",
      yearOfIssue: "2021",
      companyId: companies[0].id,
      benefitNames: ["Virtual-Currency", "Foreign-Exchange", "Money-Transfer"],
    },
    {
      descriptionShort:
        "Regional payment gateway with strong compliance controls and recurring SaaS-enabled revenue from SMEs.",
      country: "Spain",
      askingPrice: 4600000,
      currency: "EUR",
      typeOfBusiness: "Payment",
      typeOfLicense: "Payment Institution",
      businessStatus: "Active",
      assetType: "Active Business (Licensed)",
      regulatory: "Spanish regulator approved",
      employees: "54",
      yearOfIssue: "2023",
      companyId: companies[1].id,
      benefitNames: ["API Access", "Payment Accounts", "Money-Transfer"],
    },
    {
      descriptionShort:
        "Treasury optimization business serving stablecoin and bank transfer flows for international clients.",
      country: "Cayman Islands",
      askingPrice: 6200000,
      currency: "USD",
      typeOfBusiness: "EMI",
      typeOfLicense: "FX License",
      businessStatus: "Active",
      assetType: "Active Business (Licensed)",
      regulatory: "Offshore compliance framework",
      employees: "24",
      yearOfIssue: "2022",
      companyId: companies[2].id,
      benefitNames: ["Foreign-Exchange", "Virtual-Currency"],
    },
    {
      descriptionShort:
        "Cross-border B2B payment operator with multi-currency accounts and local settlement support in APAC.",
      country: "Singapore",
      askingPrice: 5400000,
      currency: "USD",
      typeOfBusiness: "Crypto",
      typeOfLicense: "Payment License",
      businessStatus: "Active",
      assetType: "Active Business (Licensed)",
      regulatory: "MAS compliant",
      employees: "49",
      yearOfIssue: "2024",
      companyId: companies[0].id,
      benefitNames: ["Money-Transfer", "API Access", "Payment Accounts"],
    },
    {
      descriptionShort:
        "Merchant wallet company serving local commerce with tools for recurring billing and payout automation.",
      country: "Brazil",
      askingPrice: 3300000,
      currency: "EUR",
      typeOfBusiness: "Fintech",
      typeOfLicense: "E-money License",
      businessStatus: "Active",
      assetType: "Active Business (Licensed)",
      regulatory: "Brazilian authority approved",
      employees: "39",
      yearOfIssue: "2021",
      companyId: companies[1].id,
      benefitNames: ["Payment Accounts", "Virtual-Currency", "API Access"],
    },
    {
      descriptionShort:
        "International finance and remittance company with recurring revenue, optimized payout workflows, and partner network.",
      country: "United Kingdom",
      askingPrice: 7100000,
      currency: "GBP",
      typeOfBusiness: "Payment",
      typeOfLicense: "Money Transfer",
      businessStatus: "Active",
      assetType: "Active Business (Licensed)",
      regulatory: "FCA e-money oversight",
      employees: "63",
      yearOfIssue: "2020",
      companyId: companies[2].id,
      benefitNames: ["Foreign-Exchange", "Money-Transfer", "Payment Accounts"],
    },
  ];

  for (const assetSeed of assetSeeds) {
    const asset = await prisma.asset.create({
      data: {
        descriptionShort: assetSeed.descriptionShort,
        country: assetSeed.country,
        askingPrice: assetSeed.askingPrice,
        currency: assetSeed.currency,
        typeOfBusiness: assetSeed.typeOfBusiness,
        typeOfLicense: assetSeed.typeOfLicense,
        businessStatus: assetSeed.businessStatus,
        assetType: assetSeed.assetType,
        regulatory: assetSeed.regulatory,
        employees: assetSeed.employees,
        yearOfIssue: assetSeed.yearOfIssue,
        isValidated: true,
        views: 120 + Math.floor(Math.random() * 500),
        favorites: 12 + Math.floor(Math.random() * 60),
        sellerId: seller.id,
        companyId: assetSeed.companyId,
        benefits: {
          connect: assetSeed.benefitNames.map((name) => ({ id: benefitMap.get(name)!.id })),
        },
      },
    });

    if (asset === undefined) {
      continue;
    }

    if (assetSeed === assetSeeds[0]) {
      await prisma.message.createMany({
        data: [
          {
            senderId: buyerUser.id,
            receiverId: user.id,
            assetId: asset.id,
            content:
              "Hello, I would like to understand the current client mix and the timeline for transferring this Canadian MSB.",
          },
          {
            senderId: user.id,
            receiverId: buyerUser.id,
            assetId: asset.id,
            content:
              "Thanks Alex. The business has an active cross-border client base, and we can share the information memorandum under NDA.",
          },
        ],
      });
    }

    console.log(`Created asset: ${asset.id}`);
  }

  console.log("Seed complete");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
