import "dotenv/config";
import { db } from "../server/db";
import { names } from "../shared/schema";
import { sql } from "drizzle-orm";

// 200 American female first names
const american = [
  "Emma","Olivia","Ava","Isabella","Sophia","Mia","Charlotte","Amelia","Harper","Evelyn",
  "Abigail","Emily","Elizabeth","Mila","Ella","Avery","Sofia","Camila","Aria","Scarlett",
  "Victoria","Madison","Luna","Grace","Chloe","Penelope","Layla","Riley","Zoey","Nora",
  "Lily","Eleanor","Hannah","Lillian","Addison","Aubrey","Ellie","Stella","Natalie","Zoe",
  "Leah","Hazel","Violet","Aurora","Savannah","Audrey","Brooklyn","Bella","Claire","Skylar",
  "Lucy","Paisley","Everly","Anna","Caroline","Nova","Genesis","Emilia","Kennedy","Samantha",
  "Maya","Willow","Kinsley","Naomi","Aaliyah","Elena","Sarah","Ariana","Allison","Gabriella",
  "Alice","Madelyn","Cora","Ruby","Eva","Serenity","Autumn","Adeline","Hailey","Gianna",
  "Valentina","Isla","Eliana","Quinn","Nevaeh","Ivy","Sadie","Piper","Lydia","Alexa",
  "Josephine","Emery","Julia","Delilah","Arianna","Vivian","Kaylee","Sophie","Brielle","Madeline",
  "Peyton","Rylee","Clara","Hadley","Melanie","Mackenzie","Reagan","Adalynn","Liliana","Aubree",
  "Jade","Katherine","Isabelle","Natalia","Raelynn","Maria","Athena","Ximena","Arya","Leilani",
  "Taylor","Faith","Rose","Kylie","Alexandra","Mary","Margaret","Lyla","Ashley","Amaya",
  "Eliza","Brianna","Bailey","Andrea","Khloe","Jasmine","Melody","Iris","Isabel","Norah",
  "Annabelle","Valerie","Amara","Adaline","Arabella","Alyssa","Diana","Lauren","Reese","Juliana",
  "Morgan","Kayla","Sydney","Daisy","Charlie","Brooke","Catalina","Adelyn","Juliette","Hayden",
  "Aspen","Brynlee","Ember","Adelaide","Madilyn","Eden","Vanessa","Jordyn","Maggie","Kimberly",
  "Kendall","Elliana","Jocelyn","Cecilia","Lilly","Harmony","Brynn","Sienna","Mckenzie","Esther",
  "Dakota","Trinity","Alaina","Presley","Rachel","Eliana","Summer","Alana","Brooklynn","Gracie",
  "Mariah","Phoebe","Daniela","Adriana","Adalyn","Michelle","Kate","Kayleigh","Camille","Amber",
];

// 150 Asian female first names (Chinese / Japanese / Korean / Indian mix, all unique)
const asian = [
  // Chinese (40)
  "Mei","Lin","Xia","Hua","Jing","Li","Yan","Fang","Ying","Hong",
  "Min","Xiu","Qing","Lan","Hui","Yun","Ling","Ping","Wei","Xin",
  "Yue","Zhen","Bao","Chun","Dan","Fen","Jia","Juan","Lei","Nuan",
  "Ru","Shan","Tao","Wen","Xue","Ya","Zhi","Cai","Feng","Yumei",
  // Japanese (30)
  "Sakura","Yuki","Hana","Aiko","Hiroko","Keiko","Michiko","Akiko","Yumi","Emi",
  "Kaori","Haruka","Saki","Rina","Ayaka","Mio","Nanami","Riko","Akari","Honoka",
  "Mizuki","Tsubasa","Yui","Asuka","Chika","Eri","Kana","Sayuri","Tomoko","Reiko",
  // Korean (30)
  "Seo-yeon","Ji-woo","Ha-eun","Soo-ah","Da-eun","Ye-jin","Ji-hyun","Soo-jin","Eun-ji","Hye-jin",
  "Min-ji","Soo-bin","Hae-won","Ji-yeon","Bo-ra","Chae-won","Da-hee","So-young","Yu-na","Ji-an",
  "Na-eun","Su-min","Hyo-rin","Mi-na","Eun-bi","Ga-yeon","Ha-rin","In-na","Joo-hee","Yoon-seo",
  // Indian (50)
  "Aanya","Aarohi","Aditi","Anika","Anjali","Ananya","Avani","Diya","Esha","Gauri",
  "Ishita","Janvi","Kavya","Khushi","Kiara","Lavanya","Mahi","Meera","Myra","Naina",
  "Nisha","Pari","Pooja","Priya","Riya","Saanvi","Sanya","Shreya","Sia","Tanvi",
  "Tara","Trisha","Vanya","Yashika","Zara","Aisha","Anushka","Bhavna","Charvi","Devika",
  "Falak","Gitanjali","Hema","Indira","Jyoti","Kashvi","Lakshmi","Manya","Navya","Omisha",
];

// 150 Vietnamese female first names
const vietnamese = [
  "An","Anh","Bích","Châu","Chi","Cúc","Dao","Diễm","Diệp","Diệu",
  "Đào","Đan","Đông","Giang","Hà","Hải","Hằng","Hạnh","Hậu","Hiền",
  "Hiếu","Hoa","Hoài","Hoàng","Hồng","Huệ","Hương","Huyền","Khánh","Khuê",
  "Kim","Lan","Lệ","Liên","Linh","Loan","Lụa","Mai","Mây","Minh",
  "My","Mỹ","Nga","Ngân","Ngọc","Nguyệt","Nhi","Nhung","Như","Oanh",
  "Phương","Phượng","Quế","Quỳnh","Sương","Tâm","Tân","Thảo","Thắm","Thanh",
  "Thoa","Thu","Thúy","Thủy","Tiên","Trà","Trang","Trân","Trinh","Tú",
  "Tuyết","Uyên","Vân","Vy","Xuân","Yến","Bảo","Bình","Cẩm","Diệu Linh",
  "Hà Anh","Hải Yến","Hồng Anh","Hương Giang","Khánh Linh","Lan Anh","Mai Anh","Mai Phương","Minh Anh","Minh Châu",
  "Minh Hà","Minh Khuê","Minh Tâm","Minh Thư","Mỹ Duyên","Mỹ Hạnh","Mỹ Linh","Mỹ Tâm","Ngọc Anh","Ngọc Bích",
  "Ngọc Diệp","Ngọc Hà","Ngọc Hân","Ngọc Hoa","Ngọc Huyền","Ngọc Lan","Ngọc Linh","Ngọc Mai","Ngọc Minh","Ngọc Trâm",
  "Phương Anh","Phương Linh","Phương Mai","Phương Thảo","Phương Trinh","Phương Uyên","Quỳnh Anh","Quỳnh Chi","Quỳnh Hương","Quỳnh Như",
  "Thanh Hà","Thanh Hằng","Thanh Hương","Thanh Loan","Thanh Mai","Thanh Nhàn","Thanh Tâm","Thanh Thảo","Thanh Thúy","Thanh Trúc",
  "Thảo Linh","Thảo My","Thảo Nguyên","Thảo Vy","Thiên Hương","Thiên Kim","Thiên Nga","Thiên Thanh","Thu Hà","Thu Hằng",
  "Thu Hiền","Thu Hương","Thu Phương","Thu Thảo","Thu Trang","Thúy An","Thúy Hằng","Thúy Hiền","Thúy Linh","Thúy Nga",
];

async function seed() {
  // Tag with origin and de-dupe within each origin (Vietnamese names with diacritics
  // are unique against ASCII-only American/Asian sets at the (name, origin) level).
  const rows = [
    ...american.map((name) => ({ name, origin: "American", gender: "female" })),
    ...asian.map((name) => ({ name, origin: "Asian", gender: "female" })),
    ...vietnamese.map((name) => ({ name, origin: "Vietnamese", gender: "female" })),
  ];

  console.log(
    `Seeding names: American=${american.length}, Asian=${asian.length}, Vietnamese=${vietnamese.length}, total=${rows.length}`,
  );

  // Wipe and reseed for a clean, idempotent state.
  await db.execute(sql`TRUNCATE TABLE names RESTART IDENTITY`);

  // Batch inserts to keep parameter counts sane.
  const BATCH = 200;
  for (let i = 0; i < rows.length; i += BATCH) {
    await db.insert(names).values(rows.slice(i, i + BATCH)).onConflictDoNothing();
  }

  const [{ count }] = (await db.execute(
    sql`SELECT COUNT(*)::int AS count FROM names`,
  )).rows as Array<{ count: number }>;
  console.log(`Done. names table now has ${count} rows.`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
