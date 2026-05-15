import { Link } from "react-router-dom";
import { ArrowRight, Bot, CalendarCheck, CheckCircle2, GraduationCap, Search, ShieldCheck } from "lucide-react";
import SEO from "../components/SEO.jsx";

const SITE_URL = "https://edu-fund.uz";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "EduFund AI",
      url: SITE_URL,
      logo: `${SITE_URL}/og-image.svg`,
      sameAs: [],
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#webapp`,
      name: "EduFund AI",
      url: SITE_URL,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: ["uz", "en"],
      description:
        "O'zbekistonlik talabalar uchun grantlar, stipendiyalar va xorijda o'qish imkoniyatlarini topuvchi AI platforma.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "EduFund AI nima?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "EduFund AI talabalar uchun grantlar, stipendiyalar, internship va xorijda o'qish imkoniyatlarini topishga yordam beradigan platforma.",
          },
        },
        {
          "@type": "Question",
          name: "Grantlarni qanday topaman?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Profilingizni to'ldirasiz, EduFund AI esa mos grantlarni match foizi, deadline va talablar bo'yicha saralaydi.",
          },
        },
      ],
    },
  ],
};

const features = [
  {
    Icon: Search,
    title: "Grant qidirish",
    text: "Xorijiy stipendiyalar, to'liq moliyalashtiriladigan grantlar, internship va konferensiyalarni bitta joyda toping.",
  },
  {
    Icon: Bot,
    title: "AI maslahat",
    text: "GPA, IELTS, daraja va sohangizga qarab mos grantlarni tahlil qiling.",
  },
  {
    Icon: CalendarCheck,
    title: "Deadline reja",
    text: "Ariza topshirish jarayonini bosqichlarga bo'lib, muhim sanalarni o'tkazib yubormang.",
  },
];

const keywords = [
  "grantlar",
  "stipendiyalar",
  "xorijda o'qish",
  "to'liq grant",
  "magistratura granti",
  "bakalavr granti",
  "O'zbekiston talabalari",
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <SEO
        title="EduFund AI - Grantlar, stipendiyalar va xorijda o'qish imkoniyatlari"
        description="EduFund AI orqali O'zbekistonlik talabalar grantlar, stipendiyalar, internship va xorijda o'qish imkoniyatlarini tezroq topadi."
        path="/"
        structuredData={structuredData}
      />

      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <a href="/" className="flex items-center gap-3" aria-label="EduFund AI bosh sahifa">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3D3DC4] text-sm font-extrabold text-white">
              EF
            </div>
            <div>
              <div className="font-bold leading-tight">EduFund AI</div>
              <div className="text-xs text-slate-500">Grant & stipendiya assistant</div>
            </div>
          </a>
          <nav className="flex items-center gap-3 text-sm font-semibold">
            <Link to="/login" className="text-slate-600 hover:text-slate-950">
              Kirish
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-[#3D3DC4] px-4 py-2 text-white hover:bg-[#3232a8]"
            >
              Boshlash
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
          <div>
            <p className="mb-4 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#3D3DC4]">
              O'zbekistonlik talabalar uchun
            </p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl">
              Grantlar, stipendiyalar va xorijda o'qish imkoniyatlarini EduFund AI bilan toping
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              EduFund AI sizga mos grantlarni saralaydi, deadline'larni eslatadi va ariza topshirish
              uchun tayyorgarlik rejasini tuzishga yordam beradi.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3D3DC4] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#3D3DC4]/20 hover:bg-[#3232a8]"
              >
                Bepul boshlash <ArrowRight size={18} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-6 py-3 text-sm font-bold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
              >
                Hisobga kirish
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {keywords.map((keyword) => (
                <span key={keyword} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 shadow-2xl shadow-slate-300/40">
            <div className="rounded-xl bg-[#0F172A] p-5 text-white">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-400">Sizga mos grantlar</div>
                  <div className="text-2xl font-bold">16 ta imkoniyat</div>
                </div>
                <GraduationCap className="text-blue-300" size={32} />
              </div>
              {[
                ["Fulbright magistratura granti", "AQSh", "92% match"],
                ["DAAD Research Scholarship", "Germaniya", "88% match"],
                ["Korea Global Scholarship", "Janubiy Koreya", "81% match"],
              ].map(([title, country, match]) => (
                <div key={title} className="mb-3 rounded-xl border border-slate-700 bg-slate-900 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{title}</div>
                      <div className="mt-1 text-sm text-slate-400">{country} / To'liq moliyalashtirish</div>
                    </div>
                    <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-bold text-emerald-300">
                      {match}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50">
          <div className="mx-auto grid max-w-6xl gap-4 px-4 py-12 md:grid-cols-3">
            {features.map(({ Icon, title, text }) => (
              <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6">
                <Icon className="text-[#3D3DC4]" size={28} />
                <h2 className="mt-4 text-lg font-bold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <h2 className="text-3xl font-black">Nega EduFund AI?</h2>
              <p className="mt-3 text-slate-600">
                Platforma grant qidirish jarayonini tezlashtirish, moslikni tahlil qilish va arizaga
                tayyorgarlikni tartibga solish uchun yaratilgan.
              </p>
            </div>
            <div className="grid gap-3">
              {[
                "Talaba profili asosida match foizi",
                "Saqlangan grantlar va deadline nazorati",
                "AI yordamida roadmap va ariza rejasi",
                "Xorijda o'qish, scholarship va internship imkoniyatlari",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
                  <CheckCircle2 className="shrink-0 text-emerald-600" size={20} />
                  <span className="font-semibold text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldCheck size={18} className="text-[#3D3DC4]" />
            EduFund AI
          </div>
          <div>Grantlar, stipendiyalar va xorijda o'qish imkoniyatlari.</div>
        </div>
      </footer>
    </div>
  );
}

