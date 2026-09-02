"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type View =
  | "monday"
  | "malta52"
  | "market"
  | "merchants"
  | "pnl"
  | "warroom"
  | "agents"
  | "ask";

type Opportunity = {
  id: number;
  title: string;
  subtitle: string;
  status: "READY" | "INVESTIGATING" | "DISCOVERED" | "WATCHING";
  confidence: number;
  speed: string;
  score: number;
  modeledGmv: number;
  evidence: string[];
  unknowns: string[];
};

type EvidenceType = "PUBLIC FACT" | "PUBLIC INFERENCE" | "MODELED ASSUMPTION";

type Merchant = {
  name: string;
  locality: string;
  cuisine: string;
  rating: string;
  occasion: string;
  lateNight: string;
  touristFit: string;
  opportunity: string;
  evidenceType: EvidenceType;
};

const opportunities: Opportunity[] = [
  {
    id: 1,
    title: "Own the First Night",
    subtitle: "Turn Malta arrivals into first-night Bolt Food orders.",
    status: "READY",
    confidence: 81,
    speed: "9 days",
    score: 84,
    modeledGmv: 280000,
    evidence: [
      "Malta recorded more than 4M inbound tourists in 2025.",
      "Visitors generated more than 25M tourist nights.",
      "Many Malta-only visitors are first-time visitors.",
      "Bolt operates mobility and Food in the same market.",
    ],
    unknowns: [
      "Airport-linked Bolt rides per month",
      "Ride → Food overlap",
      "Tourist Food penetration",
      "Contribution per first tourist order",
    ],
  },
  {
    id: 2,
    title: "Win Saturday 19:30",
    subtitle: "Protect Bolt Malta at its publicly reported peak ordering moment.",
    status: "READY",
    confidence: 87,
    speed: "7 days",
    score: 88,
    modeledGmv: 190000,
    evidence: [
      "Bolt publicly identifies Saturday as Malta's strongest delivery day.",
      "Bolt publicly identifies around 19:30 as peak ordering time.",
      "Peak demand stresses courier liquidity and merchant preparation simultaneously.",
    ],
    unknowns: [
      "Zone-level order density",
      "Courier utilisation",
      "Peak ETA deterioration",
      "Refund elasticity",
    ],
  },
  {
    id: 3,
    title: "Own St Julian's After 22:00",
    subtitle: "Build an occasion advantage around Malta's nightlife economy.",
    status: "READY",
    confidence: 76,
    speed: "14 days",
    score: 80,
    modeledGmv: 160000,
    evidence: [
      "St Julian's has exceptionally high tourism intensity.",
      "The locality contains a major nightlife and hospitality concentration.",
      "Late-night delivery depends on merchant availability and courier liquidity.",
    ],
    unknowns: [
      "Orders by hour after 22:00",
      "Late-night merchant availability",
      "Courier supply by interval",
      "Competitive ETA",
    ],
  },
  {
    id: 4,
    title: "Bolt Plus Frequency",
    subtitle: "Use cross-product membership to increase Food frequency.",
    status: "INVESTIGATING",
    confidence: 72,
    speed: "21 days",
    score: 77,
    modeledGmv: 130000,
    evidence: [
      "Bolt Plus spans rides and Food in Malta.",
      "Food benefits can lower delivery friction for members.",
    ],
    unknowns: [
      "Plus penetration",
      "Frequency uplift",
      "Subscription retention",
    ],
  },
  {
    id: 5,
    title: "Ride → Food",
    subtitle: "Find Food growth that exists because Bolt already owns mobility intent.",
    status: "INVESTIGATING",
    confidence: 69,
    speed: "21 days",
    score: 75,
    modeledGmv: 110000,
    evidence: [
      "Bolt operates mobility and Food in Malta.",
      "Travel moments can create predictable consumption occasions.",
    ],
    unknowns: [
      "Cross-product identity availability",
      "Targeting constraints",
      "Incremental conversion",
    ],
  },
  {
    id: 6,
    title: "Merchant Occasion Gaps",
    subtitle: "Find missing occasions, not merely missing restaurant logos.",
    status: "DISCOVERED",
    confidence: 64,
    speed: "30 days",
    score: 71,
    modeledGmv: 75000,
    evidence: [
      "Many established restaurants multi-home across delivery platforms.",
      "Availability and occasion coverage can matter more than raw merchant count.",
    ],
    unknowns: [
      "Merchant overlap",
      "Cuisine demand",
      "Unavailable searches",
      "Conversion by locality",
    ],
  },
  {
    id: 7,
    title: "Hotel Activation",
    subtitle: "Turn short-stay accommodation into a Food acquisition surface.",
    status: "DISCOVERED",
    confidence: 61,
    speed: "30 days",
    score: 68,
    modeledGmv: 55000,
    evidence: [
      "Inbound visitors heavily use rented accommodation.",
      "Visitors have limited time to discover local restaurants.",
    ],
    unknowns: [
      "Hotel order mix",
      "Partnership economics",
      "Tourist CAC",
    ],
  },
  {
    id: 8,
    title: "Gozo Playbook",
    subtitle: "Treat Gozo as a different marketplace rather than smaller Malta.",
    status: "WATCHING",
    confidence: 48,
    speed: "45 days",
    score: 52,
    modeledGmv: 40000,
    evidence: [
      "Gozo has different density and tourism dynamics.",
      "Courier economics may differ materially.",
    ],
    unknowns: [
      "Order density",
      "Courier economics",
      "Merchant coverage",
      "Seasonality",
    ],
  },
];

const mondayIds = [1, 2, 3];

const agents = [
  {
    name: "Market Intelligence",
    role: "Understands Malta",
    status: "142 signals reviewed",
  },
  {
    name: "Growth",
    role: "Finds opportunity",
    status: "19 opportunities found",
  },
  {
    name: "Economics",
    role: "Tries to kill ideas",
    status: "12 ideas challenged",
  },
  {
    name: "Experiment",
    role: "Turns ideas into tests",
    status: "3 moves ready",
  },
];

const localities = [
  {
    name: "St Julian's",
    archetype: "Tourism + nightlife",
    score: 94,
    opportunity: "Late-night / first-night",
    tourism: "Very high",
    nightlife: "Very high",
    density: "High",
    courier: "High complexity",
    thesis:
      "Do not optimise St Julian's like Sliema. The opportunity is 22:00+ availability, courier liquidity and tourist activation.",
  },
  {
    name: "Sliema",
    archetype: "Dense mixed demand",
    score: 91,
    opportunity: "Frequency / premium",
    tourism: "High",
    nightlife: "Medium",
    density: "Very high",
    courier: "Medium complexity",
    thesis:
      "A resident + visitor market where frequency, premium selection and delivery experience should matter more than raw acquisition.",
  },
  {
    name: "Gżira",
    archetype: "Resident + visitor",
    score: 82,
    opportunity: "Convenience / value",
    tourism: "Medium",
    nightlife: "Medium",
    density: "High",
    courier: "Medium complexity",
    thesis:
      "Potentially strong for repeat convenience use-cases rather than pure tourist acquisition.",
  },
  {
    name: "Valletta",
    archetype: "Tourism + offices",
    score: 80,
    opportunity: "Lunch / visitor",
    tourism: "High",
    nightlife: "Medium",
    density: "Medium",
    courier: "High complexity",
    thesis:
      "The best opportunity may be occasion-specific: office lunch, visitor discovery and constrained courier access.",
  },
  {
    name: "Msida",
    archetype: "Student + resident",
    score: 74,
    opportunity: "Value / frequency",
    tourism: "Low",
    nightlife: "Low",
    density: "High",
    courier: "Low complexity",
    thesis:
      "Likely more sensitive to price, frequency and convenience than tourist-led acquisition.",
  },
  {
    name: "St Paul's Bay",
    archetype: "Tourism + residential",
    score: 72,
    opportunity: "Seasonal growth",
    tourism: "High seasonal",
    nightlife: "Medium",
    density: "Medium",
    courier: "Medium complexity",
    thesis:
      "Seasonality should drive how supply, merchant availability and promotional intensity are planned.",
  },
  {
    name: "Gozo",
    archetype: "Different economics",
    score: 52,
    opportunity: "Separate playbook",
    tourism: "High seasonal",
    nightlife: "Low",
    density: "Low",
    courier: "Very high complexity",
    thesis:
      "Treat Gozo as a separate marketplace. Lower density may change courier economics, merchant coverage and acceptable ETA.",
  },
];

const merchants: Merchant[] = [
  {
    name: "Hugo's Pub",
    locality: "St Julian's",
    cuisine: "Burgers / pub",
    rating: "4.7",
    occasion: "Nightlife / groups",
    lateNight: "High potential",
    touristFit: "Very high",
    opportunity: "Late-night hero merchant",
    evidenceType: "PUBLIC FACT",
  },
  {
    name: "Martina's Pizzeria & Grill",
    locality: "St Julian's",
    cuisine: "Pizza / burgers",
    rating: "4.7",
    occasion: "Dinner / group",
    lateNight: "High potential",
    touristFit: "High",
    opportunity: "Group-order anchor",
    evidenceType: "PUBLIC FACT",
  },
  {
    name: "The Oven",
    locality: "St Julian's",
    cuisine: "Pizza",
    rating: "4.8",
    occasion: "Dinner / late meal",
    lateNight: "High potential",
    touristFit: "High",
    opportunity: "Late dinner availability",
    evidenceType: "PUBLIC FACT",
  },
  {
    name: "Dr Juice",
    locality: "St Julian's",
    cuisine: "Healthy / juice",
    rating: "4.7",
    occasion: "Daytime / recovery",
    lateNight: "Low",
    touristFit: "Medium",
    opportunity: "Next-day recovery occasion",
    evidenceType: "PUBLIC FACT",
  },
  {
    name: "Zen To Go Sushi",
    locality: "St Julian's",
    cuisine: "Sushi",
    rating: "4.7",
    occasion: "Premium dinner",
    lateNight: "Medium",
    touristFit: "High",
    opportunity: "Premium visitor demand",
    evidenceType: "PUBLIC FACT",
  },
  {
    name: "TukTuk Indian",
    locality: "St Julian's",
    cuisine: "Indian",
    rating: "4.6",
    occasion: "Dinner / group",
    lateNight: "Medium",
    touristFit: "Medium",
    opportunity: "Cuisine diversification",
    evidenceType: "PUBLIC FACT",
  },
  {
    name: "The Legend",
    locality: "Sliema",
    cuisine: "Mixed / casual",
    rating: "Observable",
    occasion: "Resident frequency",
    lateNight: "Medium",
    touristFit: "Medium",
    opportunity: "Frequency anchor",
    evidenceType: "PUBLIC FACT",
  },
  {
    name: "Ta' Nenu",
    locality: "Valletta",
    cuisine: "Maltese",
    rating: "Observable",
    occasion: "Local discovery",
    lateNight: "Low",
    touristFit: "Very high",
    opportunity: "Tourist local-food discovery",
    evidenceType: "PUBLIC FACT",
  },
];

const promptPresets = [
  "Grow Malta 20% without increasing blanket discounting.",
  "Where are we probably overspending?",
  "How would you beat Wolt without a price war?",
  "What would you do in your first 30 days?",
  "Where should I put €100K next quarter?",
];

export default function Home() {
  const [view, setView] = useState<View>("monday");
  const [selected, setSelected] = useState<Opportunity | null>(null);
  const [selectedLocality, setSelectedLocality] = useState(localities[0]);
  const [experimentOpen, setExperimentOpen] = useState(false);

  const [rides, setRides] = useState(35000);
  const [foodOverlap, setFoodOverlap] = useState(18);
  const [activation, setActivation] = useState(8);
  const [aov, setAov] = useState(24);
  const [contribution, setContribution] = useState(3.2);

  const eligible = Math.round(rides * (1 - foodOverlap / 100));
  const incrementalOrders = Math.round(eligible * (activation / 100));
  const monthlyGmv = incrementalOrders * aov;
  const annualGmv = monthlyGmv * 12;

  const navigate = (next: View) => {
    setView(next);
    setSelected(null);
    setExperimentOpen(false);
  };

  return (
    <main className="min-h-screen bg-[#f5f5f1] text-[#151515]">
      <Header />

      <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[220px_minmax(0,1fr)_285px]">
        <LeftNav view={view} navigate={navigate} />

        <section className="min-w-0 px-6 py-8 lg:px-10 lg:py-10">
          {selected ? (
            <OpportunityRoom
              opportunity={selected}
              onBack={() => {
                setSelected(null);
                setExperimentOpen(false);
              }}
              experimentOpen={experimentOpen}
              setExperimentOpen={setExperimentOpen}
              rides={rides}
              setRides={setRides}
              foodOverlap={foodOverlap}
              setFoodOverlap={setFoodOverlap}
              activation={activation}
              setActivation={setActivation}
              aov={aov}
              setAov={setAov}
              contribution={contribution}
              setContribution={setContribution}
              eligible={eligible}
              incrementalOrders={incrementalOrders}
              monthlyGmv={monthlyGmv}
              annualGmv={annualGmv}
              goToWarRoom={() => navigate("warroom")}
            />
          ) : view === "monday" ? (
            <Monday setSelected={setSelected} />
          ) : view === "malta52" ? (
            <Malta52 setSelected={setSelected} />
          ) : view === "market" ? (
            <MaltaModel
              selectedLocality={selectedLocality}
              setSelectedLocality={setSelectedLocality}
            />
          ) : view === "merchants" ? (
            <MerchantIntelligence />
          ) : view === "pnl" ? (
            <PnlLab
              incrementalOrders={incrementalOrders}
              monthlyGmv={monthlyGmv}
              annualGmv={annualGmv}
              contribution={contribution}
            />
          ) : view === "warroom" ? (
            <SaturdayWarRoom />
          ) : view === "ask" ? (
            <AskCountryGM />
          ) : (
            <Agents />
          )}
        </section>

        <RightRail />
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f5f5f1]/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-5 lg:px-10">
        <div className="flex items-center gap-6">
          <div>
            <div className="text-[18px] font-black tracking-[0.18em]">
              COUNTRY GM
            </div>
            <div className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-black/45">
              Bolt Food · Malta
            </div>
          </div>

          <div className="hidden h-10 w-px bg-black/10 md:block" />

          <div className="hidden items-center gap-2 text-sm font-bold md:flex">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Operating
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-black/55 md:block">
            Week 01 / 52
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111827] text-sm font-black text-white">
            GM
          </div>
        </div>
      </div>
    </header>
  );
}

function LeftNav({
  view,
  navigate,
}: {
  view: View;
  navigate: (view: View) => void;
}) {
  const links: [View, string][] = [
    ["monday", "Monday"],
    ["malta52", "Malta 52"],
    ["market", "Malta Model"],
    ["merchants", "Merchants"],
    ["pnl", "P&L Lab"],
    ["warroom", "War Room"],
    ["agents", "Agents"],
    ["ask", "Ask Country GM"],
  ];

  return (
    <aside className="border-r border-black/10 px-4 py-7 lg:min-h-[calc(100vh-81px)]">
      <nav className="space-y-2">
        {links.map(([id, label]) => (
          <button
            key={id}
            onClick={() => navigate(id)}
            className={`w-full rounded-xl px-4 py-3 text-left text-sm font-black transition ${
              view === id
                ? "bg-[#111827] text-white"
                : "text-black/55 hover:bg-black/5 hover:text-black"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-8 border-t border-black/10 pt-7">
        <div className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-black/35">
          Mandate
        </div>
        <div className="mt-4 px-4 text-sm font-black leading-6">
          Win Malta.
          <br />
          Profitably.
        </div>
      </div>

      <div className="mt-8 border-t border-black/10 px-4 pt-7 text-xs leading-5 text-black/40">
        Public intelligence + modeled assumptions.
        <br />
        No Bolt internal data used.
      </div>
    </aside>
  );
}

function RightRail() {
  return (
    <aside className="border-l border-black/10 px-5 py-8">
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-black/35">
        Operating agents
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="text-xl font-black">4 awake</div>
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
      </div>

      <div className="mt-6 space-y-3">
        {agents.map((agent) => (
          <div
            key={agent.name}
            className="rounded-2xl border border-black/10 bg-white p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-black">{agent.name}</div>
                <div className="mt-1 text-xs text-black/45">{agent.role}</div>
              </div>
              <span className="mt-1 h-2 w-2 rounded-full bg-violet-500" />
            </div>

            <div className="mt-4 text-xs font-bold text-black/55">
              {agent.status}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl bg-[#111827] p-5 text-white">
        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
          Country GM
        </div>
        <div className="mt-3 text-xl font-black leading-6">
          Fewer reports.
          <br />
          Better decisions.
        </div>
      </div>
    </aside>
  );
}

function Monday({
  setSelected,
}: {
  setSelected: (op: Opportunity) => void;
}) {
  const monday = opportunities.filter((op) => mondayIds.includes(op.id));

  return (
    <div>
      <Eyebrow>Monday · 08:03</Eyebrow>

      <h1 className="mt-5 text-5xl font-black tracking-[-0.05em] md:text-6xl">
        Good morning.
      </h1>

      <p className="mt-5 max-w-3xl text-xl leading-8 text-black/55">
        I investigated Malta before asking for access to yours.
      </p>

      <div className="mt-10 grid gap-3 sm:grid-cols-4">
        <Metric value="142" label="signals reviewed" />
        <Metric value="19" label="opportunities found" />
        <Metric value="7" label="survived review" />
        <Metric value="3" label="deserve action" purple />
      </div>

      <div className="mt-12 border-b border-black/10 pb-5">
        <SectionLabel>Your Monday</SectionLabel>
        <h2 className="mt-2 text-3xl font-black tracking-[-0.03em]">
          Three moves. Everything else can wait.
        </h2>
      </div>

      <div className="divide-y divide-black/10">
        {monday.map((op, index) => (
          <button
            key={op.id}
            onClick={() => setSelected(op)}
            className="group grid w-full gap-5 py-7 text-left transition hover:translate-x-1 md:grid-cols-[65px_minmax(0,1fr)_190px_40px]"
          >
            <div className="text-4xl font-black text-black/15">
              0{index + 1}
            </div>

            <div>
              <div className="text-2xl font-black tracking-[-0.03em]">
                {op.title}
              </div>
              <div className="mt-2 text-sm leading-6 text-black/50">
                {op.subtitle}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="font-bold uppercase tracking-wider text-black/30">
                  Confidence
                </div>
                <div className="mt-2 text-lg font-black">{op.confidence}%</div>
              </div>
              <div>
                <div className="font-bold uppercase tracking-wider text-black/30">
                  Test
                </div>
                <div className="mt-2 text-lg font-black">{op.speed}</div>
              </div>
            </div>

            <div className="flex items-center justify-end text-2xl">→</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Malta52({
  setSelected,
}: {
  setSelected: (op: Opportunity) => void;
}) {
  const [searchState, setSearchState] = useState<
    "idle" | "searching" | "done"
  >("idle");

  const resultRef = useRef<HTMLDivElement | null>(null);

  const total = opportunities
    .slice(0, 7)
    .reduce((sum, op) => sum + op.modeledGmv, 0);

  useEffect(() => {
    if (searchState === "done") {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 120);
    }
  }, [searchState]);

  const findAnotherMillion = () => {
    setSearchState("searching");

    setTimeout(() => {
      setSearchState("done");
    }, 950);
  };

  return (
    <div>
      <Eyebrow>Growth engine</Eyebrow>

      <h1 className="mt-5 text-5xl font-black tracking-[-0.05em] md:text-6xl">
        MALTA 52
      </h1>

      <p className="mt-5 max-w-3xl text-xl leading-8 text-black/55">
        Continuous hypotheses. One objective: profitable market leadership.
      </p>

      <div className="mt-10 rounded-3xl bg-[#111827] p-8 text-white">
        <SectionLabel dark>Operating principle</SectionLabel>

        <div className="mt-4 text-3xl font-black">
          Week 17 does not exist yet.
        </div>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
          The next move is discovered from what the previous move taught us.
        </p>
      </div>

      <div className="mt-10">
        <Eyebrow>Find the next €1M</Eyebrow>

        <h2 className="mt-3 text-3xl font-black tracking-[-0.03em]">
          Where is the next profitable growth pool hiding?
        </h2>

        <div className="mt-6 rounded-3xl border border-black/10 bg-white p-7">
          <div className="grid gap-2">
            {opportunities.slice(0, 7).map((op) => (
              <button
                key={op.id}
                onClick={() => setSelected(op)}
                className="grid items-center gap-4 rounded-2xl px-4 py-4 text-left transition hover:bg-black/[0.03] md:grid-cols-[minmax(0,1fr)_160px_90px]"
              >
                <div>
                  <div className="font-black">{op.title}</div>
                  <div className="mt-1 text-xs text-black/45">
                    Score {op.score} · {op.status}
                  </div>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-black/5">
                  <div
                    className="h-full rounded-full bg-violet-600"
                    style={{
                      width: `${Math.min(
                        100,
                        (op.modeledGmv / 300000) * 100
                      )}%`,
                    }}
                  />
                </div>

                <div className="text-right text-sm font-black">
                  €{Math.round(op.modeledGmv / 1000)}K
                </div>
              </button>
            ))}
          </div>

          <div className="mt-7 flex flex-col gap-5 border-t border-black/10 pt-7 md:flex-row md:items-center md:justify-between">
            <div>
              <SectionLabel>Modeled opportunity pool</SectionLabel>
              <div className="mt-2 text-4xl font-black">
                €{(total / 1000000).toFixed(2)}M
              </div>
            </div>

            <button
              onClick={findAnotherMillion}
              disabled={searchState === "searching"}
              className="rounded-xl bg-violet-600 px-6 py-4 text-sm font-black text-white transition hover:bg-violet-700 disabled:opacity-60"
            >
              {searchState === "searching"
                ? "Agents searching Malta..."
                : searchState === "done"
                ? "Search again →"
                : "Find another €1M →"}
            </button>
          </div>
        </div>

        {searchState === "searching" && (
          <div className="mt-6 rounded-3xl bg-[#111827] p-7 text-white">
            <Eyebrow dark>Opportunity search running</Eyebrow>

            <div className="mt-6 space-y-5">
              <SearchStep
                agent="Market Intelligence"
                result="Scanning localities, occasions and external signals..."
              />
              <SearchStep
                agent="Growth"
                result="Generating new hypotheses..."
              />
              <SearchStep
                agent="Economics"
                result="Challenging the economics..."
              />
            </div>
          </div>
        )}

        {searchState === "done" && (
          <div
            ref={resultRef}
            className="mt-6 scroll-mt-28 rounded-3xl border border-violet-200 bg-violet-50 p-7"
          >
            <Eyebrow>Opportunity discovered</Eyebrow>

            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <Metric value="23" label="signals investigated" />
              <Metric value="8" label="hypotheses generated" />
              <Metric value="5" label="rejected" />
              <Metric value="1" label="survived" purple />
            </div>

            <div className="mt-7 rounded-2xl bg-white p-6">
              <SectionLabel>Malta 52 · newly discovered</SectionLabel>

              <div className="mt-4 flex flex-col justify-between gap-5 md:flex-row">
                <div>
                  <div className="text-3xl font-black">
                    Sunday Family Occasion
                  </div>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-black/55">
                    Residential Malta may contain a repeat family-meal occasion
                    structurally different from tourism and nightlife demand.
                  </p>
                </div>

                <div className="shrink-0">
                  <SectionLabel>Modeled GMV</SectionLabel>
                  <div className="mt-2 text-3xl font-black text-violet-600">
                    €96K
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <SmallDecision
                  label="Why investigate"
                  value="Repeatable resident occasion"
                />
                <SmallDecision
                  label="Biggest unknown"
                  value="Sunday cohort frequency"
                />
                <SmallDecision
                  label="Next action"
                  value="Pull locality × hour orders"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MaltaModel({
  selectedLocality,
  setSelectedLocality,
}: {
  selectedLocality: (typeof localities)[number];
  setSelectedLocality: (value: (typeof localities)[number]) => void;
}) {
  return (
    <div>
      <Eyebrow>External intelligence</Eyebrow>

      <h1 className="mt-5 text-5xl font-black tracking-[-0.05em] md:text-6xl">
        Malta is not one market.
      </h1>

      <p className="mt-5 max-w-3xl text-xl leading-8 text-black/55">
        Resident demand, tourism, nightlife and geography create different
        marketplace problems by locality.
      </p>

      <div className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-3">
          {localities.map((locality) => (
            <button
              key={locality.name}
              onClick={() => setSelectedLocality(locality)}
              className={`w-full rounded-2xl border p-5 text-left transition ${
                selectedLocality.name === locality.name
                  ? "border-violet-300 bg-violet-50"
                  : "border-black/10 bg-white hover:bg-black/[0.02]"
              }`}
            >
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0">
                  <div className="text-lg font-black">{locality.name}</div>
                  <div className="mt-3 text-sm font-bold text-black/55">
                    {locality.archetype}
                  </div>
                  <div className="mt-1 text-xs text-black/40">
                    {locality.opportunity}
                  </div>
                </div>

                <div className="shrink-0 rounded-xl bg-white px-4 py-3 text-xl font-black shadow-sm">
                  {locality.score}
                  <span className="text-sm text-black/30">/100</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="rounded-3xl bg-[#111827] p-7 text-white xl:sticky xl:top-28 xl:self-start">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
            {selectedLocality.name}
          </div>

          <div className="mt-4 text-4xl font-black">
            {selectedLocality.score}/100
          </div>

          <div className="mt-7 space-y-4">
            <LocalityMetric
              label="Tourism"
              value={selectedLocality.tourism}
            />
            <LocalityMetric
              label="Nightlife"
              value={selectedLocality.nightlife}
            />
            <LocalityMetric
              label="Density"
              value={selectedLocality.density}
            />
            <LocalityMetric
              label="Courier"
              value={selectedLocality.courier}
            />
          </div>

          <div className="mt-7 border-t border-white/10 pt-6">
            <SectionLabel dark>Country GM view</SectionLabel>
            <p className="mt-3 text-sm leading-6 text-white/65">
              {selectedLocality.thesis}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MerchantIntelligence() {
  const [locality, setLocality] = useState("All");

  const filtered =
    locality === "All"
      ? merchants
      : merchants.filter((merchant) => merchant.locality === locality);

  const localityOptions = ["All", "St Julian's", "Sliema", "Valletta"];

  return (
    <div>
      <Eyebrow>Merchant intelligence</Eyebrow>

      <h1 className="mt-5 text-5xl font-black tracking-[-0.05em] md:text-6xl">
        Selection is not the question.
      </h1>

      <p className="mt-5 max-w-3xl text-xl leading-8 text-black/55">
        The question is which merchants help Bolt own specific customer
        occasions better than the competition.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {localityOptions.map((option) => (
          <button
            key={option}
            onClick={() => setLocality(option)}
            className={`rounded-full px-4 py-2 text-xs font-black ${
              locality === option
                ? "bg-[#111827] text-white"
                : "border border-black/10 bg-white text-black/55"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-4">
        {filtered.map((merchant) => (
          <div
            key={merchant.name}
            className="rounded-3xl border border-black/10 bg-white p-6"
          >
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-xl font-black">{merchant.name}</div>
                  <EvidenceBadge type={merchant.evidenceType} />
                </div>

                <div className="mt-2 text-sm text-black/45">
                  {merchant.locality} · {merchant.cuisine}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-black uppercase tracking-[0.14em] text-black/30">
                  Bolt rating
                </div>
                <div className="mt-1 text-2xl font-black">
                  {merchant.rating}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-4">
              <SmallDecision
                label="Occasion"
                value={merchant.occasion}
              />
              <SmallDecision
                label="Late-night"
                value={merchant.lateNight}
              />
              <SmallDecision
                label="Tourist fit"
                value={merchant.touristFit}
              />
              <SmallDecision
                label="GM opportunity"
                value={merchant.opportunity}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-3xl bg-[#111827] p-8 text-white">
        <Eyebrow dark>Merchant agent view</Eyebrow>

        <div className="mt-4 text-3xl font-black">
          Stop counting logos. Start owning occasions.
        </div>

        <p className="mt-4 max-w-3xl text-sm leading-6 text-white/60">
          If the same restaurant exists on multiple platforms, selection alone
          does not create an advantage. Availability, operating hours,
          delivery experience, pricing, merchant quality and customer occasion
          become the battleground.
        </p>
      </div>
    </div>
  );
}

function OpportunityRoom(props: {
  opportunity: Opportunity;
  onBack: () => void;
  experimentOpen: boolean;
  setExperimentOpen: (v: boolean) => void;
  rides: number;
  setRides: (v: number) => void;
  foodOverlap: number;
  setFoodOverlap: (v: number) => void;
  activation: number;
  setActivation: (v: number) => void;
  aov: number;
  setAov: (v: number) => void;
  contribution: number;
  setContribution: (v: number) => void;
  eligible: number;
  incrementalOrders: number;
  monthlyGmv: number;
  annualGmv: number;
  goToWarRoom: () => void;
}) {
  const op = props.opportunity;

  return (
    <div>
      <button
        onClick={props.onBack}
        className="text-sm font-black text-black/45 hover:text-black"
      >
        ← Back
      </button>

      <div className="mt-8 flex flex-wrap gap-3">
        <Tag>Opportunity {String(op.id).padStart(3, "0")}</Tag>
        <Tag neutral>Score {op.score}</Tag>
      </div>

      <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-[-0.05em] md:text-6xl">
        {op.title}
      </h1>

      <p className="mt-5 max-w-3xl text-xl leading-8 text-black/55">
        {op.subtitle}
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <Metric value={`${op.confidence}%`} label="confidence" />
        <Metric value={`${op.score}`} label="opportunity score" />
        <Metric value={op.speed} label="speed to test" />
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-2">
        <Evidence
          title="What we know"
          items={op.evidence}
          badge="PUBLIC FACT"
        />
        <Evidence
          title="What we don't know"
          items={op.unknowns}
          dark
          badge="INTERNAL DATA NEEDED"
        />
      </div>

      {op.id === 1 && (
        <>
          <div className="mt-12">
            <Eyebrow>Give me the real numbers</Eyebrow>
            <h2 className="mt-3 text-3xl font-black">
              Replace assumptions. Watch the opportunity move.
            </h2>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <Input
              label="Airport rides / month"
              value={props.rides}
              setValue={props.setRides}
            />
            <Input
              label="Already use Food %"
              value={props.foodOverlap}
              setValue={props.setFoodOverlap}
            />
            <Input
              label="Activation %"
              value={props.activation}
              setValue={props.setActivation}
            />
            <Input
              label="Average order €"
              value={props.aov}
              setValue={props.setAov}
            />
            <Input
              label="Contribution €"
              value={props.contribution}
              setValue={props.setContribution}
              step={0.1}
            />
          </div>

          <div className="mt-6 rounded-3xl bg-[#111827] p-8 text-white">
            <EvidenceBadge type="MODELED ASSUMPTION" dark />

            <div className="mt-6 grid gap-6 md:grid-cols-4">
              <DarkMetric
                value={props.eligible.toLocaleString()}
                label="eligible riders"
              />
              <DarkMetric
                value={props.incrementalOrders.toLocaleString()}
                label="orders / month"
              />
              <DarkMetric
                value={`€${Math.round(props.monthlyGmv).toLocaleString()}`}
                label="GMV / month"
              />
              <DarkMetric
                value={`€${Math.round(props.annualGmv).toLocaleString()}`}
                label="annualized GMV"
              />
            </div>
          </div>
        </>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          onClick={() => props.setExperimentOpen(!props.experimentOpen)}
          className="rounded-xl bg-violet-600 px-6 py-4 text-sm font-black text-white hover:bg-violet-700"
        >
          {props.experimentOpen ? "Close experiment" : "Build experiment →"}
        </button>

        {op.id === 2 && (
          <button
            onClick={props.goToWarRoom}
            className="rounded-xl bg-[#111827] px-6 py-4 text-sm font-black text-white"
          >
            Open Saturday War Room →
          </button>
        )}
      </div>

      {props.experimentOpen && <ExperimentBuilder opportunity={op} />}
    </div>
  );
}

function ExperimentBuilder({ opportunity }: { opportunity: Opportunity }) {
  return (
    <div className="mt-8 rounded-3xl border border-violet-200 bg-violet-50 p-7 md:p-9">
      <Eyebrow>Experiment agent</Eyebrow>

      <h2 className="mt-3 text-3xl font-black tracking-[-0.03em]">
        {opportunity.title} — controlled test
      </h2>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <InfoBlock
          label="Hypothesis"
          text="A tightly targeted intervention will outperform blanket action while protecting contribution."
        />
        <InfoBlock
          label="Primary metric"
          text="Incremental contribution"
        />
        <InfoBlock
          label="Test group"
          text="Selected high-potential Malta cohorts."
        />
        <InfoBlock
          label="Control"
          text="Comparable untreated cohort matched by locality and customer maturity."
        />
        <InfoBlock
          label="Kill criteria"
          text="Stop if contribution remains negative after minimum sample size or service quality degrades."
        />
        <InfoBlock
          label="Decision"
          text="Scale / narrow / redesign / kill."
        />
      </div>
    </div>
  );
}

function AskCountryGM() {
  const [query, setQuery] = useState(promptPresets[0]);

  const [runState, setRunState] = useState<
    "idle" | "running" | "done"
  >("idle");

  const resultRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (runState === "done") {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 120);
    }
  }, [runState]);

  const runMalta = () => {
    setRunState("running");

    setTimeout(() => {
      setRunState("done");
    }, 950);
  };

  return (
    <div>
      <Eyebrow>Operator interface</Eyebrow>

      <h1 className="mt-5 text-5xl font-black tracking-[-0.05em] md:text-6xl">
        Ask Country GM.
      </h1>

      <p className="mt-5 max-w-3xl text-xl leading-8 text-black/55">
        Give me a mandate, a constraint or a messy operating problem.
      </p>

      <div className="mt-10 rounded-3xl bg-[#111827] p-7 text-white">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-h-32 w-full resize-none bg-transparent text-2xl font-black leading-9 outline-none placeholder:text-white/20"
        />

        <div className="mt-5 flex justify-end">
          <button
            onClick={runMalta}
            disabled={runState === "running"}
            className="rounded-xl bg-violet-600 px-6 py-4 text-sm font-black disabled:opacity-60"
          >
            {runState === "running"
              ? "Running Malta..."
              : "Run Malta →"}
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {promptPresets.map((prompt) => (
          <button
            key={prompt}
            onClick={() => {
              setQuery(prompt);
              setRunState("idle");
            }}
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-bold text-black/55 hover:text-black"
          >
            {prompt}
          </button>
        ))}
      </div>

      {runState === "running" && (
        <div className="mt-8 rounded-3xl bg-violet-50 p-7">
          <Eyebrow>Country GM is working</Eyebrow>

          <div className="mt-6 space-y-4">
            <div className="font-black">
              → Market Intelligence investigating Malta
            </div>

            <div className="font-black">
              → Growth testing possible levers
            </div>

            <div className="font-black">
              → Economics rejecting weak ideas
            </div>

            <div className="font-black">
              → Country GM resolving trade-offs
            </div>
          </div>
        </div>
      )}

      {runState === "done" && (
        <div ref={resultRef} className="mt-8 scroll-mt-28">
          <div className="rounded-3xl border border-black/10 bg-white p-7">
            <Eyebrow>Constraint accepted</Eyebrow>

            <div className="mt-4 text-2xl font-black">{query}</div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <Metric value="12" label="levers investigated" />
              <Metric value="7" label="rejected" />
              <Metric value="3" label="worth testing" purple />
            </div>

            <div className="mt-8 border-t border-black/10 pt-7">
              <SectionLabel>I would test</SectionLabel>

              <div className="mt-5 space-y-3">
                <Recommendation
                  n="01"
                  title="Tourist → Food"
                  reason="Acquire an occasion Bolt can access through its broader mobility ecosystem."
                />

                <Recommendation
                  n="02"
                  title="St Julian's late-night"
                  reason="Attack a geographically concentrated occasion rather than subsidising Malta broadly."
                />

                <Recommendation
                  n="03"
                  title="Bolt Plus frequency"
                  reason="Increase repeat behaviour instead of continually rebuying customers."
                />
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-violet-50 p-6">
              <Eyebrow>What changes my answer?</Eyebrow>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <SmallDecision
                  label="01"
                  value="Ride → Food overlap"
                />
                <SmallDecision
                  label="02"
                  value="Contribution / order by cohort"
                />
                <SmallDecision
                  label="03"
                  value="Saturday courier utilisation"
                />
                <SmallDecision
                  label="04"
                  value="Bolt Plus penetration"
                />
              </div>

              <p className="mt-6 text-sm font-black">
                Give me those four numbers and I will rerank Malta.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SaturdayWarRoom() {
  const [incentive, setIncentive] = useState(1.4);
  const [supplyShock, setSupplyShock] = useState(18);

  const model = useMemo(() => {
    const supplyRecovery = Math.min(
      18,
      Math.round(incentive * 7 + supplyShock * 0.18)
    );

    const etaImprovement = Math.max(
      1.2,
      Number((supplyRecovery * 0.31).toFixed(1))
    );

    const completionGain = Number((supplyRecovery * 0.24).toFixed(1));
    const contributionHit = Number((incentive * 0.14).toFixed(2));

    return {
      supplyRecovery,
      etaImprovement,
      completionGain,
      contributionHit,
    };
  }, [incentive, supplyShock]);

  return (
    <div>
      <Eyebrow>War Room · Saturday 19:30</Eyebrow>

      <h1 className="mt-5 max-w-4xl text-5xl font-black tracking-[-0.05em] md:text-6xl">
        Malta's most important 30 minutes?
      </h1>

      <p className="mt-5 max-w-3xl text-xl leading-8 text-black/55">
        Growth and operations collide when demand peaks.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-4">
        <Metric value="+24%" label="modeled demand spike" purple />
        <Metric value="-18%" label="courier supply shock" />
        <Metric value="+6.4m" label="modeled ETA risk" />
        <Metric value="+2.2pp" label="completion risk" />
      </div>

      <div className="mt-10 rounded-3xl border border-black/10 bg-white p-7">
        <EvidenceBadge type="MODELED ASSUMPTION" />

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Input
            label="Courier incentive € / order"
            value={incentive}
            setValue={setIncentive}
            step={0.1}
          />
          <Input
            label="Modeled supply gap %"
            value={supplyShock}
            setValue={setSupplyShock}
          />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          <Metric
            value={`+${model.supplyRecovery}%`}
            label="supply recovery"
          />
          <Metric
            value={`-${model.etaImprovement}m`}
            label="ETA impact"
          />
          <Metric
            value={`+${model.completionGain}%`}
            label="completion"
          />
          <Metric
            value={`-€${model.contributionHit}`}
            label="contribution / order"
            purple
          />
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <AgentStatement
          agent="Courier Agent"
          position="Increase incentives island-wide."
          reason="Peak supply is insufficient for forecast demand."
        />

        <AgentStatement
          agent="Economics Agent"
          position="Reject island-wide incentive."
          reason="We pay for couriers in zones where no supply constraint exists."
          reject
        />

        <AgentStatement
          agent="Experience Agent"
          position="Intervene."
          reason="Doing nothing increases ETA, cancellation and refund exposure."
        />
      </div>

      <div className="mt-8 rounded-3xl bg-[#111827] p-8 text-white">
        <Eyebrow dark>Country GM decision</Eyebrow>

        <div className="mt-4 text-3xl font-black">
          Target the constraint. Don't subsidise the island.
        </div>

        <p className="mt-4 max-w-3xl text-sm leading-6 text-white/60">
          Run incentives only in constrained zones and only during the peak
          window.
        </p>
      </div>
    </div>
  );
}

function PnlLab({
  incrementalOrders,
  monthlyGmv,
  annualGmv,
  contribution,
}: {
  incrementalOrders: number;
  monthlyGmv: number;
  annualGmv: number;
  contribution: number;
}) {
  const promo = 3;
  const postPromo = contribution - promo;

  return (
    <div>
      <Eyebrow>Economic truth</Eyebrow>

      <h1 className="mt-5 text-5xl font-black tracking-[-0.05em] md:text-6xl">
        P&L Lab
      </h1>

      <p className="mt-5 max-w-3xl text-xl leading-8 text-black/55">
        Growth ideas don't reach Monday until they survive economics.
      </p>

      <div className="mt-10 rounded-3xl border border-black/10 bg-white p-8">
        <EvidenceBadge type="MODELED ASSUMPTION" />

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <Metric
            value={incrementalOrders.toLocaleString()}
            label="orders / month"
          />
          <Metric
            value={`€${Math.round(monthlyGmv).toLocaleString()}`}
            label="monthly GMV"
          />
          <Metric
            value={`€${Math.round(annualGmv).toLocaleString()}`}
            label="annualized GMV"
          />
        </div>

        <div className="mt-8 space-y-2">
          <PnlRow
            label="Contribution before promotion"
            value={`€${contribution.toFixed(2)}`}
          />
          <PnlRow label="Illustrative incentive" value="-€3.00" />
          <PnlRow
            label="Contribution after promotion"
            value={`€${postPromo.toFixed(2)}`}
            bold
          />
        </div>
      </div>
    </div>
  );
}

function Agents() {
  return (
    <div>
      <Eyebrow>Operating architecture</Eyebrow>

      <h1 className="mt-5 text-5xl font-black tracking-[-0.05em] md:text-6xl">
        Agents investigate.
        <br />
        Operators decide.
      </h1>

      <p className="mt-5 max-w-3xl text-xl leading-8 text-black/55">
        AI makes investigation cheaper. It does not eliminate accountability.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {agents.map((agent, i) => (
          <div
            key={agent.name}
            className="rounded-3xl border border-black/10 bg-white p-7"
          >
            <div className="text-xs font-black text-black/20">0{i + 1}</div>
            <div className="mt-5 text-2xl font-black">{agent.name}</div>
            <div className="mt-2 text-sm text-black/45">{agent.role}</div>
            <div className="mt-8 border-t border-black/10 pt-5 text-sm font-black">
              {agent.status}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-3xl bg-[#111827] p-8 text-white">
        <div className="grid gap-6 md:grid-cols-5">
          {[
            ["Observe", "signals"],
            ["Investigate", "evidence"],
            ["Challenge", "economics"],
            ["Execute", "experiment"],
            ["Learn", "memory"],
          ].map(([title, label]) => (
            <div key={title}>
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
                {label}
              </div>
              <div className="mt-2 text-lg font-black">{title} →</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Metric({
  value,
  label,
  purple = false,
}: {
  value: string;
  label: string;
  purple?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <div
        className={`text-3xl font-black tracking-[-0.04em] ${
          purple ? "text-violet-600" : ""
        }`}
      >
        {value}
      </div>
      <div className="mt-2 text-xs font-bold text-black/40">{label}</div>
    </div>
  );
}

function DarkMetric({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div>
      <div className="text-2xl font-black tracking-[-0.03em]">{value}</div>
      <div className="mt-2 text-xs font-bold text-white/40">{label}</div>
    </div>
  );
}

function Evidence({
  title,
  items,
  dark = false,
  badge,
}: {
  title: string;
  items: string[];
  dark?: boolean;
  badge?: string;
}) {
  return (
    <div
      className={`rounded-3xl p-7 ${
        dark ? "bg-[#111827] text-white" : "border border-black/10 bg-white"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionLabel dark={dark}>{title}</SectionLabel>

        {badge && (
          <div
            className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-[0.13em] ${
              dark
                ? "bg-white/10 text-white/55"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {badge}
          </div>
        )}
      </div>

      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div key={item} className="flex gap-3 text-sm leading-6">
            <span
              className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${
                dark ? "bg-violet-400" : "bg-violet-600"
              }`}
            />
            <span className={dark ? "text-white/65" : "text-black/60"}>
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EvidenceBadge({
  type,
  dark = false,
}: {
  type: EvidenceType;
  dark?: boolean;
}) {
  const styles =
    type === "PUBLIC FACT"
      ? dark
        ? "bg-emerald-400/10 text-emerald-300"
        : "bg-emerald-50 text-emerald-700"
      : type === "PUBLIC INFERENCE"
      ? dark
        ? "bg-amber-400/10 text-amber-300"
        : "bg-amber-50 text-amber-700"
      : dark
      ? "bg-violet-400/10 text-violet-300"
      : "bg-violet-50 text-violet-700";

  return (
    <div
      className={`inline-flex rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-[0.14em] ${styles}`}
    >
      {type}
    </div>
  );
}

function Input({
  label,
  value,
  setValue,
  step = 1,
}: {
  label: string;
  value: number;
  setValue: (v: number) => void;
  step?: number;
}) {
  return (
    <label className="rounded-2xl border border-black/10 bg-white p-4">
      <div className="min-h-8 text-[10px] font-black uppercase leading-4 tracking-[0.12em] text-black/35">
        {label}
      </div>

      <input
        type="number"
        value={value}
        step={step}
        onChange={(e) => setValue(Number(e.target.value))}
        className="mt-3 w-full bg-transparent text-2xl font-black outline-none"
      />
    </label>
  );
}

function PnlRow({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-black/10 py-4 last:border-0">
      <div className="text-sm text-black/55">{label}</div>
      <div className={`text-sm ${bold ? "font-black" : "font-bold"}`}>
        {value}
      </div>
    </div>
  );
}

function Tag({
  children,
  neutral = false,
}: {
  children: React.ReactNode;
  neutral?: boolean;
}) {
  return (
    <div
      className={`rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] ${
        neutral
          ? "border border-black/10 bg-white"
          : "bg-violet-100 text-violet-700"
      }`}
    >
      {children}
    </div>
  );
}

function Eyebrow({
  children,
  dark = false,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div
      className={`text-xs font-black uppercase tracking-[0.2em] ${
        dark ? "text-violet-300" : "text-violet-600"
      }`}
    >
      {children}
    </div>
  );
}

function SectionLabel({
  children,
  dark = false,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div
      className={`text-xs font-black uppercase tracking-[0.18em] ${
        dark ? "text-white/40" : "text-black/35"
      }`}
    >
      {children}
    </div>
  );
}

function LocalityMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
      <div className="text-xs font-bold text-white/40">{label}</div>
      <div className="text-right text-sm font-black">{value}</div>
    </div>
  );
}

function InfoBlock({
  label,
  text,
}: {
  label: string;
  text: string;
}) {
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <p className="mt-3 text-sm font-bold leading-6 text-black/65">{text}</p>
    </div>
  );
}

function SearchStep({
  agent,
  result,
}: {
  agent: string;
  result: string;
}) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-white/10 pb-4 last:border-0">
      <div className="font-black">{agent}</div>
      <div className="text-right text-sm text-white/50">{result}</div>
    </div>
  );
}

function SmallDecision({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-black/[0.035] p-4">
      <div className="text-[10px] font-black uppercase tracking-[0.14em] text-black/35">
        {label}
      </div>
      <div className="mt-2 text-sm font-black">{value}</div>
    </div>
  );
}

function Recommendation({
  n,
  title,
  reason,
}: {
  n: string;
  title: string;
  reason: string;
}) {
  return (
    <div className="grid gap-4 rounded-2xl bg-black/[0.035] p-5 md:grid-cols-[45px_180px_minmax(0,1fr)]">
      <div className="font-black text-black/25">{n}</div>
      <div className="font-black">{title}</div>
      <div className="text-sm leading-6 text-black/50">{reason}</div>
    </div>
  );
}

function AgentStatement({
  agent,
  position,
  reason,
  reject = false,
}: {
  agent: string;
  position: string;
  reason: string;
  reject?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm font-black">{agent}</div>

        {reject && (
          <div className="rounded-full bg-red-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-red-600">
            Rejects
          </div>
        )}
      </div>

      <div className="mt-4 text-xl font-black">{position}</div>
      <div className="mt-2 text-sm leading-6 text-black/50">{reason}</div>
    </div>
  );
}