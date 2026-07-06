import { SafeLink } from '@/app/components/public-site/SafeLink';
import { PublicSiteShell } from '@/app/components/public-site/PublicSiteShell';
import { buildJobsPath } from '@/app/lib/public-content';
import { getHomepageSections } from '@/lib/content-api';
import type { CSSProperties, ReactNode } from 'react';
import { HomePageLinkItem, HomePageSectionBox } from './HomePageSectionBox';
import { homePageLinks } from './links';

type AuthTab = 'login' | 'register';

interface HomePageProps {
  initialAuthTab?: AuthTab;
}

type IconName =
  | 'arrow-right'
  | 'badge-check'
  | 'briefcase'
  | 'chevron-right'
  | 'clipboard-list'
  | 'clock'
  | 'file-check'
  | 'search'
  | 'shield-check'
  | 'trending-up'
  | 'zap';

function SvgIcon({
  name,
  size = 16,
  className,
  style,
  fill = 'none',
}: {
  name: IconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
  fill?: string;
}) {
  const commonProps = {
    fill,
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: '2',
  };

  const paths: Record<IconName, ReactNode> = {
    'arrow-right': <path {...commonProps} d="M5 12h14m-6-6 6 6-6 6" />,
    'badge-check': (
      <>
        <path {...commonProps} d="M8.8 3.3 12 2l3.2 1.3 3.4.3 1.8 2.9 1.3 3.2L20.4 13l-.3 3.4-2.9 1.8-3.2 1.3-3.2-1.3-3.4-.3-1.8-2.9-1.3-3.2L5.6 8.5l.3-3.4 2.9-1.8Z" />
        <path {...commonProps} d="m9 12 2 2 4-5" />
      </>
    ),
    briefcase: <path {...commonProps} d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-9 0h12v12H4V7h4Zm0 5h8" />,
    'chevron-right': <path {...commonProps} d="m9 18 6-6-6-6" />,
    'clipboard-list': (
      <>
        <path {...commonProps} d="M9 4h6l1 2h3v15H5V6h3l1-2Z" />
        <path {...commonProps} d="M9 11h6M9 15h6" />
      </>
    ),
    clock: (
      <>
        <circle {...commonProps} cx="12" cy="12" r="9" />
        <path {...commonProps} d="M12 7v5l3 2" />
      </>
    ),
    'file-check': (
      <>
        <path {...commonProps} d="M6 3h8l4 4v14H6V3Zm8 0v5h5" />
        <path {...commonProps} d="m9 15 2 2 4-5" />
      </>
    ),
    search: <path {...commonProps} d="m21 21-4.35-4.35m1.35-5.15a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" />,
    'shield-check': (
      <>
        <path {...commonProps} d="M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6l-7-3Z" />
        <path {...commonProps} d="m9 12 2 2 4-5" />
      </>
    ),
    'trending-up': <path {...commonProps} d="m3 17 6-6 4 4 7-7m-5 0h5v5" />,
    zap: <path {...commonProps} d="M13 2 4 14h7l-1 8 10-13h-7l1-7Z" />,
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width={size} height={size} className={className} style={style}>
      {paths[name]}
    </svg>
  );
}

const popular = ['SSC CGL 2026', 'UPSC CSE', 'IBPS PO', 'RRB Group D', 'SBI Clerk'];

const PRIMARY_SECTION_ITEM_LIMIT = 8;
const PRIORITY_SECTION_ITEM_LIMIT = 6;
const SECONDARY_SECTION_ITEM_LIMIT = 6;
const LOW_PRIORITY_SECTION_ITEM_LIMIT = 6;

const linkSections = {
  jobs: [
    ['SSC CGL 2026 - Combined Graduate Level Exam', 'Staff Selection Commission', '15 May', 'hot', '14,582', 'Graduate'],
    ['IBPS PO 2026 - Probationary Officer', 'IBPS', '14 May', 'new', '4,500', 'Graduate'],
    ['Railway RRB Group D - Level 1 Posts', 'Railway Recruitment Board', '13 May', 'new', '32,000', '10th Pass'],
    ['UPSC NDA/NA 2026 - National Defence Academy', 'UPSC', '12 May', 'last-date', '400', '12th Pass'],
    ['Bihar Police Constable Recruitment 2026', 'CSBC Bihar', '10 May', 'new', '21,391', '12th Pass'],
    ['UPPSC PCS 2026 - Provincial Civil Service', 'UPPSC', '09 May', undefined, '250', 'Graduate'],
    ['DSSSB TGT/PGT Teacher Recruitment 2026', 'DSSSB Delhi', '08 May', 'new', '5,118', 'B.Ed'],
    ['SBI Clerk 2026 - Junior Associate', 'State Bank of India', '06 May', 'hot', '8,773', 'Graduate'],
  ],
  results: [
    ['UPSC Civil Services 2025 - Final Result', 'UPSC', '15 May', 'hot', '933'],
    ['SSC CHSL 2025 - Tier 2 Result', 'SSC', '14 May', 'new', '6,500'],
    ['IBPS Clerk Mains 2025 - Result Declared', 'IBPS', '13 May', 'new', '5,000'],
    ['RRB NTPC CBT 2 Result 2025', 'RRB', '12 May', undefined, '35,208'],
    ['NTA CUET UG 2026 - Score Card Released', 'NTA', '11 May', 'new'],
    ['Bihar BPSC 69th CCE - Final Result', 'BPSC', '09 May', 'hot', '553'],
    ['SSC MTS 2025 - Tier 1 Result', 'SSC', '08 May', undefined, '9,500'],
    ['RBI Grade B 2025 - Phase II Result', 'RBI', '04 May', 'new', '143'],
  ],
  admitCards: [
    ['SSC GD Constable 2026 - PET/PST Admit Card', 'SSC', '15 May', 'hot', '46,617'],
    ['UPSC EPFO 2026 Admit Card', 'UPSC', '14 May', 'new', '577'],
    ['NTA CUET UG 2026 - City Slip Released', 'NTA', '13 May', 'new'],
    ['Bihar STET 2026 Admit Card', 'BSEB', '12 May'],
    ['SSC CGL 2026 - Tier 1 Admit Card', 'SSC', '11 May', 'new', '14,582'],
    ['IBPS PO Prelims 2026 - Call Letter', 'IBPS', '10 May', undefined, '4,500'],
    ['Railway Group D CBT Admit Card 2026', 'RRB', '09 May', undefined, '32,000'],
    ['UPSC CSE Prelims 2026 - e-Admit Card', 'UPSC', '08 May', 'hot'],
  ],
  answerKeys: [
    ['SSC CGL 2025 Tier 1 - Answer Key Released', 'SSC', '14 May', 'hot', '14,000'],
    ['UPSC CAPF 2025 - Answer Key', 'UPSC', '13 May', 'new', '322'],
    ['NTA UGC NET Dec 2025 - Answer Key', 'NTA', '12 May', 'new'],
    ['CTET 2025 (Dec) - Answer Key Available', 'CBSE', '11 May'],
    ['RRB NTPC CBT 2 - Answer Key', 'RRB', '10 May', undefined, '35,208'],
    ['SSC CHSL 2025 Tier 2 - Answer Key', 'SSC', '09 May', 'update', '6,500'],
  ],
  admissions: [
    ['DU Undergraduate Admission 2026 - CUET Based', 'Delhi University', '15 May', 'new'],
    ['JEE Advanced 2026 - Registration Open', 'IIT Kanpur', '14 May', 'hot'],
    ['NEET UG 2026 - Application Form Out', 'NTA', '13 May', 'new'],
    ['IIM CAT 2026 - Admission Process Begins', 'IIMs', '12 May', 'hot'],
    ['IGNOU July 2026 Admission Open', 'IGNOU', '11 May', 'new'],
    ['BHU UET 2026 - Online Registration', 'Banaras Hindu University', '10 May'],
  ],
  syllabus: [
    ['SSC CGL 2026 - Revised Syllabus & Exam Pattern', 'SSC', '15 May', 'new'],
    ['UPSC CSE 2026 - Prelims + Mains Syllabus', 'UPSC', '14 May'],
    ['RRB Group D 2026 - CBT Syllabus', 'RRB', '13 May', 'new'],
    ['IBPS PO 2026 - Prelims & Mains Syllabus', 'IBPS', '12 May'],
    ['Bihar BPSC 71st CCE - Syllabus Released', 'BPSC', '11 May', 'new'],
    ['CTET 2026 - Paper I & Paper II Syllabus', 'CBSE', '10 May', 'update'],
  ],
  board: [
    ['UP Board Class 12 Result 2026', 'UPMSP', '14 May', 'hot'],
    ['CBSE Class 10 & 12 Result 2026', 'CBSE', '13 May', 'new'],
    ['Bihar Board Matric Result 2026', 'BSEB', '12 May', 'hot'],
    ['Rajasthan Board (RBSE) 12th Result 2026', 'RBSE', '11 May', 'new'],
    ['MP Board MPBSE 10th Result 2026', 'MPBSE', '10 May'],
    ['Maharashtra SSC Result 2026', 'MSBSHSE', '09 May', 'new'],
  ],
  scholarship: [
    ['PM Scholarship Scheme 2026 - Apply Now', 'Ministry of Education', '15 May', 'new'],
    ['NSP National Scholarship Portal 2026', 'Govt of India', '14 May', 'hot'],
    ['UP Scholarship 2026-27 - Registration Open', 'Samaj Kalyan UP', '13 May', 'new'],
    ['Bihar SC/ST/OBC Scholarship 2026', 'Bihar Govt', '12 May'],
    ['CSSS Central Sector Scholarship 2026', 'Dept of HE', '11 May', 'new'],
    ['Post Matric Scholarship OBC 2026', 'Ministry of Social Justice', '09 May', 'update'],
  ],
} as const;

type LinkTuple = readonly [string, string, string, ('new' | 'hot' | 'update' | 'last-date')?, string?, string?];
type HomepageSections = Awaited<ReturnType<typeof getHomepageSections>>;
type HomepageCard = HomepageSections[keyof HomepageSections][number];

function itemHref(title: string, fallback: string) {
  return `${fallback}?search=${encodeURIComponent(title.split(' - ')[0])}`;
}

function renderHomepageCards(items: readonly HomepageCard[], limit: number) {
  return items.slice(0, limit).map((item) => (
    <HomePageLinkItem
      key={item.id}
      href={item.href}
      title={item.title}
      org={item.org}
      date={item.date}
      tag={item.tag}
      postCount={item.postCount}
      qualification={item.qualification}
    />
  ));
}

function renderItems(items: readonly LinkTuple[], href: string, limit: number) {
  return items.slice(0, limit).map(([title, org, , tag, postCount, qualification]) => (
    <HomePageLinkItem
      key={`${title}-${org}`}
      href={itemHref(title, href)}
      title={title}
      org={org}
      date="Verify"
      tag={tag}
      postCount={postCount}
      qualification={qualification}
    />
  ));
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#0b1437_0%,#0a1230_58%,#0b1024_100%)]">
      <div
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{
          background:
            'radial-gradient(780px 320px at 8% -20%, rgba(30,58,138,0.8) 0%, transparent 55%),radial-gradient(680px 300px at 94% -10%, rgba(109,40,217,0.62) 0%, transparent 55%)',
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(253,216,53,0.45)_50%,transparent)]" />

      <div className="relative mx-auto max-w-6xl px-4 py-5 sm:py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-[22px] font-black leading-tight tracking-normal text-white sm:text-[26px]">
              India&apos;s trusted{' '}
              <span className="bg-[linear-gradient(135deg,#fde68a_0%,#fbbf24_45%,#f97316_100%)] bg-clip-text text-transparent">
                Sarkari Naukri
              </span>{' '}
              portal
            </h1>
            <p className="mt-1 text-[12px] font-medium leading-5 text-blue-100/80">
              Latest govt jobs, results, admit cards, answer keys &amp; syllabus &mdash; updated daily.
            </p>
          </div>

          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(135deg,#fde68a,#fbbf24)] px-2.5 py-1 text-[9.5px] font-extrabold tracking-[0.08em] text-[#0b1437]">
              <SvgIcon name="zap" size={9} fill="currentColor" /> #1 GOVT JOBS
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/9 px-2.5 py-1 text-[9.5px] font-bold text-white/90 ring-1 ring-white/20">
              <SvgIcon name="shield-check" size={10} className="text-emerald-300" /> Verified Daily
            </span>
          </div>
        </div>

        <form action={homePageLinks.jobs} className="mt-4 flex gap-2">
          <div className="flex flex-1 items-center gap-2.5 rounded-xl border border-white/20 bg-white/9 px-3.5 py-2.5 transition focus-within:ring-2 focus-within:ring-yellow-400/60">
            <SvgIcon name="search" size={16} className="shrink-0 text-blue-100/85" />
            <input
              name="search"
              placeholder="Search jobs, results, admit cards..."
              className="min-w-0 flex-1 bg-transparent text-[13.5px] text-white outline-none placeholder:text-blue-100/70"
            />
          </div>
          <button
            type="submit"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[linear-gradient(135deg,#fde68a,#f59e0b)] px-4 py-2.5 text-[13px] font-extrabold text-[#0b1437] transition hover:brightness-110 active:scale-95"
          >
            Search <SvgIcon name="arrow-right" size={14} />
          </button>
        </form>

        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <span className="shrink-0 text-[11px] font-bold text-white/70">Popular:</span>
          {popular.map((label) => (
            <a
              key={label}
              href={buildJobsPath({ search: label })}
              className="shrink-0 rounded-full bg-white/6 px-2.5 py-1 text-[11px] font-semibold text-white/85 ring-1 ring-white/14 transition-colors hover:bg-white/14 hover:text-white"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

interface TickerItem {
  title: string;
  href: string;
  tag?: 'new' | 'hot' | 'update' | 'last-date';
}

const tickerTagColor: Record<NonNullable<TickerItem['tag']>, string> = {
  new: '#059669',
  hot: '#dc2626',
  update: '#2563eb',
  'last-date': '#d97706',
};

function NewsTicker({ items }: { items: readonly TickerItem[] }) {
  if (items.length === 0) {
    return null;
  }

  const renderRow = (ariaHidden: boolean) =>
    items.map((item, index) => (
      <SafeLink
        key={`${ariaHidden ? 'dup' : 'row'}-${item.href}-${index}`}
        href={item.href}
        aria-hidden={ariaHidden || undefined}
        tabIndex={ariaHidden ? -1 : undefined}
        className="inline-flex items-center gap-2 text-[12px] font-semibold text-gray-700 transition-colors hover:text-orange-600 dark:text-gray-200 dark:hover:text-orange-300"
      >
        <span className="h-1 w-1 shrink-0 rounded-full bg-orange-500" aria-hidden />
        {item.tag ? (
          <span
            className="rounded px-1 py-px text-[8px] font-extrabold uppercase tracking-wider text-white"
            style={{ background: tickerTagColor[item.tag] }}
          >
            {item.tag === 'last-date' ? 'LAST DATE' : item.tag}
          </span>
        ) : null}
        {item.title}
      </SafeLink>
    ));

  return (
    <div className="border-b border-gray-200 bg-white dark:border-white/10 dark:bg-[#0f172a]">
      <div className="mx-auto flex max-w-6xl items-stretch">
        <span className="z-10 flex shrink-0 items-center gap-1.5 bg-[#d32f2f] px-3 text-[10px] font-extrabold uppercase tracking-widest text-white">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" aria-hidden />
          Latest
        </span>
        <div className="relative min-w-0 flex-1 overflow-hidden">
          <div className="flex w-max items-center gap-7 whitespace-nowrap py-2 pl-5 animate-marquee hover:[animation-play-state:paused]">
            {renderRow(false)}
            <span className="inline-block w-7" aria-hidden />
            {renderRow(true)}
          </div>
        </div>
      </div>
    </div>
  );
}

function MainGrid({ sections }: { sections: HomepageSections }) {
  const jobs = sections.jobs || [];
  const results = sections.results || [];
  const admitCards = sections['admit-cards'] || [];
  const answerKeys = sections['answer-keys'] || [];
  const admissions = sections.admissions || [];

  return (
    <>
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <HomePageSectionBox title="Latest Jobs / Online Form" headerColor="bg-[#d32f2f]" kicker="Recruitment" count={jobs.length} viewAllLink={homePageLinks.jobs}>
            {renderHomepageCards(jobs, PRIMARY_SECTION_ITEM_LIMIT)}
          </HomePageSectionBox>
          <HomePageSectionBox title="Latest Result" headerColor="bg-[#1565c0]" kicker="Results" count={results.length} viewAllLink={homePageLinks.results}>
            {renderHomepageCards(results, PRIMARY_SECTION_ITEM_LIMIT)}
          </HomePageSectionBox>
          <HomePageSectionBox title="Latest Admit Card" headerColor="bg-[#6a1b9a]" kicker="Hall Tickets" count={admitCards.length} viewAllLink={homePageLinks.admitCards}>
            {renderHomepageCards(admitCards, PRIMARY_SECTION_ITEM_LIMIT)}
          </HomePageSectionBox>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <HomePageSectionBox title="Answer Key" headerColor="bg-[#00695c]" kicker="Answers" count={answerKeys.length} viewAllLink={homePageLinks.answerKey}>
            {renderHomepageCards(answerKeys, PRIORITY_SECTION_ITEM_LIMIT)}
          </HomePageSectionBox>
          <HomePageSectionBox title="Latest Syllabus" headerColor="bg-[#283593]" kicker="Study Material" count={22} viewAllLink={homePageLinks.syllabus}>
            {renderItems(linkSections.syllabus, homePageLinks.syllabus, PRIORITY_SECTION_ITEM_LIMIT)}
          </HomePageSectionBox>
          <HomePageSectionBox title="Latest Admission" headerColor="bg-[#ad1457]" kicker="Admissions" count={admissions.length} viewAllLink={homePageLinks.admissions}>
            {renderHomepageCards(admissions, SECONDARY_SECTION_ITEM_LIMIT)}
          </HomePageSectionBox>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-8">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <HomePageSectionBox title="Board Results" headerColor="bg-[#4e342e]" kicker="Boards" count={16} viewAllLink={homePageLinks.boardResults}>
            {renderItems(linkSections.board, homePageLinks.boardResults, LOW_PRIORITY_SECTION_ITEM_LIMIT)}
          </HomePageSectionBox>
          <HomePageSectionBox title="Scholarship / Yojana" headerColor="bg-[#1b5e20]" kicker="Schemes" count={14} viewAllLink={homePageLinks.scholarship}>
            {renderItems(linkSections.scholarship, homePageLinks.scholarship, LOW_PRIORITY_SECTION_ITEM_LIMIT)}
          </HomePageSectionBox>
        </div>
      </div>
    </>
  );
}

function buildTickerItems(sections: HomepageSections): TickerItem[] {
  const order: Array<keyof HomepageSections> = ['jobs', 'results', 'admit-cards', 'admissions', 'answer-keys'];
  const items: TickerItem[] = [];

  for (const key of order) {
    for (const card of (sections[key] || []).slice(0, 3)) {
      items.push({ title: card.title, href: card.href, tag: card.tag });
    }
  }

  return items.slice(0, 12);
}

export default async function HomePage({ initialAuthTab }: HomePageProps) {
  const sections = await getHomepageSections();
  const tickerItems = buildTickerItems(sections);

  return (
    <PublicSiteShell initialAuthTab={initialAuthTab} activeHref={homePageLinks.home}>
      <Hero />
      <NewsTicker items={tickerItems} />
      <MainGrid sections={sections} />
    </PublicSiteShell>
  );
}
