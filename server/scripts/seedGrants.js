import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

if (!admin.apps.length) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({ credential: admin.credential.cert(sa) });
  } else {
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
  }
}

const db = admin.firestore();
const COLLECTION = "opportunities";

const NEW_GRANTS = [
  // Conference
  {
    opportunityId: "grant_021",
    title: "IEEE International Conference on AI — Travel Grant",
    type: "conference",
    country: "USA",
    organization: "IEEE",
    degree: ["bachelor", "master", "phd"],
    field: ["IT & CS", "Engineering"],
    fundingType: "full",
    amount: "$2,000 travel + registration",
    language: "English",
    minGPA: 3.0,
    minIELTS: 6.0,
    deadline: "2026-06-15",
    trustScore: 95,
    verificationStatus: "verified",
    sourceUrl: "https://ieee.org",
    description:
      "IEEE xalqaro sun'iy intellekt konferensiyasi uchun sayohat granti. Maqola qabul qilingan talabalar uchun to'liq sayohat va ro'yxatga olish xarajatlari qoplanadi.",
  },
  {
    opportunityId: "grant_022",
    title: "UNESCO Youth Climate Conference Grant",
    type: "conference",
    country: "France",
    organization: "UNESCO",
    degree: ["bachelor", "master", "phd"],
    field: ["All Fields"],
    fundingType: "full",
    amount: "€1,500 travel + accommodation",
    language: "English / French",
    minGPA: 0,
    minIELTS: 5.5,
    deadline: "2026-04-30",
    trustScore: 98,
    verificationStatus: "verified",
    sourceUrl: "https://unesco.org",
    description:
      "UNESCO iqlim o'zgarishi bo'yicha yoshlar konferensiyasi. Dunyo bo'ylab 200+ yoshlar ishtirok etadi. To'liq sayohat va turar joy xarajatlari qoplanadi.",
  },
  // Research
  {
    opportunityId: "grant_023",
    title: "DAAD Research Fellowship for Developing Countries",
    type: "research",
    country: "Germany",
    organization: "DAAD",
    degree: ["master", "phd"],
    field: ["All Fields"],
    fundingType: "full",
    amount: "€1,200/month + travel",
    language: "English / German",
    minGPA: 3.2,
    minIELTS: 6.5,
    deadline: "2026-07-31",
    trustScore: 97,
    verificationStatus: "verified",
    sourceUrl: "https://daad.de",
    description:
      "Rivojlanayotgan mamlakatlar talabalari uchun Germaniyada ilmiy tadqiqot olib borish imkoniyati. 6-12 oylik dastur.",
  },
  {
    opportunityId: "grant_024",
    title: "JSPS Research Fellowship — Japan",
    type: "research",
    country: "Japan",
    organization: "JSPS",
    degree: ["phd"],
    field: ["All Fields"],
    fundingType: "full",
    amount: "¥362,000/month",
    language: "English / Japanese",
    minGPA: 3.5,
    minIELTS: 6.0,
    deadline: "2026-05-15",
    trustScore: 96,
    verificationStatus: "verified",
    sourceUrl: "https://jsps.go.jp",
    description:
      "Yaponiya Fan Jamiyati PhD talabalar uchun tadqiqot fellowship dasturi. 12-24 oy davomida Yaponiyaning yetakchi universitetlarida tadqiqot.",
  },
  // Stajirovka
  {
    opportunityId: "grant_025",
    title: "Google STEP Internship — Software Engineering",
    type: "stajirovka",
    country: "USA",
    organization: "Google",
    degree: ["bachelor"],
    field: ["IT & CS"],
    fundingType: "stipend",
    amount: "$8,000/month + housing",
    language: "English",
    minGPA: 3.0,
    minIELTS: 6.5,
    deadline: "2026-03-01",
    trustScore: 99,
    verificationStatus: "verified",
    sourceUrl: "https://google.com/careers",
    description:
      "Google STEP amaliyot dasturi — 1-2 kurs talabalari uchun 12 haftalik dasturiy ta'minot muhandisligi amaliyoti.",
  },
  {
    opportunityId: "grant_026",
    title: "Samsung SDS Global Internship",
    type: "stajirovka",
    country: "South Korea",
    organization: "Samsung SDS",
    degree: ["bachelor", "master"],
    field: ["IT & CS", "Engineering"],
    fundingType: "stipend",
    amount: "₩2,500,000/month + dormitory",
    language: "English / Korean",
    minGPA: 3.0,
    minIELTS: 6.0,
    deadline: "2026-04-15",
    trustScore: 93,
    verificationStatus: "verified",
    sourceUrl: "https://samsungsds.com",
    description:
      "Samsung SDS xalqaro amaliyot dasturi — IT va muhandislik sohasidagi talabalar uchun 8 haftalik amaliyot Seulda.",
  },
  // Language Program
  {
    opportunityId: "grant_027",
    title: "Goethe-Institut German Language Scholarship",
    type: "language_program",
    country: "Germany",
    organization: "Goethe-Institut",
    degree: ["high_school", "bachelor", "master", "phd"],
    field: ["All Fields"],
    fundingType: "full",
    amount: "€3,000 (course + accommodation)",
    language: "German",
    minGPA: 0,
    minIELTS: 0,
    deadline: "2026-05-30",
    trustScore: 96,
    verificationStatus: "verified",
    sourceUrl: "https://goethe.de",
    description:
      "Goethe-Institut nemis tili intensiv kurs stipendiyasi. 4-8 haftalik Germaniyada yashab o'rganish dasturi.",
  },
  {
    opportunityId: "grant_028",
    title: "Korean Government Scholarship — Korean Language Program",
    type: "language_program",
    country: "South Korea",
    organization: "NIIED",
    degree: ["high_school", "bachelor", "master"],
    field: ["All Fields"],
    fundingType: "full",
    amount: "₩800,000/month + tuition",
    language: "Korean",
    minGPA: 2.5,
    minIELTS: 0,
    deadline: "2026-03-15",
    trustScore: 97,
    verificationStatus: "verified",
    sourceUrl: "https://studyinkorea.go.kr",
    description:
      "Koreya hukumati stipendiyasi — 1 yillik koreys tili o'rganish dasturi. To'liq moliyalashtiriladi: kurs xarajatlari, stipendiya, sug'urta.",
  },
];

async function seed() {
  console.log("Seeding new grants...");
  for (const grant of NEW_GRANTS) {
    const ref = db.collection(COLLECTION).doc(grant.opportunityId);
    await ref.set({ ...grant, createdAt: new Date() }, { merge: true });
    console.log(`  ✓ ${grant.opportunityId}: ${grant.title}`);
  }
  console.log(`Done. ${NEW_GRANTS.length} grants seeded.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
