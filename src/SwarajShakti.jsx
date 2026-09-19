import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from "recharts";
import {
  Menu, X, Heart, ShieldCheck, Users, Landmark, Sun, GraduationCap, Coins,
  Leaf, Hammer, Building2, Handshake, Flag, Compass, Gauge, Scale,
  ChevronDown, ChevronRight, ChevronLeft, AtSign, Mail,
  Check, RotateCcw, Sparkles, Award,
} from "lucide-react";

/* =========================================================================
   CENTRAL DATA FILE
   Every number, chart and stat on this site reads from this object and the
   arrays below it. Nothing here is invented — anywhere real fieldwork data
   does not exist yet, the value is left as `null` / an empty array, and the
   interface shows an honest "data to be added" state instead of a fake one.
   To wire in real numbers later, edit only this section.
   ========================================================================= */

const projectData = {
  meta: {
    name: "Gandhi for Tomorrow",
    tagline: "Ancient principles. Modern problems. Young people taking action.",
    event: "Global Youth Peace Fest (GYPF) 2026, Chandigarh",
    instagramUrl: null, // add the real profile URL here
    contactEmail: null, // add a real contact address here
  },
  methodology: {
    collectedBy: "Our own student research team",
    studentsInField: "50+",
    villageCount: 6,
    respondentCount: 210,
    surveyType: "In-person, conversational surveys — not formal interviews",
    interviewsUsed: "We found structured interviews made people uncomfortable, so we used informal conversation instead",
    categorization: "Responses were grouped first by gender, then — within women — by whether they reported a skill, then by whether that skill is currently used professionally",
  },
  data: {
    demographics: { n: 210, male: 82, female: 128 },
    employment: {
      n: 210,
      total: { count: 104, rate: 49.5 },
      male: { count: 80, rate: 97.5 },   // count derived: 82 x 97.5%, rounded
      female: { count: 24, rate: 18.7 }, // count derived: 128 x 18.7%, rounded
    },
    skills: {
      n: 210,
      withSkill: 100,
      withSkillRate: 47.6,
      womenWithSkill: 53,
      topSkill: { name: "Stitching", count: 31, shareOfSkilled: 58.4 },
      stitchingUtilizationRate: 20, // "1 in 5" women who can stitch currently use it professionally
    },
    barriers: { n: 0, categories: [] },
    youth: { n: 0, indicators: [] },
    environment: { measured: false },
  },
};

const IMPACT_STATS = [
  { key: "students", label: "Student volunteers", numeric: 50, suffix: "+" },
  { key: "villages", label: "Villages engaged", numeric: 6, suffix: "" },
  { key: "women", label: "Women engaged", numeric: 128, suffix: "" },
  { key: "youthLeaders", label: "Youth leaders contacted", numeric: 3, suffix: "" },
];

const WORD_PAIRS = [
  { old: "Ahimsa", now: "Peace" },
  { old: "Swaraj", now: "Community empowerment" },
  { old: "Swadeshi", now: "Self-reliance" },
  { old: "Nai Talim", now: "Learning by doing" },
  { old: "Sarvodaya", now: "Inclusive development" },
  { old: "Constructive Programme", now: "Action" },
];

const QUESTION_FLOW = ["School", "Villages", "Women", "Youth", "Environment", "Health", "Community networks", "SDGs"];

const WHY_DIFFERENT = [
  { title: "Not just a campaign", body: "We collected field data before we decided what to do with it." },
  { title: "Not just data", body: "We acted on what we found, in the same communities we asked." },
  { title: "Not just action", body: "We connected what we did to measurable, named goals." },
  { title: "Not just a competition project", body: "We built a model other young people can actually repeat." },
  { title: "Not just Gandhi quotes", body: "We translated principles into decisions, not posters." },
  { title: "Not just students", body: "We built a network of 50+ contributors and community connections." },
];

const PRINCIPLES = [
  {
    id: "ahimsa", sanskrit: "Ahimsa", translation: "Nonviolence", icon: Heart, sdgs: [16, 5],
    idea: "Real strength lies in refusing to meet harm with harm — in action, word and thought.",
    today: "Choosing to de-escalate rather than dominate, in an argument, a comment section, or a conflict between neighbours.",
    ourWork: "We treated every household conversation as an act of listening first, not data extraction.",
    scenario: {
      prompt: "You strongly disagree with someone online. They insult your opinion. What do you do?",
      options: [
        { id: "a", text: "Insult them back — they started it.", reflection: "Matches their energy, but Ahimsa isn't about being passive — it's about refusing to let someone else's escalation set the terms of your response." },
        { id: "b", text: "Say nothing and block them.", reflection: "Protects your peace, which matters — but it also closes the door on any chance the disagreement was worth having." },
        { id: "c", text: "Respond only to their argument, and let the insult go unanswered.", reflection: "Closest to Ahimsa in practice: you're not avoiding the conflict, you're refusing to add unnecessary harm to it." },
        { id: "d", text: "Screenshot it and share it publicly to expose them.", reflection: "Might feel like accountability, but it's designed to cause reputational harm rather than resolve anything — worth asking who that actually serves." },
      ],
    },
  },
  {
    id: "satya", sanskrit: "Satya", translation: "Truth", icon: ShieldCheck, sdgs: [16, 17],
    idea: "Truth is not just honesty in speech — it's the discipline of testing your beliefs against reality before acting on them.",
    today: "Verifying a claim before sharing it. Publishing a number only once you can stand behind it.",
    ourWork: "Every statistic on this site is either real, sourced from our own fieldwork, or clearly marked as pending. We chose incomplete over invented.",
    scenario: {
      prompt: "Your project deadline is tomorrow, and one piece of data doesn't fit the story you wanted to tell. What do you do?",
      options: [
        { id: "a", text: "Leave it out — one data point won't change the overall picture.", reflection: "It might not change the picture much, but deciding that for your audience instead of them is exactly the shortcut Satya warns against." },
        { id: "b", text: "Report it, and adjust your conclusion to fit what the data actually shows.", reflection: "Slower, and less impressive-sounding — but this is the whole point of Satya: truth over a tidier story." },
        { id: "c", text: "Mention it briefly, but don't let it affect your main argument.", reflection: "A middle path that can drift into looking honest without actually being fully honest — worth checking which one it really is." },
        { id: "d", text: "Delay the deadline until you can investigate the data point properly.", reflection: "Genuinely thorough, but not always realistic — sometimes truth has to be reported with caveats rather than perfect certainty." },
      ],
    },
  },
  {
    id: "sarvodaya", sanskrit: "Sarvodaya", translation: "Welfare of all", icon: Users, sdgs: [5, 3],
    idea: "Progress that leaves someone behind is not progress — development should be measured by its effect on the least advantaged.",
    today: "Designing a solution around the person with the least access, not the most convenient user.",
    ourWork: "When we found women with skills they weren't able to use, we treated that as a community-wide loss, not an individual one.",
    scenario: {
      prompt: "Your team can implement a fix that helps the most active, engaged members of a community quickly, or a slower approach that eventually reaches everyone. Which do you choose?",
      options: [
        { id: "a", text: "The fast fix — momentum and visible results matter.", reflection: "Real momentum, but Sarvodaya measures success by what happens to the person hardest to reach, not the easiest one." },
        { id: "b", text: "The slower, inclusive approach.", reflection: "Closer to Sarvodaya's spirit, but 'slower' can also mean 'never' without a real plan to reach the harder cases." },
        { id: "c", text: "Start with the fast fix, then commit to a second phase for everyone else.", reflection: "Often the most practical version of this idea, as long as the second phase is a real commitment, not just a promise." },
        { id: "d", text: "Ask the hardest-to-reach members what they'd actually prioritise.", reflection: "Might reveal your entire framing was wrong — arguably the most Gandhian option, since it treats them as decision-makers." },
      ],
    },
  },
  {
    id: "gramswaraj", sanskrit: "Gram Swaraj", translation: "Self-governing communities", icon: Landmark, sdgs: [4, 5, 16, 17],
    idea: "Strong communities are built through local participation, responsibility and self-reliance.",
    today: "Empowered communities identify and solve local challenges rather than waiting for someone else to solve them.",
    ourWork: "Village surveys, conversations with youth leaders, community connections, and support for youth clubs.",
    scenario: {
      prompt: "A national program offers to install a ready-made solution in a village — fast, funded, standardised. The alternative is a slower, locally designed version. Which does the community push for?",
      options: [
        { id: "a", text: "Take the national program — it's free and proven elsewhere.", reflection: "Efficient, but 'proven elsewhere' doesn't mean proven here, and it can train a community to wait for outside solutions." },
        { id: "b", text: "Build the local version, even though it's harder.", reflection: "Gram Swaraj in its purest form — though it only works if the community has the time and capacity to follow through." },
        { id: "c", text: "Take the national program, but insist on local input into how it's run.", reflection: "A workable middle ground, assuming that input is genuinely honoured and not symbolic." },
        { id: "d", text: "Let whichever local leader has the strongest ties to the funders decide.", reflection: "Fast, but it substitutes one person's judgement for the community's — the opposite of what this principle builds." },
      ],
    },
  },
  {
    id: "swadeshi", sanskrit: "Swadeshi", translation: "Local self-reliance", icon: Sun, sdgs: [13, 15],
    idea: "A community that can meet its own basic needs — energy, food, skills — is less vulnerable and more dignified.",
    today: "Choosing renewable, locally-generated energy over dependence on distant, finite supply chains.",
    ourWork: "We worked toward greater use of solar energy and more environmentally responsible practices at our school.",
    scenario: {
      prompt: "Your school needs more energy capacity. You can lease equipment from an outside company, or invest more upfront in a system your own staff and students can maintain. Which do you choose?",
      options: [
        { id: "a", text: "Lease from outside — less upfront cost and hassle.", reflection: "Lower upfront cost, but it also means depending indefinitely on someone else for something you could learn to sustain yourselves." },
        { id: "b", text: "Invest in your own system, even if it costs more now.", reflection: "Swadeshi's logic exactly — short-term cost for long-term self-reliance, if you actually build the skills to maintain it." },
        { id: "c", text: "Lease for now, and plan to build local capacity over the next few years.", reflection: "Reasonable if the plan is specific and funded — otherwise 'for now' has a way of becoming permanent." },
        { id: "d", text: "Whichever option the loudest stakeholder prefers.", reflection: "Avoids the real question — this decision deserves an actual answer, not the path of least resistance." },
      ],
    },
  },
  {
    id: "naitalim", sanskrit: "Nai Talim", translation: "Learning by doing", icon: GraduationCap, sdgs: [4],
    idea: "Real understanding comes from doing, not memorising — education should build capable hands as well as informed minds.",
    today: "Learning to run a survey by actually running one, not just studying survey design in a textbook.",
    ourWork: "The fieldwork was the classroom. Our 50+ students learned research methods and data handling by doing them in real communities.",
    scenario: {
      prompt: "You're designing a one-day workshop on survey methods for new volunteers. Do you lecture first, or send them to run one real, low-stakes survey on day one?",
      options: [
        { id: "a", text: "Lecture and handout — cover the theory properly first.", reflection: "Solid theory, but Nai Talim's argument is that theory sticks better once you've felt where it breaks down in practice." },
        { id: "b", text: "Send them straight into a real survey, mistakes and all.", reflection: "Closest to the principle, though 'low-stakes' has to be real — a sensitive first survey shouldn't be anyone's practice run." },
        { id: "c", text: "A short briefing, then a real, low-stakes survey with a debrief after.", reflection: "Usually the strongest version in practice: enough grounding to avoid harm, but the real learning happens in the doing." },
        { id: "d", text: "Have them watch an experienced volunteer do it first.", reflection: "Useful modelling, but watching isn't the same as doing — it can build confidence without competence." },
      ],
    },
  },
  {
    id: "trusteeship", sanskrit: "Trusteeship", translation: "Stewardship of resources", icon: Coins, sdgs: [13, 15],
    idea: "What you have — money, land, skill, time — is held in trust for the wider community, not owned outright for private use alone.",
    today: "Treating a school's energy budget or a team's time as something to be stewarded, not spent carelessly.",
    ourWork: "We tried to treat every hour of interview time and every response as something owed careful, honest use.",
    scenario: {
      prompt: "Your project receives more funding than it needs this term. Do you spend it all now for visible impact, or hold some back?",
      options: [
        { id: "a", text: "Spend it all now — bigger visible results help credibility.", reflection: "More to show right now, but Trusteeship treats resources as held for the project's whole life, not one term's highlight reel." },
        { id: "b", text: "Hold back a meaningful reserve for when it's actually needed.", reflection: "Trusteeship's logic directly — useful only if there's a real plan for the reserve, not money sitting unused." },
        { id: "c", text: "Spend it on something reusable, like training materials or infrastructure.", reflection: "Often the best of both — visible use now, but it keeps paying off after the funding is gone." },
        { id: "d", text: "Return the surplus, since you didn't plan to need it.", reflection: "Very honest, and sometimes right — but not automatically better than stewarding it for future community needs." },
      ],
    },
  },
  {
    id: "aparigraha", sanskrit: "Aparigraha", translation: "Responsible consumption", icon: Leaf, sdgs: [13],
    idea: "Take only what you need — accumulation beyond genuine need crowds out what others could use.",
    today: "Choosing a smaller footprint deliberately, in energy, belongings, or how much of a shared resource you take up.",
    ourWork: "It's part of why we built the Action Profile and 30-Day Challenge — tools for noticing your own patterns of consumption, not just reading about the idea.",
    scenario: {
      prompt: "Your community group is planning a fundraiser. One option raises more money but produces a lot of waste. A simpler option raises less but produces almost none. Which do you push for?",
      options: [
        { id: "a", text: "The higher-earning option — the cause needs the money.", reflection: "A fair practical argument, but Aparigraha asks whether the extra money is worth the extra footprint, not just whether more is better." },
        { id: "b", text: "The simpler, lower-waste option, even though it raises less.", reflection: "Consistent with the principle, though it's worth honestly checking whether the cause can work with less." },
        { id: "c", text: "The higher-earning option, with a plan to offset or reduce the waste.", reflection: "A reasonable compromise, as long as the offset is a real commitment, not a way to feel better about the first choice." },
        { id: "d", text: "Ask the group to vote without giving them the waste information.", reflection: "This isn't really a values decision at that point — leaving out relevant information changes what kind of choice it is." },
      ],
    },
  },
  {
    id: "labour", sanskrit: "Shram", translation: "Dignity of labour", icon: Hammer, sdgs: [5, 4],
    idea: "No useful work is beneath anyone — manual, technical and intellectual work all deserve equal respect.",
    today: "Valuing a skilled tailor's or farmer's expertise as seriously as a manager's or engineer's.",
    ourWork: "When we met women whose tailoring, farming or craft skills weren't being used professionally, we treated those as real expertise, not something to politely acknowledge.",
    scenario: {
      prompt: "Your project report is almost done. Fieldwork was shared equally, but only two team members are confident writers. Who gets named as the report's authors?",
      options: [
        { id: "a", text: "Just the two who wrote it — they did the visible final work.", reflection: "Recognises real effort, but if fieldwork was equally shared, this quietly ranks writing above the work it's built on." },
        { id: "b", text: "Everyone who did fieldwork, listed as equal contributors.", reflection: "Closer to Dignity of Labour: it treats the less visible, less 'prestigious' work as equally real." },
        { id: "c", text: "Everyone, with the two writers credited separately for writing.", reflection: "A fair way to be specific about who did what, without implying writing mattered more than what it's built on." },
        { id: "d", text: "Whoever the school wants for the plaque or presentation.", reflection: "Understandable politically, but it hands the decision to optics instead of to who actually did the work." },
      ],
    },
  },
  {
    id: "constructive", sanskrit: "Constructive Programme", translation: "Grassroots action", icon: Building2, sdgs: [17],
    idea: "Complaining about a broken system changes little; building a working alternative, even a small one, changes something real.",
    today: "Starting the community garden instead of just posting about food deserts.",
    ourWork: "This entire initiative — school to survey to youth network — is our attempt at a small constructive programme, not a critique from the sidelines.",
    scenario: {
      prompt: "The same unaddressed issue keeps coming up in your community's online group — people complain every week, but nothing changes. What do you do?",
      options: [
        { id: "a", text: "Keep raising it online — awareness is the first step.", reflection: "Awareness matters, but this principle's point is that awareness without a next step tends to become a weekly ritual." },
        { id: "b", text: "Design and try one small, real fix yourself, even an imperfect one.", reflection: "The principle in action — a small working attempt usually teaches and changes more than another round of discussion." },
        { id: "c", text: "Wait for someone with more authority or resources to fix it.", reflection: "Sometimes realistic, but it means the problem's timeline now depends entirely on someone else's priorities." },
        { id: "d", text: "Stop engaging with the topic since nothing seems to change.", reflection: "Understandable fatigue, but it closes off even the small, low-cost interventions that might have been possible." },
      ],
    },
  },
  {
    id: "service", sanskrit: "Seva", translation: "Service", icon: Handshake, sdgs: [17, 3],
    idea: "Service means showing up consistently for people, not performing generosity once and calling it done.",
    today: "Staying reachable after the 'big project' ends — answering messages, following up, keeping a door open.",
    ourWork: "We built a digital channel specifically so this wouldn't end when the survey did.",
    scenario: {
      prompt: "Your community project 'officially' ends this month. A few people you worked with still message you for advice sometimes. What do you do?",
      options: [
        { id: "a", text: "Let the relationship wind down naturally — the project is over.", reflection: "Reasonable and honest about your limits, but it treats service as having a fixed end date rather than an ongoing relationship." },
        { id: "b", text: "Keep responding, even without the project structure behind it.", reflection: "Closest to the Gandhian idea of Seva — consistency after the spotlight is what makes it real rather than performed." },
        { id: "c", text: "Point them to a resource or group instead of responding personally.", reflection: "A sustainable way to keep helping without it depending entirely on you, as long as that resource is solid." },
        { id: "d", text: "Respond, but only until it becomes inconvenient.", reflection: "Common, and human — but worth noticing this is often when service is needed most, not least." },
      ],
    },
  },
];

const SDG_ALL = [
  { n: 1, name: "No Poverty" }, { n: 2, name: "Zero Hunger" }, { n: 3, name: "Good Health & Well-Being" },
  { n: 4, name: "Quality Education" }, { n: 5, name: "Gender Equality" }, { n: 6, name: "Clean Water & Sanitation" },
  { n: 7, name: "Affordable & Clean Energy" }, { n: 8, name: "Decent Work & Economic Growth" },
  { n: 9, name: "Industry, Innovation & Infrastructure" }, { n: 10, name: "Reduced Inequalities" },
  { n: 11, name: "Sustainable Cities & Communities" }, { n: 12, name: "Responsible Consumption & Production" },
  { n: 13, name: "Climate Action" }, { n: 14, name: "Life Below Water" }, { n: 15, name: "Life on Land" },
  { n: 16, name: "Peace, Justice & Strong Institutions" }, { n: 17, name: "Partnerships for the Goals" },
];

const SDG_CORE = [4, 5, 13, 17];
const SDG_ADDITIONAL = [3, 15, 16];

const SDG_DETAILS = {
  4: { principle: "naitalim", connection: "Nai Talim — real learning happens through doing, not memorising.", problem: "Formal schooling doesn't always connect students to the realities of the communities around them.", action: "50+ students ran actual field research — surveys, interviews, data organisation — as their education, not an add-on to it.", evidence: "See the study overview in Our Data.", next: "Turn this into a repeatable research-methods module other student teams could run." },
  5: { principle: "sarvodaya", connection: "Sarvodaya and Dignity of Labour — everyone's capability deserves real use, not just recognition.", problem: "Skills women hold aren't always translated into paid work, recognition, or decision-making power.", action: "We surveyed women in the communities we visited about the skills they have and whether they currently use them professionally.", evidence: "See Women & Professions and the Skills Explorer in Our Data.", next: "Build stronger links between the skills we found and real training, markets or mentors." },
  13: { principle: "swadeshi", connection: "Swadeshi — local, self-reliant, responsible use of resources instead of dependence on distant, finite ones.", problem: "Schools and communities often keep drawing on carbon-intensive energy simply because switching feels complicated.", action: "We worked toward greater use of solar and renewable energy, and more environmentally responsible practices, at our school.", evidence: "See the Environment panel in Our Data and the Solar Calculator in Interact.", next: "Measure before/after energy data properly and look at where else the same approach could apply." },
  17: { principle: "gramswaraj", connection: "Gram Swaraj and Constructive Programme — strong outcomes come from local partnership, not isolated effort.", problem: "Youth-led projects often end when the people who started them move on, because they were never connected to anyone else.", action: "We connected with youth-club leaders and opened a digital channel to keep the relationship going after fieldwork ended.", evidence: "See Our Journey — the Youth and Digital Connectivity steps.", next: "Turn individual contacts into a standing network of local partners." },
  3: { principle: "sarvodaya", connection: "Sarvodaya — welfare that includes physical wellbeing, not only economic measures.", problem: "Basic health awareness and access don't reach every household equally.", action: "We promoted physical well-being and small, practical actions for cleaner, healthier community spaces.", evidence: "See the Health panel in Our Data.", next: "Pair awareness activities with a way to measure change in behaviour, not just attendance." },
  15: { principle: "trusteeship", connection: "Trusteeship — treating shared natural resources as something held in trust, not something to use up.", problem: "Small, local environmental actions rarely get tracked, so their value is easy to underestimate.", action: "Alongside our energy work, we encouraged small, practical steps toward cleaner and greener shared spaces.", evidence: "See the Environment panel in Our Data.", next: "Set a simple baseline so future green actions can be measured, not just described." },
  16: { principle: "ahimsa", connection: "Ahimsa and Gram Swaraj — peaceful, participatory processes for solving shared problems.", problem: "Local decisions are sometimes made without the people most affected by them being consulted.", action: "We treated every survey conversation as an act of listening first — asking before assuming what a community needed.", evidence: "See How We Know on the About page.", next: "Create a simple channel for communities to raise concerns directly with us, not just answer our questions." },
};

const JOURNEY_STEPS = [
  { n: "01", title: "The school", body: "We worked toward greater use of renewable and solar energy, and more environmentally responsible practices, at our school." },
  { n: "02", title: "Listening", body: "We conducted surveys and community research in villages, before deciding what to build." },
  { n: "03", title: "Discovering", body: "We looked for patterns in what we heard, and let those patterns — not our assumptions — define the community's needs." },
  { n: "04", title: "Mobilising", body: "More than 50 students took part in the initiative, across research, outreach, design and documentation." },
  { n: "05", title: "Women & skills", body: "We found women with useful, real skills whose potential wasn't always being put to professional use." },
  { n: "06", title: "Youth", body: "We connected with youth-club leaders and encouraged youth-led community organisation." },
  { n: "07", title: "Health & environment", body: "We promoted physical well-being and small, practical actions for cleaner and greener communities." },
  { n: "08", title: "Digital connectivity", body: "We opened a digital channel so guidance and communication could continue after the fieldwork ended." },
  { n: "09", title: "Next chapter", body: "Expand community participation. Build stronger youth networks. Document measurable impact. Create models others can repeat." },
];

const GANDHI_TIMELINE = [
  { year: "1869", label: "Born in Porbandar." },
  { year: "1915", label: "Returns to India after two decades in South Africa." },
  { year: "1930", label: "Leads the Salt March, a mass act of nonviolent resistance." },
  { year: "1947", label: "India gains independence." },
  { year: "1948", label: "Gandhi is assassinated." },
  { year: "2015", label: "The UN adopts the 17 Sustainable Development Goals." },
  { year: "2026", label: "This student initiative begins." },
  { year: "2030", label: "The SDG target horizon." },
];

const AP_DIMENSIONS = [
  { key: "consumption", label: "Responsible consumption" },
  { key: "service", label: "Community service" },
  { key: "inclusion", label: "Social inclusion" },
  { key: "environment", label: "Environmental responsibility" },
  { key: "peace", label: "Peaceful conflict resolution" },
  { key: "participation", label: "Local participation" },
  { key: "learning", label: "Learning through action" },
];

const AP_QUESTIONS = [
  { id: "q1", dim: "consumption", text: "Before buying something you don't urgently need, you usually…", options: [
    { text: "Buy it right away if I want it", score: 0 }, { text: "Think about it for a day or two", score: 2 },
    { text: "Wait a while and ask if I'll really use it", score: 3 }, { text: "Only buy it if I can name a specific use for it", score: 4 } ] },
  { id: "q2", dim: "service", text: "In the last month, how much time have you given to something outside your own routine — a neighbour, a cause, a task for someone else?", options: [
    { text: "None that I can think of", score: 0 }, { text: "A little, if it was easy", score: 2 },
    { text: "Some, when someone specifically asked", score: 3 }, { text: "Regularly, without being asked", score: 4 } ] },
  { id: "q3", dim: "inclusion", text: "When a group or team is forming for something, you tend to…", options: [
    { text: "Stick with people I already know well", score: 1 }, { text: "Go along with whoever's already grouped up", score: 1 },
    { text: "Notice if someone's being left out and say something", score: 3 }, { text: "Actively make space for someone new or overlooked", score: 4 } ] },
  { id: "q4", dim: "environment", text: "How often do you make a small choice specifically because of its environmental impact?", options: [
    { text: "Rarely think about it", score: 0 }, { text: "Occasionally", score: 2 },
    { text: "Fairly often", score: 3 }, { text: "It shapes a lot of my daily decisions", score: 4 } ] },
  { id: "q5", dim: "peace", text: "Someone close to you says something you find unfair. Your first instinct is to…", options: [
    { text: "Respond just as sharply back", score: 0 }, { text: "Go quiet and stay upset", score: 1 },
    { text: "Say how it affected you once you've calmed down", score: 3 }, { text: "Pause, then respond to what they likely meant", score: 4 } ] },
  { id: "q6", dim: "participation", text: "Do you know what's currently being discussed or decided in your local area?", options: [
    { text: "Not really", score: 0 }, { text: "Vaguely", score: 1 },
    { text: "I follow it sometimes", score: 3 }, { text: "Yes, and I've weighed in at some point", score: 4 } ] },
  { id: "q7", dim: "learning", text: "When you want to understand something new, you'd rather…", options: [
    { text: "Read or watch something about it first", score: 1 }, { text: "Ask someone who already knows", score: 2 },
    { text: "Try a small version of it yourself", score: 3 }, { text: "Jump in and learn from getting it wrong", score: 4 } ] },
  { id: "q8", dim: "consumption", text: "How often do you consider repairing or reusing something instead of replacing it?", options: [
    { text: "Almost never", score: 0 }, { text: "If it's easy to fix", score: 2 },
    { text: "Usually, if it's fixable at all", score: 3 }, { text: "I actively look for ways to avoid replacing things", score: 4 } ] },
  { id: "q9", dim: "service", text: "If a local group needed volunteers this weekend for something unglamorous, would you show up?", options: [
    { text: "Probably not", score: 0 }, { text: "Only if a close friend asked", score: 2 },
    { text: "Likely yes", score: 3 }, { text: "Yes, I've done this kind of thing before", score: 4 } ] },
  { id: "q10", dim: "inclusion", text: "In a disagreement between two people you know, do you try to understand both sides first?", options: [
    { text: "I usually side with whoever I'm closer to", score: 1 }, { text: "Sometimes", score: 2 },
    { text: "Generally yes", score: 3 }, { text: "Yes, consistently, even when it's inconvenient", score: 4 } ] },
  { id: "q11", dim: "participation", text: "Have you raised a concern about something in your community directly with the people responsible for it?", options: [
    { text: "No, never", score: 0 }, { text: "I've thought about it but not done it", score: 1 },
    { text: "Once or twice", score: 3 }, { text: "Yes, more than once", score: 4 } ] },
];

const AP_SUGGESTIONS = {
  consumption: ["Before your next non-essential purchase, wait 48 hours and see if you still want it.", "Pick one thing you'd normally replace this month and try repairing it instead.", "Try the 30-Day Challenge's consumption-focused days on purpose, not just when convenient."],
  service: ["Offer a specific, unglamorous hour of help to someone this week.", "Look at Start a Youth Club — even joining one nearby counts.", "Take a pledge on community time below, and actually follow through."],
  inclusion: ["Next time a group forms, actively invite whoever's most likely to be left out.", "Practice restating someone's view before responding, especially when you disagree.", "Notice who's spoken least in your next group conversation, and make room for them."],
  environment: ["Run the Solar Calculator on your own home or school.", "Track one form of waste for a week before deciding what to change.", "Join or start a small local clean-up."],
  peace: ["Next disagreement, try naming what the other person actually wants before responding.", "Revisit the Ahimsa scenario in Gandhi's Ideas next time you're annoyed online.", "Write down a recent conflict and reread it from the other person's side."],
  participation: ["Find one real decision currently being made in your local area, and read about it.", "Attend one local meeting, even just to listen.", "Raise one small, specific concern with the person who can actually act on it."],
  learning: ["Pick one thing you've only read about and try the smallest version of it this week.", "Take the Gandhi Decision Lab and sit with the tradeoffs instead of the 'obviously right' answer.", "Ask someone who's done something you want to learn, then do it alongside them."],
};

const DECISION_SCENARIOS = [
  { id: "skills", title: "Women's skills", domain: "Gender equality",
    prompt: "You find that women in a community have valuable skills — tailoring, farming, craft work — that aren't being used professionally. What's the most sustainable next step?",
    options: [
      { text: "Organise a one-time skills showcase.", reflection: "Raises visibility fast, but a single event rarely creates lasting access to income or training — the attention fades once it ends." },
      { text: "Connect them directly to paid work you've already arranged.", reflection: "Well-intentioned, but deciding for people what work suits them, without asking, can be paternalistic and doesn't build anything reusable." },
      { text: "Ask them what kind of support they actually want first.", reflection: "Slower and less dramatic — but closest to Gram Swaraj and Sarvodaya: durable change starts with people defining their own problem." },
      { text: "Design a structured training programme based on similar projects elsewhere.", reflection: "Training can help, but importing a model without checking it fits this community risks solving a problem nobody there actually has." },
    ] },
  { id: "budget", title: "Environment vs. education budget", domain: "Environment",
    prompt: "Your school has a fixed budget. You can fund a bigger solar installation, or split it between solar and a student environmental-education programme. What do you choose?",
    options: [
      { text: "Go all-in on solar — the impact is bigger and easier to show.", reflection: "Strongest before/after numbers fastest — but Swadeshi is about building capacity, not just installing it; upkeep still depends on someone understanding the system." },
      { text: "Split the budget between solar and education.", reflection: "Smaller installation, slower numbers — but more people understand why it matters, which tends to make the change last." },
      { text: "Skip solar for now and fund only the education programme.", reflection: "Builds understanding without adding a single watt of clean energy — useful groundwork, but action and awareness eventually need to meet." },
      { text: "Delay the decision until you've surveyed what people actually want.", reflection: "Genuinely Gandhian — ask first — but delay has a real cost if the funding window closes." },
    ] },
  { id: "digital", title: "Digital conflict", domain: "Online behaviour",
    prompt: "A post from your project gets a wave of harsh, exaggerated criticism online — some fair, most not. How do you respond?",
    options: [
      { text: "Respond point-by-point to every criticism, fair or not.", reflection: "Thorough, but it can turn a disagreement into an endless argument, and gives equal weight to bad-faith comments and genuine concerns." },
      { text: "Ignore it completely and keep posting as normal.", reflection: "Protects your energy, but if any of it is fair, ignoring it all means losing a real chance to improve." },
      { text: "Acknowledge the fair points publicly, and leave the rest.", reflection: "Ahimsa and Satya together — respond to the truth in what was said, without needing to 'win' or feed the bad-faith parts." },
      { text: "Delete the post and move on.", reflection: "Makes the discomfort disappear quickly, but erases any fair criticism along with the unfair, and can look like you have something to hide." },
    ] },
  { id: "governance", title: "A local governance decision", domain: "Local governance",
    prompt: "A village panchayat is deciding where to place a new community water point. Two groups disagree. As outside researchers, what do you do?",
    options: [
      { text: "Suggest the location your data says is most efficient.", reflection: "Efficient by your metric, but it's not your village — recommending a location for people who live with it can quietly undercut local decision-making." },
      { text: "Stay out of it entirely.", reflection: "Respects Gram Swaraj, but if you hold relevant data, withholding it entirely isn't neutral either — it can just mean the loudest group wins." },
      { text: "Share your data with both groups and the panchayat, then step back.", reflection: "Keeps the decision where it belongs while making sure it's informed — takes more restraint than it looks like." },
      { text: "Propose a compromise location yourself.", reflection: "Feels fair, but an outsider-chosen compromise can end up serving neither group well if you don't understand why each wants what it wants." },
    ] },
  { id: "handoff", title: "A leadership handoff", domain: "Youth leadership",
    prompt: "Your 30-day challenge and youth club are gaining real momentum, but your student team is graduating soon. What do you do?",
    options: [
      { text: "Keep running it remotely after you leave.", reflection: "Keeps continuity short-term, but a project run by people no longer on the ground tends to quietly fade." },
      { text: "Hand it off to the youngest, most active members, with real responsibility.", reflection: "Closest to Nai Talim and Constructive Programme — people learn to lead by actually leading, with the stakes real." },
      { text: "Let it end naturally when your team moves on.", reflection: "Honest about your limits, but treats the community's momentum as belonging to your project instead of to them." },
      { text: "Document everything for a future team to restart later.", reflection: "Useful insurance, but documentation without a live handoff often becomes an archive nobody reopens." },
    ] },
];

const CB_START = { education: 50, health: 50, environment: 50, women: 50, youth: 50, cooperation: 50, selfReliance: 50 };

const CB_INTERVENTIONS = [
  { id: "solar", label: "Solar energy project", principle: "Swadeshi", sdg: 13, deltas: { environment: 16, selfReliance: 10, education: -3 } },
  { id: "health", label: "Health awareness campaign", principle: "Sarvodaya", sdg: 3, deltas: { health: 15, women: 5, education: -2 } },
  { id: "skills", label: "Skill development workshops", principle: "Dignity of Labour", sdg: 5, deltas: { women: 13, selfReliance: 7, education: 4, cooperation: -3 } },
  { id: "club", label: "Youth club formation", principle: "Gram Swaraj", sdg: 4, deltas: { youth: 15, cooperation: 7, education: 3, selfReliance: -2 } },
  { id: "waste", label: "Waste management initiative", principle: "Trusteeship", sdg: 15, deltas: { environment: 11, health: 5, cooperation: 3, education: -2 } },
  { id: "trees", label: "Tree planting drive", principle: "Trusteeship", sdg: 15, deltas: { environment: 13, health: 3, youth: 3, selfReliance: -2 } },
  { id: "learning", label: "Community learning circles", principle: "Nai Talim", sdg: 4, deltas: { education: 15, cooperation: 5, youth: 3, health: -2 } },
  { id: "entrepreneurship", label: "Women's entrepreneurship support", principle: "Sarvodaya", sdg: 5, deltas: { women: 15, selfReliance: 8, education: 2, cooperation: -3 } },
  { id: "coop", label: "Local resource cooperative", principle: "Gram Swaraj", sdg: 17, deltas: { selfReliance: 15, cooperation: 8, environment: 3, education: -3 } },
];

const CB_LABELS = { education: "Education", health: "Health", environment: "Environment", women: "Women's participation", youth: "Youth leadership", cooperation: "Community cooperation", selfReliance: "Local self-reliance" };

const PLEDGE_OPTIONS = [
  { id: "consumption", text: "I will reduce unnecessary consumption" },
  { id: "time", text: "I will contribute time to my community" },
  { id: "inclusion", text: "I will support inclusion" },
  { id: "peace", text: "I will practise peaceful conflict resolution" },
  { id: "environment", text: "I will support environmental action" },
  { id: "learning", text: "I will help someone learn" },
  { id: "local", text: "I will participate in local youth or community activity" },
];

const CHALLENGE_ACTIVITIES = [
  "Reduce unnecessary consumption today", "Avoid single-use plastic today", "Help someone learn something",
  "Resolve a disagreement peacefully", "Volunteer locally, even briefly", "Clean a shared community space",
  "Support someone's skill or craft", "Plant or care for a tree", "Spend time understanding another perspective",
  "Take part in a youth or community activity",
];

const YOUTH_TOOLKIT = [
  { q: "Why youth clubs matter", a: "A club turns scattered good intentions into a standing group that can actually follow through — on a cleanup, a survey, a campaign — because the people and the meeting time already exist." },
  { q: "How to start", a: "Pick one problem, one meeting time, and invite five people directly instead of posting an open call. A specific ask gets a specific yes." },
  { q: "How many people do you need?", a: "Three to five committed people who show up is worth more than twenty names on a list who don't. Start small and let it grow from actual activity." },
  { q: "First meeting guide", a: "Keep it under 45 minutes: introductions, the one problem you're focused on, one small action everyone can do before the next meeting, and when you'll meet again." },
  { q: "First 5 activities", a: "A local cleanup, a short survey of ten neighbours, a skills exchange, a shared read-and-discuss on a local issue, and a visit to whoever locally handles the problem you picked." },
  { q: "How to identify a local problem", a: "Ask ten people the same open question — 'what's one thing that could be better around here?' — and look for what repeats, not what's loudest." },
  { q: "How to collect basic data", a: "A ten-question survey, asked in person, of at least 20–30 people, is enough to spot a real pattern. Write down exact answers before you interpret them." },
  { q: "How to design a small intervention", a: "Match the size of your fix to the size of your group. One small, finishable action beats one ambitious plan that stalls halfway." },
  { q: "How to measure impact", a: "Decide what you'll count before you start, not after. A before-and-after number, even a rough one, is worth more than a description." },
  { q: "How to document outcomes", a: "Keep a simple running log: what you tried, what changed, what didn't. Future you — or the next club — will need it more than you think." },
];

const SOURCES = {
  primary: ["Our own field surveys and conversations, once logged in the central data file.", "School records on the energy and environmental work described in Our Journey."],
  secondary: ["Gandhi Heritage Portal — gandhiheritageportal.org (Sabarmati Ashram Preservation and Memorial Trust)", "UN Sustainable Development Goals — sdgs.un.org", "Central Electricity Authority, CO₂ Baseline Database for the Indian Power Sector (used for the Solar Calculator's emissions assumption)"],
  interpretation: ["Modern interpretations of Gandhian concepts on this site are our own reading, written for a 2026 audience, not verbatim translations of Gandhi's writing."],
};

/* =========================================================================
   HOOKS
   ========================================================================= */

function useInView(threshold = 0.25) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") { setInView(true); return; }
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function useCountUp(target, active, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active || target == null) return;
    let raf; let start = null;
    const step = (ts) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setValue(Math.round(progress * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => raf && cancelAnimationFrame(raf);
  }, [active, target, duration]);
  return value;
}

function useCloudState(key, initialValue, shared) {
  const [value, setValue] = useState(initialValue);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await window.storage.get(key, shared);
        if (!cancelled && res && res.value != null) setValue(JSON.parse(res.value));
      } catch (e) {
        // no stored value yet — keep the initial value
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, shared]);

  const update = (updater) => {
    setValue((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      (async () => {
        try { await window.storage.set(key, JSON.stringify(next), shared); }
        catch (e) { console.error("storage write failed", e); }
      })();
      return next;
    });
  };

  return [value, update, ready];
}

/* =========================================================================
   GLOBAL STYLES
   ========================================================================= */

function GlobalStyles() {
  return (
    <style>{`
      .gft { background: var(--paper); color: var(--ink); font-family: 'Work Sans', system-ui, sans-serif; line-height: 1.55; }
      .gft, .gft *, .gft *::before, .gft *::after { box-sizing: border-box; }
      .gft {
        --paper: #F6F1E3; --sand: #E7DBBD; --card: #FBF8EF;
        --ink: #201D18; --ink-soft: #5C5648; --ink-faint: #948C78;
        --line: rgba(32,29,24,0.16); --line-soft: rgba(32,29,24,0.09);
        --moss: #3E5A3B; --moss-deep: #2B4028; --moss-pale: #E2E9D9;
        --indigo: #2D3555; --indigo-deep: #1F2440; --indigo-pale: #E2E4EF;
        --saffron: #BC7E33; --saffron-pale: #F0DFC0; --white: #FFFEFA;
      }
      .gft-serif { font-family: 'Fraunces', Georgia, serif; }
      .gft h1, .gft h2, .gft h3 { font-family: 'Fraunces', Georgia, serif; font-weight: 500; letter-spacing: -0.01em; margin: 0; }
      .gft p { margin: 0; }
      .gft a { color: inherit; }
      .gft button { font-family: inherit; cursor: pointer; }
      .gft-container { max-width: 1120px; margin: 0 auto; padding: 0 20px; }
      @media (min-width: 768px) { .gft-container { padding: 0 40px; } }
      .gft-section { padding: 64px 0; }
      @media (min-width: 768px) { .gft-section { padding: 96px 0; } }

      .gft button:focus-visible, .gft a:focus-visible, .gft [tabindex]:focus-visible, .gft input:focus-visible {
        outline: 2px solid var(--moss); outline-offset: 3px; border-radius: 2px;
      }

      .btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 22px; font-size: 15px; font-weight: 600; border-radius: 3px; border: 1px solid transparent; transition: background .18s ease, color .18s ease, border-color .18s ease; }
      .btn-primary { background: var(--moss); color: var(--white); }
      .btn-primary:hover { background: var(--moss-deep); }
      .btn-secondary { border-color: var(--ink); background: transparent; color: var(--ink); }
      .btn-secondary:hover { background: var(--ink); color: var(--white); }
      .btn-ghost { background: transparent; color: var(--ink-soft); padding: 8px 4px; border-radius: 0; border: none; border-bottom: 1px solid var(--line); }
      .btn-ghost:hover { color: var(--ink); border-color: var(--ink); }
      .btn-indigo { background: var(--indigo); color: var(--white); }
      .btn-indigo:hover { background: var(--indigo-deep); }
      .btn[disabled] { opacity: 0.45; cursor: not-allowed; }

      .card-flat { background: var(--card); border: 1px solid var(--line); padding: 28px; }
      .card-tool { background: var(--white); border: 1px solid var(--line-soft); border-radius: 16px; padding: 28px; box-shadow: 0 1px 2px rgba(32,29,24,.05), 0 8px 24px rgba(32,29,24,.05); }

      .tag { display: inline-flex; align-items: center; gap: 5px; padding: 3px 11px; border-radius: 999px; font-size: 12.5px; font-weight: 600; border: 1px solid var(--line); }
      .tag-core { background: var(--moss-pale); color: var(--moss-deep); border-color: transparent; }
      .tag-additional { background: var(--indigo-pale); color: var(--indigo-deep); border-color: transparent; }
      .tag-muted { background: transparent; color: var(--ink-faint); }

      .nav-link { padding: 6px 2px; font-size: 14.5px; color: var(--ink-soft); border-bottom: 2px solid transparent; white-space: nowrap; }
      .nav-link:hover { color: var(--ink); }
      .nav-link.active { color: var(--ink); border-color: var(--moss); }

      .divider { height: 1px; background: var(--line); width: 100%; border: none; margin: 0; }
      .vline { width: 2px; background: var(--line); }
      .vline-fill { width: 2px; background: var(--moss); transition: height 1.1s ease; }

      .reveal { opacity: 0; transform: translateY(14px); transition: opacity .7s ease, transform .7s ease; }
      .reveal.in { opacity: 1; transform: translateY(0); }

      .impact-stat-value { font-size: 40px; line-height: 1; }
      @media (min-width: 768px) { .impact-stat-value { font-size: 48px; } }
      .impact-stat-label { font-size: 13.5px; color: var(--ink-soft); margin-top: 8px; }
      .impact-stat-pending { font-size: 11.5px; color: var(--ink-faint); margin-top: 4px; font-style: italic; }

      .empty-dataset { display: flex; gap: 24px; align-items: flex-end; flex-wrap: wrap; }
      .empty-dataset-ghost { display: flex; align-items: flex-end; gap: 8px; height: 84px; min-width: 120px; }
      .empty-dataset-ghost span { display: block; width: 16px; background: var(--sand); border-radius: 3px 3px 0 0; opacity: .8; }
      .empty-dataset-text { flex: 1; min-width: 220px; }
      .empty-dataset-title { font-size: 19px; margin-bottom: 6px; }
      .empty-dataset-text p { color: var(--ink-soft); font-size: 14.5px; margin-top: 6px; }
      .empty-dataset-tag { font-size: 12.5px !important; color: var(--ink-faint) !important; font-style: italic; }

      .track { height: 6px; background: var(--sand); border-radius: 999px; overflow: hidden; }
      .track-fill { height: 100%; background: var(--moss); transition: width .5s ease; }

      .acc-item { border-bottom: 1px solid var(--line); }
      .acc-trigger { width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 18px 2px; background: none; border: none; text-align: left; font-size: 16px; font-weight: 600; color: var(--ink); }
      .acc-panel { padding: 0 2px 18px; color: var(--ink-soft); font-size: 15px; }

      .word-cycle-item { animation: gftFade 3.4s ease-in-out; }
      @keyframes gftFade { 0% { opacity: 0; transform: translateY(6px);} 12% { opacity: 1; transform: translateY(0);} 85% { opacity: 1; } 100% { opacity: 0; transform: translateY(-6px);} }

      .opt-btn { display: block; width: 100%; text-align: left; padding: 14px 16px; border: 1px solid var(--line); background: var(--white); border-radius: 8px; font-size: 15px; transition: border-color .15s ease, background .15s ease; }
      .opt-btn:hover { border-color: var(--ink-faint); }
      .opt-btn.selected { border-color: var(--moss); background: var(--moss-pale); }
      .opt-btn:disabled { opacity: 0.5; cursor: not-allowed; }

      .chip-toggle { display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; border: 1px solid var(--line); border-radius: 999px; font-size: 14.5px; background: var(--white); transition: all .15s ease; }
      .chip-toggle.on { background: var(--moss); border-color: var(--moss); color: var(--white); }
      .chip-toggle:disabled { opacity: 0.4; cursor: not-allowed; }

      .day-cell { aspect-ratio: 1; border: 1px solid var(--line); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 13px; background: var(--white); }
      .day-cell.done { background: var(--moss); color: var(--white); border-color: var(--moss); }
      .day-cell.locked { opacity: 0.4; cursor: not-allowed; }

      @media (prefers-reduced-motion: reduce) {
        .gft *, .gft *::before, .gft *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
      }
    `}</style>
  );
}

/* =========================================================================
   SHARED UI
   ========================================================================= */

const NAV_ITEMS = [
  { id: "home", label: "Home" }, { id: "ideas", label: "Gandhi's Ideas" }, { id: "sdgs", label: "Gandhi × SDGs" },
  { id: "journey", label: "Our Journey" }, { id: "data", label: "Our Data" }, { id: "interact", label: "Interact" },
  { id: "about", label: "About" },
];

function Nav({ page, setPage, onPresent }) {
  const [open, setOpen] = useState(false);
  const go = (id) => { setPage(id); setOpen(false); };
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(246,241,227,0.94)", backdropFilter: "blur(6px)", borderBottom: "1px solid var(--line)" }}>
      <div className="gft-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>
        <button onClick={() => go("home")} className="gft-serif" style={{ background: "none", border: "none", fontSize: 20, fontWeight: 600, padding: 0 }}>
          Gandhi for Tomorrow
        </button>
        <nav style={{ display: "none", gap: "clamp(14px, 1.6vw, 22px)", alignItems: "center" }} className="gft-desktop-nav">
          {NAV_ITEMS.map((item) => (
            <button key={item.id} onClick={() => go(item.id)} className={`nav-link ${page === item.id ? "active" : ""}`} style={{ background: "none", border: "none", borderBottom: page === item.id ? "2px solid var(--moss)" : "2px solid transparent" }}>
              {item.label}
            </button>
          ))}
          <button onClick={onPresent} className="nav-link" style={{ background: "none", border: "none" }} title="Open competition presentation mode">Present</button>
          <button onClick={() => go("action")} className="btn btn-primary" style={{ padding: "9px 18px", fontSize: 14 }}>Take Action</button>
        </nav>
        <button onClick={() => setOpen((o) => !o)} aria-label="Menu" style={{ background: "none", border: "none", display: "flex" }} className="gft-mobile-toggle">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {open && (
        <div style={{ borderTop: "1px solid var(--line)", background: "var(--paper)" }}>
          <div className="gft-container" style={{ display: "flex", flexDirection: "column", padding: "8px 20px 20px" }}>
            {NAV_ITEMS.map((item) => (
              <button key={item.id} onClick={() => go(item.id)} style={{ background: "none", border: "none", textAlign: "left", padding: "12px 0", fontSize: 16, color: page === item.id ? "var(--ink)" : "var(--ink-soft)", borderBottom: "1px solid var(--line-soft)" }}>
                {item.label}
              </button>
            ))}
            <button onClick={() => { setOpen(false); onPresent(); }} style={{ background: "none", border: "none", textAlign: "left", padding: "12px 0", fontSize: 16, color: "var(--ink-soft)" }}>Presentation mode</button>
            <button onClick={() => go("action")} className="btn btn-primary" style={{ marginTop: 12, justifyContent: "center" }}>Take Action</button>
          </div>
        </div>
      )}
      <style>{`@media (min-width:1100px){ .gft-desktop-nav{ display:flex !important; } .gft-mobile-toggle{ display:none !important; } }`}</style>
    </div>
  );
}

function Footer({ setPage }) {
  return (
    <footer style={{ borderTop: "1px solid var(--line)", background: "var(--sand)", marginTop: 40 }}>
      <div className="gft-container" style={{ padding: "56px 20px", display: "grid", gap: 32, gridTemplateColumns: "1fr" }}>
        <div style={{ display: "grid", gap: 32, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
          <div>
            <div className="gft-serif" style={{ fontSize: 19, marginBottom: 10 }}>Gandhi for Tomorrow</div>
            <p style={{ color: "var(--ink-soft)", fontSize: 14.5, maxWidth: 260 }}>Built by young people who believe ideas matter most when they become action.</p>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Project</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14.5, color: "var(--ink-soft)" }}>
              <button onClick={() => setPage("about")} style={{ background: "none", border: "none", textAlign: "left", padding: 0 }}>Methodology</button>
              <button onClick={() => setPage("about")} style={{ background: "none", border: "none", textAlign: "left", padding: 0 }}>Sources & references</button>
              <button onClick={() => setPage("about")} style={{ background: "none", border: "none", textAlign: "left", padding: 0 }}>Data integrity & ethics</button>
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Connect</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14.5, color: "var(--ink-soft)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><AtSign size={15} /> Instagram handle to be added</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Mail size={15} /> Contact email to be added</span>
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Aligned with</div>
            <p style={{ fontSize: 14.5, color: "var(--ink-soft)" }}>UN Sustainable Development Goals 3, 4, 5, 13, 15, 16 & 17. A student initiative inspired by Gandhian principles — not an official Gandhi, UN, or GYPF endorsement.</p>
          </div>
        </div>
        <div className="divider" />
        <p style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>Presented at the {projectData.meta.event}. Privacy: this site collects only what's needed for its interactive tools, and nothing beyond that.</p>
      </div>
    </footer>
  );
}

function PillTag({ tone = "muted", children, icon: Icon }) {
  return <span className={`tag tag-${tone}`}>{Icon && <Icon size={12} />}{children}</span>;
}

function SectionHeading({ eyebrow, title, sub, align = "left" }) {
  return (
    <div style={{ maxWidth: 720, textAlign: align, marginLeft: align === "center" ? "auto" : 0, marginRight: align === "center" ? "auto" : 0 }}>
      {eyebrow && <div style={{ fontSize: 13.5, color: "var(--moss)", fontWeight: 600, marginBottom: 10 }}>{eyebrow}</div>}
      <h2 className="gft-serif" style={{ fontSize: 32 }}>{title}</h2>
      {sub && <p style={{ marginTop: 14, fontSize: 16.5, color: "var(--ink-soft)" }}>{sub}</p>}
    </div>
  );
}

function EmptyDatasetCard({ title, description }) {
  return (
    <div className="card-flat empty-dataset">
      <div className="empty-dataset-ghost" aria-hidden="true">
        <span style={{ height: "40%" }}></span><span style={{ height: "68%" }}></span>
        <span style={{ height: "28%" }}></span><span style={{ height: "82%" }}></span>
        <span style={{ height: "52%" }}></span>
      </div>
      <div className="empty-dataset-text">
        <div className="gft-serif empty-dataset-title">{title}</div>
        <p>{description}</p>
        <p className="empty-dataset-tag">Illustrative placeholder — not real data. n = —</p>
      </div>
    </div>
  );
}

/* =========================================================================
   HOME PAGE
   ========================================================================= */

function WordCycleHero() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % WORD_PAIRS.length), 3400);
    return () => clearInterval(t);
  }, []);
  const pair = WORD_PAIRS[idx];
  return (
    <div style={{ borderLeft: "1px solid var(--line)", paddingLeft: 24, minWidth: 220 }}>
      <div style={{ fontSize: 12.5, color: "var(--ink-faint)", marginBottom: 10 }}>An old idea, translated</div>
      <div key={idx} className="word-cycle-item">
        <div className="gft-serif" style={{ fontSize: 26, color: "var(--ink-soft)" }}>{pair.old}</div>
        <div className="gft-serif" style={{ fontSize: 26, color: "var(--moss)", marginTop: 4 }}>{pair.now}</div>
      </div>
    </div>
  );
}

function ImpactStat({ stat }) {
  const [ref, inView] = useInView(0.5);
  const pending = stat.numeric == null;
  const count = useCountUp(pending ? 0 : stat.numeric, inView && !pending, 1100);
  return (
    <div ref={ref} style={{ padding: "20px 0" }}>
      <div className="impact-stat-value gft-serif">{pending ? "—" : `${count}${stat.suffix}`}</div>
      <div className="impact-stat-label">{stat.label}</div>
      {pending && <div className="impact-stat-pending">Data to be added</div>}
    </div>
  );
}

function QuestionFlow() {
  const [ref, inView] = useInView(0.2);
  return (
    <div ref={ref} style={{ display: "flex", gap: 28 }}>
      <div style={{ position: "relative", width: 2 }}>
        <div className="vline" style={{ position: "absolute", inset: 0 }} />
        <div className="vline-fill" style={{ position: "absolute", top: 0, left: 0, height: inView ? "100%" : "0%" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {QUESTION_FLOW.map((step) => (
          <div key={step} style={{ fontSize: 18 }} className="gft-serif">{step}</div>
        ))}
      </div>
    </div>
  );
}

function HomePage({ setPage }) {
  return (
    <div>
      <section className="gft-section" style={{ paddingTop: 56, paddingBottom: 56 }}>
        <div className="gft-container" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 40 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 40 }} className="gft-hero-grid">
            <div style={{ maxWidth: 640 }}>
              <h1 className="gft-serif" style={{ fontSize: 40, lineHeight: 1.14 }}>
                What if Gandhi's principles could help us build a better 2030?
              </h1>
              <p style={{ marginTop: 22, fontSize: 17, color: "var(--ink-soft)", maxWidth: 560 }}>
                We translated timeless ideas of responsibility, nonviolence, self-reliance, equality, service and community
                action into a student-led initiative connecting schools, villages, youth and the Sustainable Development Goals.
              </p>
              <div style={{ display: "flex", gap: 14, marginTop: 30, flexWrap: "wrap" }}>
                <button onClick={() => setPage("journey")} className="btn btn-primary">Explore the Journey</button>
                <button onClick={() => setPage("interact")} className="btn btn-secondary">Measure Your Impact</button>
              </div>
            </div>
            <WordCycleHero />
          </div>
        </div>
        <style>{`@media (min-width:860px){ .gft-hero-grid{ grid-template-columns: 1.3fr 0.9fr !important; align-items:center; } }`}</style>
      </section>

      <section style={{ borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", background: "var(--card)" }}>
        <div className="gft-container gft-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
          {IMPACT_STATS.map((s) => (
            <div key={s.key} className="gft-stat-cell" style={{ paddingRight: 16 }}>
              <ImpactStat stat={s} />
            </div>
          ))}
        </div>
        <div className="gft-container" style={{ paddingBottom: 24 }}>
          <button onClick={() => setPage("about")} className="btn-ghost" style={{ background: "none", fontSize: 13.5 }}>How we measured this</button>
        </div>
        <style>{`
          .gft-stat-cell { border-right: 1px solid var(--line); }
          .gft-stat-cell:nth-child(2n) { border-right: none; }
          @media (min-width:768px){
            .gft-stats-grid { grid-template-columns: repeat(4,1fr) !important; }
            .gft-stat-cell:nth-child(2n) { border-right: 1px solid var(--line); }
            .gft-stat-cell:last-child { border-right: none; }
          }
        `}</style>
      </section>

      <section className="gft-section">
        <div className="gft-container">
          <SectionHeading title="Can an idea from the past help us solve problems of the present?" sub="We began by asking how Gandhian principles could be translated into practical community action." />
          <div style={{ marginTop: 44 }}>
            <QuestionFlow />
          </div>
        </div>
      </section>

      <section className="gft-section" style={{ background: "var(--sand)" }}>
        <div className="gft-container">
          <SectionHeading title="Why this is different" />
          <div style={{ marginTop: 32, display: "grid", gap: 1, gridTemplateColumns: "1fr", background: "var(--line)" }} className="gft-why-grid">
            {WHY_DIFFERENT.map((w) => (
              <div key={w.title} style={{ background: "var(--paper)", padding: 24 }}>
                <div style={{ fontWeight: 600, fontSize: 15.5 }}>{w.title}</div>
                <p style={{ marginTop: 8, fontSize: 14.5, color: "var(--ink-soft)" }}>{w.body}</p>
              </div>
            ))}
          </div>
          <style>{`@media (min-width:700px){ .gft-why-grid{ grid-template-columns: repeat(3,1fr) !important; } }`}</style>
        </div>
      </section>

      <section className="gft-section" style={{ textAlign: "center" }}>
        <div className="gft-container">
          <h2 className="gft-serif" style={{ fontSize: 34, maxWidth: 620, margin: "0 auto" }}>The future does not arrive. We build it.</h2>
          <p style={{ marginTop: 16, fontSize: 17, color: "var(--ink-soft)" }}>Which principle will you put into action?</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 28, flexWrap: "wrap" }}>
            <button onClick={() => setPage("ideas")} className="btn btn-secondary">Explore</button>
            <button onClick={() => setPage("interact")} className="btn btn-secondary">Measure Your Impact</button>
            <button onClick={() => setPage("action")} className="btn btn-primary">Take Action</button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* =========================================================================
   IDEAS PAGE
   ========================================================================= */

function PrincipleModal({ p, onClose }) {
  const [selected, setSelected] = useState(null);
  useEffect(() => { setSelected(null); }, [p]);
  if (!p) return null;
  return (
    <div role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, background: "rgba(32,29,24,0.5)", zIndex: 60, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--white)", width: "100%", maxWidth: 720, maxHeight: "88vh", overflowY: "auto", borderRadius: "18px 18px 0 0", padding: "28px 28px 40px" }} className="gft">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div className="gft-serif" style={{ fontSize: 15, color: "var(--ink-faint)" }}>{p.translation}</div>
            <h3 className="gft-serif" style={{ fontSize: 30, marginTop: 2 }}>{p.sanskrit}</h3>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none" }}><X size={22} /></button>
        </div>
        <p style={{ marginTop: 18, fontSize: 15.5 }}>{p.idea}</p>
        <div className="divider" style={{ margin: "22px 0" }} />
        <div className="gft-serif" style={{ fontSize: 13, color: "var(--moss)", marginBottom: 8, fontWeight: 600 }}>A scenario</div>
        <p style={{ fontSize: 16, fontWeight: 500 }}>{p.scenario.prompt}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
          {p.scenario.options.map((opt, i) => (
            <button key={i} className={`opt-btn ${selected === i ? "selected" : ""}`} onClick={() => setSelected(i)}>
              {opt.text}
            </button>
          ))}
        </div>
        {selected !== null && (
          <div style={{ marginTop: 16, padding: 16, background: "var(--moss-pale)", borderRadius: 8, fontSize: 14.5, color: "var(--moss-deep)" }}>
            {p.scenario.options[selected].reflection}
          </div>
        )}
      </div>
    </div>
  );
}

function IdeasPage() {
  const [open, setOpen] = useState(null);
  return (
    <div className="gft-section">
      <div className="gft-container">
        <SectionHeading eyebrow="Major Gandhian concepts relevant to this project" title="Gandhi's ideas, translated for today" sub="This isn't every Gandhian teaching — it's the set that shaped how we approached this work. Open any card for a short scenario that tests it against a real situation." />
        <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "1fr", gap: 20 }} className="gft-principle-grid">
          {PRINCIPLES.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.id} className="card-flat" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Icon size={22} color="var(--moss)" />
                <div>
                  <div className="gft-serif" style={{ fontSize: 22 }}>{p.sanskrit}</div>
                  <div style={{ fontSize: 13.5, color: "var(--ink-faint)" }}>{p.translation}</div>
                </div>
                <p style={{ fontSize: 14.5, color: "var(--ink-soft)" }}>{p.idea}</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {p.sdgs.map((n) => <PillTag key={n} tone="muted">SDG {n}</PillTag>)}
                </div>
                <button onClick={() => setOpen(p)} className="btn-ghost" style={{ background: "none", alignSelf: "flex-start", marginTop: 4 }}>Explore principle</button>
              </div>
            );
          })}
        </div>
        <style>{`@media (min-width:640px){ .gft-principle-grid{ grid-template-columns: repeat(2,1fr) !important; } } @media (min-width:1000px){ .gft-principle-grid{ grid-template-columns: repeat(3,1fr) !important; } }`}</style>
      </div>
      <PrincipleModal p={open} onClose={() => setOpen(null)} />
    </div>
  );
}

/* =========================================================================
   SDG PAGE
   ========================================================================= */

function SdgPage() {
  const [selected, setSelected] = useState(4);
  const detail = SDG_DETAILS[selected];
  const principle = useMemo(() => PRINCIPLES.find((p) => p.id === detail?.principle), [detail]);
  return (
    <div className="gft-section">
      <div className="gft-container">
        <SectionHeading eyebrow="Areas addressed by our initiative" title="Gandhi × the Sustainable Development Goals" sub="We haven't achieved all seventeen goals — no student project could. These are the ones our fieldwork actually touches, and how." />
        <div style={{ marginTop: 32, display: "flex", gap: 18, flexWrap: "wrap" }}>
          <PillTag tone="core" icon={Flag}>Core focus: {SDG_CORE.join(", ")}</PillTag>
          <PillTag tone="additional" icon={Compass}>Additional: {SDG_ADDITIONAL.join(", ")}</PillTag>
        </div>
        <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }} className="gft-sdg-grid">
          {SDG_ALL.map((s) => {
            const isCore = SDG_CORE.includes(s.n);
            const isAdd = SDG_ADDITIONAL.includes(s.n);
            const active = isCore || isAdd;
            return (
              <button
                key={s.n}
                onClick={() => active && setSelected(s.n)}
                disabled={!active}
                className="card-flat"
                style={{
                  textAlign: "left", padding: 14, cursor: active ? "pointer" : "default",
                  opacity: active ? 1 : 0.4,
                  borderColor: selected === s.n ? "var(--moss)" : "var(--line)",
                  background: selected === s.n ? "var(--moss-pale)" : "var(--card)",
                }}
              >
                <div className="gft-serif" style={{ fontSize: 20 }}>{s.n}</div>
                <div style={{ fontSize: 12, marginTop: 4, color: "var(--ink-soft)", overflowWrap: "anywhere" }}>{s.name}</div>
              </button>
            );
          })}
        </div>
        <style>{`@media (min-width:480px){ .gft-sdg-grid{ grid-template-columns: repeat(3, minmax(0, 1fr)) !important; } } @media (min-width:700px){ .gft-sdg-grid{ grid-template-columns: repeat(6,1fr) !important; } } @media (min-width:980px){ .gft-sdg-grid{ grid-template-columns: repeat(9,1fr) !important; } }`}</style>

        {detail && (
          <div className="card-tool" style={{ marginTop: 36 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "baseline", flexWrap: "wrap" }}>
              <div className="gft-serif" style={{ fontSize: 24 }}>SDG {selected}</div>
              <div style={{ fontSize: 16, color: "var(--ink-soft)" }}>{SDG_ALL.find((s) => s.n === selected)?.name}</div>
              {SDG_CORE.includes(selected) ? <PillTag tone="core">Core focus</PillTag> : <PillTag tone="additional">Additional area</PillTag>}
            </div>
            <div style={{ marginTop: 22, display: "grid", gap: 18, gridTemplateColumns: "1fr" }} className="gft-sdg-detail-grid">
              <div><div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--moss)" }}>Gandhian connection</div><p style={{ marginTop: 6, fontSize: 14.5 }}>{detail.connection}</p></div>
              <div><div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--moss)" }}>The problem</div><p style={{ marginTop: 6, fontSize: 14.5 }}>{detail.problem}</p></div>
              <div><div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--moss)" }}>What our team did</div><p style={{ marginTop: 6, fontSize: 14.5 }}>{detail.action}</p></div>
              <div><div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--moss)" }}>Evidence</div><p style={{ marginTop: 6, fontSize: 14.5 }}>{detail.evidence}</p></div>
              <div><div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--moss)" }}>Next step</div><p style={{ marginTop: 6, fontSize: 14.5 }}>{detail.next}</p></div>
            </div>
            <style>{`@media (min-width:700px){ .gft-sdg-detail-grid{ grid-template-columns: repeat(2,1fr) !important; } }`}</style>
            {principle && <p style={{ marginTop: 20, fontSize: 13, color: "var(--ink-faint)" }}>Connected principle: {principle.sanskrit} ({principle.translation})</p>}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   JOURNEY PAGE
   ========================================================================= */

function JourneyStep({ step, isLast }) {
  const [ref, inView] = useInView(0.35);
  return (
    <div ref={ref} className={`reveal ${inView ? "in" : ""}`} style={{ display: "flex", gap: 20, paddingBottom: isLast ? 0 : 36 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div className="gft-serif" style={{ fontSize: 14, color: "var(--moss)", fontWeight: 600 }}>{step.n}</div>
        {!isLast && <div className="vline" style={{ flex: 1, marginTop: 8 }} />}
      </div>
      <div style={{ paddingBottom: 8 }}>
        <div className="gft-serif" style={{ fontSize: 21 }}>{step.title}</div>
        <p style={{ marginTop: 6, fontSize: 15, color: "var(--ink-soft)", maxWidth: 520 }}>{step.body}</p>
      </div>
    </div>
  );
}

function JourneyPage() {
  return (
    <div className="gft-section">
      <div className="gft-container">
        <SectionHeading title="From one school to a wider community" sub="Our project moved outward in stages. Here's the order it actually happened in." />
        <div style={{ marginTop: 44, maxWidth: 620 }}>
          {JOURNEY_STEPS.map((s, i) => <JourneyStep key={s.n} step={s} isLast={i === JOURNEY_STEPS.length - 1} />)}
        </div>
      </div>

      <div className="gft-container" style={{ marginTop: 80 }}>
        <div className="divider" style={{ marginBottom: 64 }} />
        <SectionHeading title="From Gandhi to 2030" sub="History gave us principles. Our generation decides what we do with them." />
        <div style={{ marginTop: 36, display: "grid", gridTemplateColumns: "1fr", gap: 0 }} className="gft-gtimeline">
          {GANDHI_TIMELINE.map((t, i) => (
            <div key={t.year} style={{ display: "flex", gap: 16, padding: "14px 0", borderTop: i === 0 ? "1px solid var(--line)" : "none", borderBottom: "1px solid var(--line)" }}>
              <div className="gft-serif" style={{ fontSize: 17, width: 60, flexShrink: 0, color: "var(--moss)" }}>{t.year}</div>
              <div style={{ fontSize: 14.5, color: "var(--ink-soft)" }}>{t.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmploymentChart() {
  const d = projectData.data.employment;
  const dem = projectData.data.demographics;
  const chartData = [
    { group: "Total", rate: d.total.rate, color: "#3E5A3B" },
    { group: "Male", rate: d.male.rate, color: "#2D3555" },
    { group: "Female", rate: d.female.rate, color: "#BC7E33" },
  ];
  return (
    <div className="card-flat">
      <div className="gft-serif" style={{ fontSize: 19 }}>Employment, by gender</div>
      <p style={{ marginTop: 6, fontSize: 13, color: "var(--ink-faint)" }}>n = {d.n} ({dem.male} men, {dem.female} women)</p>
      <div style={{ height: 220, marginTop: 14 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--line-soft)" />
            <XAxis dataKey="group" tick={{ fontSize: 12, fill: "var(--ink-soft)" }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
            <Tooltip formatter={(v) => [`${v}%`, "Employment rate"]} />
            <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
              {chartData.map((entry) => <Cell key={entry.group} fill={entry.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p style={{ marginTop: 10, fontSize: 13.5, color: "var(--ink-soft)" }}>Men in the surveyed population reported employment at roughly {Math.round(d.male.rate / d.female.rate)} times the rate of women ({d.male.rate}% vs {d.female.rate}%).</p>
    </div>
  );
}

function SkillsFinding() {
  const s = projectData.data.skills;
  const otherCount = s.withSkill - s.topSkill.count;
  const otherShare = Math.round((otherCount / s.withSkill) * 1000) / 10;
  return (
    <div className="card-flat">
      <div className="gft-serif" style={{ fontSize: 19 }}>What skills exist in the community?</div>
      <p style={{ marginTop: 6, fontSize: 13, color: "var(--ink-faint)" }}>n = {s.n} — {s.withSkill} ({s.withSkillRate}%) reported having a skill, including {s.womenWithSkill} women.</p>
      <div style={{ marginTop: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
          <span>{s.topSkill.name}</span>
          <span style={{ color: "var(--ink-faint)" }}>{s.topSkill.count} people — {s.topSkill.shareOfSkilled}%</span>
        </div>
        <div className="track" style={{ marginTop: 6 }}><div className="track-fill" style={{ width: `${s.topSkill.shareOfSkilled}%` }} /></div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginTop: 14 }}>
          <span>Other skills</span>
          <span style={{ color: "var(--ink-faint)" }}>{otherCount} people — {otherShare}%</span>
        </div>
        <div className="track" style={{ marginTop: 6 }}><div className="track-fill" style={{ width: `${otherShare}%`, background: "var(--sand)" }} /></div>
        <p style={{ marginTop: 10, fontSize: 12.5, color: "var(--ink-faint)", fontStyle: "italic" }}>Categories beyond {s.topSkill.name.toLowerCase()} not yet broken down — to be added.</p>
      </div>
    </div>
  );
}

/* =========================================================================
   OUR DATA PAGE
   ========================================================================= */

function DataPage({ setPage }) {
  return (
    <div className="gft-section">
      <div className="gft-container">
        <SectionHeading eyebrow="Listening before acting" title="What we found" sub="We did not want to assume what communities needed. We went into communities, asked questions, listened to people, and used the findings to guide our actions." />

        <div style={{ marginTop: 36, display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[
            ["Respondents", projectData.methodology.respondentCount],
            ["Gender split", `${projectData.data.demographics.male} M / ${projectData.data.demographics.female} F`],
            ["Villages", projectData.methodology.villageCount],
            ["Students in field", projectData.methodology.studentsInField],
            ["Collection period", projectData.methodology.collectionPeriod],
          ].map(([label, val]) => (
            <div key={label} className="card-flat" style={{ padding: "14px 18px" }}>
              <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>{label}</div>
              <div className="gft-serif" style={{ fontSize: 20, marginTop: 2 }}>{val || "—"}</div>
            </div>
          ))}
        </div>
        <button onClick={() => setPage("about")} className="btn-ghost" style={{ background: "none", marginTop: 14, fontSize: 13.5 }}>See full methodology</button>

        <div style={{ marginTop: 56 }}>
          <h3 className="gft-serif" style={{ fontSize: 24 }}>The skills that often go unseen</h3>
          <p style={{ marginTop: 10, fontSize: 14.5, color: "var(--ink-soft)", maxWidth: 620 }}>Women & professions — how many respondents reported a profession, a specific skill, and whether that skill is currently in professional use.</p>
          <div style={{ marginTop: 18 }}>
            <EmploymentChart />
          </div>
        </div>

        <div style={{ marginTop: 40 }}>
          <div style={{ marginTop: 18 }}>
            <SkillsFinding />
          </div>
          <div className="card-flat" style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>From finding to action</div>
            <p style={{ marginTop: 8, fontSize: 14.5, color: "var(--ink-soft)" }}>Among women who reported knowing how to stitch, only 1 in 5 (20%) said they currently put that skill to professional use. We're treating this as the starting point for the skill-to-income pathways this project is working toward — not a problem already solved.</p>
          </div>
        </div>

        <div style={{ marginTop: 40 }}>
          <h3 className="gft-serif" style={{ fontSize: 24 }}>Barriers to participation</h3>
          <div style={{ marginTop: 18 }}>
            <EmptyDatasetCard title="Barriers" description="Only barrier categories actually asked about in the survey will be shown here — for example, limited opportunities, family responsibilities, or lack of training." />
          </div>
          <p style={{ marginTop: 12, fontSize: 14, color: "var(--ink-soft)", fontStyle: "italic" }}>A statistic is not the end of the story. The next question is what action can respond to it.</p>
        </div>

        <div style={{ marginTop: 40 }}>
          <h3 className="gft-serif" style={{ fontSize: 24 }}>Youth</h3>
          <p style={{ marginTop: 10, fontSize: 14.5, color: "var(--ink-soft)" }}>50+ students carried out this research. This panel tracks community-side youth indicators separately, once logged — we don't count our own researchers as community beneficiaries.</p>
          <div style={{ marginTop: 18 }}>
            <EmptyDatasetCard title="Youth indicators" description="Participation, SDG awareness, leadership experience and interest in youth clubs will appear here once measured in the community." />
          </div>
        </div>

        <div style={{ marginTop: 40 }}>
          <h3 className="gft-serif" style={{ fontSize: 24 }}>Environment</h3>
          <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr", gap: 1, background: "var(--line)" }} className="gft-env-grid">
            <div style={{ background: "var(--card)", padding: 20 }}>
              <div style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>BEFORE</div>
              <p style={{ marginTop: 8, fontSize: 14.5 }}>Data to be added — baseline energy use.</p>
            </div>
            <div style={{ background: "var(--card)", padding: 20 }}>
              <div style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>INTERVENTION</div>
              <p style={{ marginTop: 8, fontSize: 14.5 }}>Solar / renewable energy work and more environmentally responsible practices completed at our school.</p>
            </div>
            <div style={{ background: "var(--card)", padding: 20 }}>
              <div style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>AFTER</div>
              <p style={{ marginTop: 8, fontSize: 14.5 }}>Measurement pending.</p>
            </div>
          </div>
          <style>{`@media (min-width:700px){ .gft-env-grid{ grid-template-columns: repeat(3,1fr) !important; } }`}</style>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   INTERACT PAGE — Action Profile / Solar Calculator / Decision Lab / Community Builder
   ========================================================================= */

function ActionProfileTool() {
  const [answers, setAnswers] = useState({});
  const answeredCount = Object.keys(answers).length;
  const showResult = answeredCount >= AP_QUESTIONS.length;

  const results = useMemo(() => {
    const totals = {}; const counts = {};
    AP_QUESTIONS.forEach((q) => {
      if (answers[q.id] == null) return;
      totals[q.dim] = (totals[q.dim] || 0) + answers[q.id];
      counts[q.dim] = (counts[q.dim] || 0) + 1;
    });
    return AP_DIMENSIONS.map((d) => ({
      dimension: d.label, key: d.key,
      score: counts[d.key] ? Math.round((totals[d.key] / (counts[d.key] * 4)) * 100) : 0,
    }));
  }, [answers]);

  const strongest = useMemo(() => results.reduce((a, b) => (b.score > a.score ? b : a), results[0]), [results]);
  const growth = useMemo(() => results.reduce((a, b) => (b.score < a.score ? b : a), results[0]), [results]);

  const reset = () => setAnswers({});

  if (showResult) {
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Sparkles size={18} color="var(--saffron)" />
          <div className="gft-serif" style={{ fontSize: 22 }}>Your Gandhian Action Profile</div>
        </div>
        <p style={{ marginTop: 6, fontSize: 13, color: "var(--ink-faint)", fontStyle: "italic" }}>An educational reflection tool inspired by Gandhian principles — not a scientifically validated measure of character or morality.</p>
        <div style={{ height: 300, marginTop: 20 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={results} outerRadius="72%">
              <PolarGrid stroke="var(--line)" />
              <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: "var(--ink-soft)" }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar dataKey="score" stroke="#3E5A3B" fill="#3E5A3B" fillOpacity={0.35} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 10 }} className="gft-ap-summary">
          <div className="card-flat">
            <div style={{ fontSize: 12.5, color: "var(--moss)", fontWeight: 600 }}>Your strongest area</div>
            <div className="gft-serif" style={{ fontSize: 19, marginTop: 4 }}>{strongest?.dimension}</div>
          </div>
          <div className="card-flat">
            <div style={{ fontSize: 12.5, color: "var(--indigo)", fontWeight: 600 }}>Your growth opportunity</div>
            <div className="gft-serif" style={{ fontSize: 19, marginTop: 4 }}>{growth?.dimension}</div>
          </div>
        </div>
        <style>{`@media (max-width:600px){ .gft-ap-summary{ grid-template-columns: 1fr !important; } }`}</style>
        <div style={{ marginTop: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 14.5 }}>Three things worth trying</div>
          <ul style={{ marginTop: 10, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
            {(AP_SUGGESTIONS[growth?.key] || []).map((s, i) => <li key={i} style={{ fontSize: 14.5, color: "var(--ink-soft)" }}>{s}</li>)}
          </ul>
        </div>
        <button onClick={reset} className="btn btn-secondary" style={{ marginTop: 22 }}><RotateCcw size={15} /> Try again</button>
      </div>
    );
  }

  const currentQ = AP_QUESTIONS[answeredCount];

  return (
    <div>
      <div className="gft-serif" style={{ fontSize: 22 }}>Gandhian Action Profile</div>
      <p style={{ marginTop: 6, fontSize: 14, color: "var(--ink-soft)" }}>How aligned are your everyday choices with Gandhian principles? Eleven quick questions.</p>
      <div className="track" style={{ marginTop: 18 }}><div className="track-fill" style={{ width: `${(answeredCount / AP_QUESTIONS.length) * 100}%` }} /></div>
      <p style={{ marginTop: 20, fontSize: 17, fontWeight: 500 }}>{currentQ.text}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
        {currentQ.options.map((opt, i) => (
          <button key={i} className="opt-btn" onClick={() => setAnswers((a) => ({ ...a, [currentQ.id]: opt.score }))}>{opt.text}</button>
        ))}
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange, step = 1, suffix }) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input type="number" min={0} value={value} step={step}
          onChange={(e) => { const v = e.target.value; onChange(v === "" ? "" : Math.max(0, parseFloat(v) || 0)); }}
          style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 6, fontSize: 15 }} />
        {suffix && <span style={{ fontSize: 13, color: "var(--ink-faint)" }}>{suffix}</span>}
      </div>
    </label>
  );
}

function SolarCalculatorTool() {
  const [panels, setPanels] = useState(10);
  const [panelKw, setPanelKw] = useState(0.4);
  const [sunHours, setSunHours] = useState(5);
  const [days, setDays] = useState(365);
  const [rate, setRate] = useState(7);
  const [showFormula, setShowFormula] = useState(false);

  const performanceRatio = 0.85;
  const emissionFactor = 0.71;

  const dailyEnergy = panels * panelKw * sunHours * performanceRatio;
  const annualEnergy = dailyEnergy * days;
  const annualValue = annualEnergy * rate;
  const co2Avoided = annualEnergy * emissionFactor;

  return (
    <div>
      <div className="gft-serif" style={{ fontSize: 22 }}>Solar & green energy calculator</div>
      <p style={{ marginTop: 6, fontSize: 13, color: "var(--ink-faint)", fontStyle: "italic" }}>This is an educational estimate, not an engineering or financial guarantee.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginTop: 20 }} className="gft-solar-grid">
        <NumberField label="Number of panels" value={panels} onChange={setPanels} />
        <NumberField label="Panel capacity" value={panelKw} onChange={setPanelKw} step={0.05} suffix="kW" />
        <NumberField label="Avg. effective sunlight hours / day" value={sunHours} onChange={setSunHours} step={0.5} />
        <NumberField label="Operating days / year" value={days} onChange={setDays} />
        <NumberField label="Electricity rate" value={rate} onChange={setRate} step={0.5} suffix="₹/kWh" />
      </div>
      <style>{`@media (min-width:640px){ .gft-solar-grid{ grid-template-columns: repeat(2,1fr) !important; } }`}</style>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 26 }} className="gft-solar-out">
        <div className="card-flat"><div style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>Estimated daily energy</div><div className="gft-serif" style={{ fontSize: 22, marginTop: 4 }}>{dailyEnergy.toFixed(1)} kWh</div></div>
        <div className="card-flat"><div style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>Estimated annual energy</div><div className="gft-serif" style={{ fontSize: 22, marginTop: 4 }}>{Math.round(annualEnergy).toLocaleString()} kWh</div></div>
        <div className="card-flat"><div style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>Estimated annual value</div><div className="gft-serif" style={{ fontSize: 22, marginTop: 4 }}>₹{Math.round(annualValue).toLocaleString()}</div></div>
        <div className="card-flat"><div style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>Estimated CO₂ avoided / yr</div><div className="gft-serif" style={{ fontSize: 22, marginTop: 4 }}>{(co2Avoided / 1000).toFixed(2)} t</div></div>
      </div>
      <style>{`@media (max-width:600px){ .gft-solar-out{ grid-template-columns: 1fr !important; } }`}</style>

      <button onClick={() => setShowFormula((s) => !s)} className="btn-ghost" style={{ background: "none", marginTop: 18 }}>
        {showFormula ? "Hide" : "How is this calculated?"}
      </button>
      {showFormula && (
        <div className="card-flat" style={{ marginTop: 12, fontSize: 13.5, color: "var(--ink-soft)", display: "flex", flexDirection: "column", gap: 8 }}>
          <p>Daily energy = panels × panel capacity (kW) × sunlight hours × 0.85 (a standard allowance for real-world system losses: inverter conversion, wiring, dust and heat).</p>
          <p>Annual energy = daily energy × operating days. Annual value = annual energy × your electricity rate.</p>
          <p>CO₂ avoided = annual energy × 0.71 kg CO₂/kWh — India's grid weighted-average emission factor per the Central Electricity Authority's CO₂ Baseline Database. This factor changes most years as more renewable energy joins the grid, so check the latest CEA release for the current figure.</p>
        </div>
      )}
    </div>
  );
}

function DecisionLabTool() {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const scenario = DECISION_SCENARIOS[idx];
  const next = () => { setIdx((i) => (i + 1) % DECISION_SCENARIOS.length); setSelected(null); };
  return (
    <div>
      <div className="gft-serif" style={{ fontSize: 22 }}>Gandhi Decision Lab</div>
      <p style={{ marginTop: 6, fontSize: 14, color: "var(--ink-soft)" }}>Scenario {idx + 1} of {DECISION_SCENARIOS.length} — {scenario.domain}</p>
      <p style={{ marginTop: 18, fontSize: 17, fontWeight: 500 }}>{scenario.prompt}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
        {scenario.options.map((opt, i) => (
          <button key={i} className={`opt-btn ${selected === i ? "selected" : ""}`} onClick={() => setSelected(i)}>{opt.text}</button>
        ))}
      </div>
      {selected !== null && (
        <div style={{ marginTop: 16, padding: 16, background: "var(--indigo-pale)", borderRadius: 8, fontSize: 14.5, color: "var(--indigo-deep)" }}>
          {scenario.options[selected].reflection}
        </div>
      )}
      <button onClick={next} className="btn btn-secondary" style={{ marginTop: 20 }}>Next scenario</button>
    </div>
  );
}

function CommunityBuilderTool() {
  const [chosen, setChosen] = useState([]);
  const [revealed, setRevealed] = useState(false);
  const maxPoints = 5;

  const toggle = (id) => {
    setRevealed(false);
    setChosen((c) => c.includes(id) ? c.filter((x) => x !== id) : c.length < maxPoints ? [...c, id] : c);
  };

  const finalScores = useMemo(() => {
    const s = { ...CB_START };
    chosen.forEach((id) => {
      const iv = CB_INTERVENTIONS.find((x) => x.id === id);
      Object.entries(iv.deltas).forEach(([k, v]) => { s[k] = Math.max(0, Math.min(100, s[k] + v)); });
    });
    return s;
  }, [chosen]);

  const chartData = Object.keys(CB_LABELS).map((k) => ({ name: CB_LABELS[k], before: CB_START[k], after: finalScores[k] }));
  const overall = Math.round(Object.values(finalScores).reduce((a, b) => a + b, 0) / Object.keys(finalScores).length);

  const tradeoff = useMemo(() => {
    if (!chosen.length) return null;
    const deltas = Object.keys(CB_LABELS).map((k) => ({ k, d: finalScores[k] - CB_START[k] }));
    const up = deltas.reduce((a, b) => (b.d > a.d ? b : a));
    const down = deltas.reduce((a, b) => (b.d < a.d ? b : a));
    if (up.d <= 0) return "Your choices didn't move any single dimension very far — a cautious, balanced spread.";
    if (down.d >= 0) return `Your ${CB_LABELS[up.k].toLowerCase()} score rose the most, with no major tradeoff elsewhere.`;
    return `Your ${CB_LABELS[up.k].toLowerCase()} score rose the most, but ${CB_LABELS[down.k].toLowerCase()} fell as a result.`;
  }, [chosen, finalScores]);

  const principlesActivated = [...new Set(chosen.map((id) => CB_INTERVENTIONS.find((x) => x.id === id).principle))];
  const sdgsTouched = [...new Set(chosen.map((id) => CB_INTERVENTIONS.find((x) => x.id === id).sdg))].sort((a, b) => a - b);

  const reset = () => { setChosen([]); setRevealed(false); };

  return (
    <div>
      <div className="gft-serif" style={{ fontSize: 22 }}>Community Builder</div>
      <p style={{ marginTop: 6, fontSize: 14, color: "var(--ink-soft)" }}>A simplified simulation, not a model of any real community. Pick up to {maxPoints} interventions — each one shifts more than one dimension.</p>
      <p style={{ marginTop: 4, fontSize: 13, color: "var(--ink-faint)" }}>{chosen.length} / {maxPoints} action points used</p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
        {CB_INTERVENTIONS.map((iv) => {
          const isOn = chosen.includes(iv.id);
          const capped = !isOn && chosen.length >= maxPoints;
          return (
            <button key={iv.id} onClick={() => toggle(iv.id)} disabled={capped} className={`chip-toggle ${isOn ? "on" : ""}`}>
              {isOn && <Check size={14} />} {iv.label}
            </button>
          );
        })}
      </div>

      <div style={{ height: 260, marginTop: 28 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--line-soft)" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--ink-soft)" }} interval={0} angle={-20} textAnchor="end" height={60} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="before" fill="#E7DBBD" name="Before" />
            <Bar dataKey="after" fill="#3E5A3B" name="After" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
        <button onClick={() => setRevealed(true)} className="btn btn-primary" disabled={!chosen.length}>Reveal outcome</button>
        <button onClick={reset} className="btn btn-secondary"><RotateCcw size={15} /> Try again</button>
      </div>

      {revealed && (
        <div className="card-flat" style={{ marginTop: 20 }}>
          <div className="gft-serif" style={{ fontSize: 20 }}>Community score: {overall}</div>
          <p style={{ marginTop: 10, fontSize: 14.5, color: "var(--ink-soft)" }}>{tradeoff}</p>
          <div style={{ marginTop: 14, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {principlesActivated.map((p) => <PillTag key={p} tone="core">{p}</PillTag>)}
            {sdgsTouched.map((s) => <PillTag key={s} tone="additional">SDG {s}</PillTag>)}
          </div>
          <p style={{ marginTop: 18, fontSize: 14.5, fontStyle: "italic" }}>Real communities are not multiple-choice problems. That's why we began by listening — see How We Know on the About page.</p>
        </div>
      )}
    </div>
  );
}

const INTERACT_TOOLS = [
  { id: "profile", label: "Gandhian Action Profile", desc: "A short reflection quiz on how your daily choices line up with Gandhian principles.", icon: Gauge, Comp: ActionProfileTool },
  { id: "solar", label: "Solar Calculator", desc: "Estimate the energy, savings and emissions avoided by a solar installation.", icon: Sun, Comp: SolarCalculatorTool },
  { id: "decision", label: "Gandhi Decision Lab", desc: "Real-world dilemmas with genuine tradeoffs — not obvious right answers.", icon: Scale, Comp: DecisionLabTool },
  { id: "community", label: "Community Builder", desc: "Simulate improving a community across seven dimensions with a limited budget.", icon: Landmark, Comp: CommunityBuilderTool },
];

function InteractPage() {
  const [active, setActive] = useState(null);
  if (active) {
    const tool = INTERACT_TOOLS.find((t) => t.id === active);
    return (
      <div className="gft-section">
        <div className="gft-container">
          <button onClick={() => setActive(null)} className="btn-ghost" style={{ background: "none" }}><ChevronLeft size={15} /> All tools</button>
          <div className="card-tool" style={{ marginTop: 20, maxWidth: 760 }}>
            <tool.Comp />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="gft-section">
      <div className="gft-container">
        <SectionHeading title="Interact" sub="Four tools we built so this project isn't just something you read — it's something you can try." />
        <div style={{ marginTop: 36, display: "grid", gridTemplateColumns: "1fr", gap: 18 }} className="gft-tool-grid">
          {INTERACT_TOOLS.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setActive(t.id)} className="card-tool" style={{ textAlign: "left" }}>
                <Icon size={24} color="var(--indigo)" />
                <div className="gft-serif" style={{ fontSize: 20, marginTop: 12 }}>{t.label}</div>
                <p style={{ marginTop: 8, fontSize: 14.5, color: "var(--ink-soft)" }}>{t.desc}</p>
              </button>
            );
          })}
        </div>
        <style>{`@media (min-width:700px){ .gft-tool-grid{ grid-template-columns: repeat(2,1fr) !important; } }`}</style>
      </div>
    </div>
  );
}

/* =========================================================================
   TAKE ACTION PAGE — Pledge / 30-Day Challenge / Youth Club / Replicate This
   ========================================================================= */

function PledgeBoard() {
  const [visitorId, setVisitorId] = useState(null);
  const [mine, setMine] = useState([]);
  const [counts, setCounts] = useState({});
  const [ready, setReady] = useState(false);

  const refreshCounts = async () => {
    try {
      const listRes = await window.storage.list("pledge-entry:", true);
      const keys = (listRes && listRes.keys) || [];
      const entries = await Promise.all(keys.map(async (k) => {
        try {
          const r = await window.storage.get(k, true);
          return r && r.value ? JSON.parse(r.value) : [];
        } catch (e) { return []; }
      }));
      const tally = {};
      entries.forEach((arr) => (arr || []).forEach((id) => { tally[id] = (tally[id] || 0) + 1; }));
      setCounts(tally);
    } catch (e) {
      // if listing fails, leave whatever counts are already showing rather than clearing them
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let id = null;
      try {
        const idRes = await window.storage.get("visitor-id", false);
        id = idRes && idRes.value ? idRes.value : null;
      } catch (e) { /* not set yet */ }
      if (!id) {
        id = (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : `v-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        try { await window.storage.set("visitor-id", id, false); } catch (e) { /* ignore */ }
      }
      if (cancelled) return;
      setVisitorId(id);

      let myPledges = [];
      try {
        const mineRes = await window.storage.get(`pledge-entry:${id}`, true);
        myPledges = mineRes && mineRes.value ? JSON.parse(mineRes.value) : [];
      } catch (e) { /* none yet */ }
      if (cancelled) return;
      setMine(myPledges);

      await refreshCounts();
      if (!cancelled) setReady(true);
    })();

    const poll = setInterval(refreshCounts, 15000);
    return () => { cancelled = true; clearInterval(poll); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (id) => {
    if (!ready || !visitorId) return;
    const has = mine.includes(id);
    const next = has ? mine.filter((x) => x !== id) : [...mine, id];
    setMine(next);
    setCounts((c) => ({ ...c, [id]: Math.max(0, (c[id] || 0) + (has ? -1 : 1)) }));
    (async () => {
      try { await window.storage.set(`pledge-entry:${visitorId}`, JSON.stringify(next), true); }
      catch (e) { console.error("pledge write failed", e); }
    })();
  };

  const resetMine = () => {
    if (!ready || !visitorId || mine.length === 0) return;
    setCounts((c) => {
      const next = { ...c };
      mine.forEach((id) => { next[id] = Math.max(0, (next[id] || 0) - 1); });
      return next;
    });
    setMine([]);
    (async () => {
      try { await window.storage.set(`pledge-entry:${visitorId}`, JSON.stringify([]), true); }
      catch (e) { console.error("pledge reset failed", e); }
    })();
  };

  return (
    <div>
      <div className="gft-serif" style={{ fontSize: 22 }}>What will you change?</div>
      <p style={{ marginTop: 8, fontSize: 14, color: "var(--ink-soft)" }}>These counts are shared across every visitor and refresh automatically while this page is open.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
        {PLEDGE_OPTIONS.map((p) => {
          const on = mine.includes(p.id);
          return (
            <button key={p.id} onClick={() => toggle(p.id)} disabled={!ready} className={`opt-btn ${on ? "selected" : ""}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{on && <Check size={14} style={{ marginRight: 8, verticalAlign: "middle" }} />}{p.text}</span>
              <span style={{ fontSize: 13, color: "var(--ink-faint)" }}>{ready ? (counts[p.id] || 0) : "…"}</span>
            </button>
          );
        })}
      </div>
      {mine.length > 0 && ready && (
        <button onClick={resetMine} disabled={!ready} className="btn-ghost" style={{ background: "none", marginTop: 16, fontSize: 13 }}>Reset my pledges</button>
      )}
    </div>
  );
}

function localDateStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function ThirtyDayChallengeTool() {
  const [progress, setProgress, ready] = useCloudState("challenge-progress", { started: false, days: [], lastCompletedDate: null }, false);
  const start = () => setProgress({ started: true, days: [], lastCompletedDate: null });
  const completeCount = progress.days.length;
  const nextDay = completeCount + 1;
  const today = localDateStr();
  const doneToday = progress.lastCompletedDate === today;

  const markNext = () => {
    const now = localDateStr();
    setProgress((p) => {
      const alreadyDoneToday = p.lastCompletedDate === now;
      const nd = p.days.length + 1;
      if (alreadyDoneToday || nd > 30) return { ...p };
      return { ...p, days: [...p.days, nd], lastCompletedDate: now };
    });
  };
  const undoLast = () => {
    const now = localDateStr();
    setProgress((p) => {
      const alreadyDoneToday = p.lastCompletedDate === now;
      if (!alreadyDoneToday || p.days.length === 0) return { ...p };
      return { ...p, days: p.days.slice(0, -1), lastCompletedDate: null };
    });
  };

  if (!ready) return <div style={{ fontSize: 14, color: "var(--ink-faint)" }}>Loading your progress…</div>;

  if (!progress.started) {
    return (
      <div>
        <div className="gft-serif" style={{ fontSize: 22 }}>The 30-day action challenge</div>
        <p style={{ marginTop: 10, fontSize: 14.5, color: "var(--ink-soft)" }}>Thirty small, Gandhian-inspired actions — one unlocks each day, in order. Your progress is saved.</p>
        <button onClick={start} className="btn btn-primary" style={{ marginTop: 16 }}>Start the challenge</button>
      </div>
    );
  }

  return (
    <div>
      <div className="gft-serif" style={{ fontSize: 22 }}>Your 30 days</div>
      <div className="track" style={{ marginTop: 14 }}><div className="track-fill" style={{ width: `${(completeCount / 30) * 100}%` }} /></div>
      <p style={{ marginTop: 8, fontSize: 13.5, color: "var(--ink-soft)" }}>{completeCount} of 30 days complete</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8, marginTop: 20 }}>
        {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => {
          const isDone = d <= completeCount;
          const isUndoable = d === completeCount && doneToday;
          const isNext = d === nextDay;
          const isLocked = !isDone && (!isNext || doneToday);
          const onClick = isUndoable ? undoLast : (isNext && !doneToday ? markNext : undefined);
          const activity = CHALLENGE_ACTIVITIES[(d - 1) % CHALLENGE_ACTIVITIES.length];
          let tip;
          if (isUndoable) tip = "Tap to undo today's entry";
          else if (isDone) tip = activity;
          else if (isNext && doneToday) tip = `You've already logged a day today — Day ${d} unlocks tomorrow`;
          else if (isNext) tip = activity;
          else tip = "Complete the days before this one first";
          return (
            <button key={d} onClick={onClick} disabled={!onClick} className={`day-cell ${isDone ? "done" : ""} ${isLocked ? "locked" : ""}`} title={tip}>
              {isDone ? <Check size={14} /> : d}
            </button>
          );
        })}
      </div>
      {completeCount < 30 && (
        <p style={{ marginTop: 16, fontSize: 13, color: "var(--ink-faint)" }}>
          {doneToday ? `You've logged today — Day ${nextDay} unlocks tomorrow.` : `Today: ${CHALLENGE_ACTIVITIES[(nextDay - 1) % CHALLENGE_ACTIVITIES.length]}`}
        </p>
      )}
      {completeCount >= 30 && (
        <div style={{ marginTop: 18, padding: 16, background: "var(--moss-pale)", borderRadius: 8, display: "flex", gap: 10, alignItems: "center" }}>
          <Award size={20} color="var(--moss-deep)" />
          <span style={{ fontSize: 14.5, color: "var(--moss-deep)" }}>30 days done. The habit is the actual outcome — consider starting again with someone else.</span>
        </div>
      )}
      <button onClick={() => setProgress({ started: false, days: [], lastCompletedDate: null })} className="btn-ghost" style={{ background: "none", marginTop: 16, fontSize: 13 }}>Reset my progress</button>
    </div>
  );
}

function YouthClubToolkit() {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <div>
      <div className="gft-serif" style={{ fontSize: 22 }}>Start where you are</div>
      <p style={{ marginTop: 8, fontSize: 14, color: "var(--ink-soft)" }}>A practical toolkit for starting a youth club, drawn from how we actually started ours.</p>
      <div style={{ marginTop: 16 }}>
        {YOUTH_TOOLKIT.map((item, i) => (
          <div key={item.q} className="acc-item">
            <button className="acc-trigger" onClick={() => setOpenIdx(openIdx === i ? null : i)}>
              {item.q}
              {openIdx === i ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
            {openIdx === i && <div className="acc-panel">{item.a}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function ReplicateThisTool() {
  const [where, setWhere] = useState("School");
  const [issue, setIssue] = useState("Environment");
  const [people, setPeople] = useState("A few friends (2–5)");
  const [showPath, setShowPath] = useState(false);

  const path = [
    { step: "Problem", text: `Name the specific issue within "${issue}" that people at your ${where.toLowerCase()} actually mention, not the one that sounds most impressive.` },
    { step: "Data", text: `With ${people.toLowerCase()}, run a short survey — even 15–20 conversations is enough to see a real pattern.` },
    { step: "Small intervention", text: "Design the smallest version of a response that your group can actually finish, not the biggest version you can imagine." },
    { step: "Partners", text: "Find one person already working on something adjacent — a teacher, a local leader, an existing club — and loop them in early." },
    { step: "Measure", text: "Decide what you'll count before you start, and check it again afterward, even roughly." },
    { step: "Document", text: "Write down what you tried and what changed, in plain language, as you go." },
    { step: "Scale", text: "Only once the small version works — hand it to more people, or repeat it somewhere else." },
  ];

  return (
    <div>
      <div className="gft-serif" style={{ fontSize: 22 }}>Take this model to your community</div>
      <p style={{ marginTop: 8, fontSize: 14, color: "var(--ink-soft)" }}>This generates an educational starting pathway, not a formal consultancy plan.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14, marginTop: 18 }} className="gft-replicate-grid">
        <label>
          <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 6 }}>Where are you?</div>
          <select value={where} onChange={(e) => setWhere(e.target.value)} style={{ width: "100%", padding: 10, border: "1px solid var(--line)", borderRadius: 6 }}>
            {["School", "Village", "Neighbourhood", "College"].map((o) => <option key={o}>{o}</option>)}
          </select>
        </label>
        <label>
          <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 6 }}>What issue concerns you most?</div>
          <select value={issue} onChange={(e) => setIssue(e.target.value)} style={{ width: "100%", padding: 10, border: "1px solid var(--line)", borderRadius: 6 }}>
            {["Environment", "Education", "Gender equality", "Health", "Community cooperation", "Local governance"].map((o) => <option key={o}>{o}</option>)}
          </select>
        </label>
        <label>
          <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 6 }}>How many people can help?</div>
          <select value={people} onChange={(e) => setPeople(e.target.value)} style={{ width: "100%", padding: 10, border: "1px solid var(--line)", borderRadius: 6 }}>
            {["Just me", "A few friends (2–5)", "A small group (6–15)", "A large team (15+)"].map((o) => <option key={o}>{o}</option>)}
          </select>
        </label>
      </div>
      <style>{`@media (min-width:640px){ .gft-replicate-grid{ grid-template-columns: repeat(3,1fr) !important; } }`}</style>
      <button onClick={() => setShowPath(true)} className="btn btn-primary" style={{ marginTop: 20 }}>Generate my pathway</button>
      {showPath && (
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 14 }}>
          {path.map((p, i) => (
            <div key={p.step} style={{ display: "flex", gap: 14 }}>
              <div className="gft-serif" style={{ fontSize: 13, color: "var(--moss)", width: 110, flexShrink: 0 }}>{p.step}</div>
              <p style={{ fontSize: 14.5, color: "var(--ink-soft)" }}>{p.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ActionPage() {
  const [tab, setTab] = useState("pledge");
  const TABS = [
    { id: "pledge", label: "Pledge", Comp: PledgeBoard },
    { id: "challenge", label: "30-Day Challenge", Comp: ThirtyDayChallengeTool },
    { id: "toolkit", label: "Start a Youth Club", Comp: YouthClubToolkit },
    { id: "replicate", label: "Replicate This", Comp: ReplicateThisTool },
  ];
  const Active = TABS.find((t) => t.id === tab).Comp;
  return (
    <div className="gft-section">
      <div className="gft-container">
        <SectionHeading title="Take action" sub="Four ways to move from reading this site to doing something." />
        <div style={{ display: "flex", gap: 8, marginTop: 30, flexWrap: "wrap" }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className="btn" style={{ background: tab === t.id ? "var(--ink)" : "var(--card)", color: tab === t.id ? "var(--white)" : "var(--ink)", border: "1px solid var(--line)", fontSize: 13.5, padding: "9px 16px" }}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="card-tool" style={{ marginTop: 24, maxWidth: 760 }}>
          <Active />
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   ABOUT PAGE
   ========================================================================= */

function MethodRow({ label, value }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "4px 20px", padding: "12px 0", borderBottom: "1px solid var(--line-soft)", fontSize: 14.5 }}>
      <span style={{ color: "var(--ink-soft)" }}>{label}</span>
      {value != null && value !== ""
        ? <span style={{ color: "var(--ink)", textAlign: "right", marginLeft: "auto" }}>{value}</span>
        : <span style={{ color: "var(--ink-faint)", fontStyle: "italic", marginLeft: "auto" }}>Data to be added</span>}
    </div>
  );
}

function AboutPage() {
  return (
    <div className="gft-section">
      <div className="gft-container">
        <SectionHeading title="About this initiative" sub="Gandhi for Tomorrow began as a question, not a conclusion: could ideas from 1869 actually help solve problems in 2026? We didn't want to answer that from a classroom, so we went into schools, villages and conversations, and let what we found shape what we did next." />

        <div style={{ marginTop: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ShieldCheck size={20} color="var(--moss)" />
            <h3 className="gft-serif" style={{ fontSize: 24 }}>How we know</h3>
          </div>
          <p style={{ marginTop: 10, fontSize: 14.5, color: "var(--ink-soft)", maxWidth: 640 }}>Here's how we actually collected and organised this data. Anything still marked "Data to be added" is genuinely pending, not a stand-in statistic.</p>
          <div style={{ marginTop: 18, maxWidth: 560 }}>
            {[
              ["Who collected the data", projectData.methodology.collectedBy],
              ["How many students were involved", projectData.methodology.studentsInField],
              ["How many villages", projectData.methodology.villageCount],
              ["How many respondents", projectData.methodology.respondentCount],
              ["What kind of survey was used", projectData.methodology.surveyType],
              ["Whether interviews or conversations were used", projectData.methodology.interviewsUsed],
              ["How responses were categorised", projectData.methodology.categorization],
            ].map(([l, v]) => <MethodRow key={l} label={l} value={v} />)}
          </div>
          <div className="card-flat" style={{ marginTop: 20, maxWidth: 640 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Limitations</div>
            <p style={{ marginTop: 8, fontSize: 14, color: "var(--ink-soft)" }}>This study reflects the communities included in our fieldwork and should not automatically be generalised to every rural community. Percentages may not total 100% where multiple responses were permitted.</p>
          </div>
        </div>

        <div style={{ marginTop: 56 }}>
          <h3 className="gft-serif" style={{ fontSize: 24 }}>Data integrity & ethics</h3>
          <ul style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr", gap: 10, paddingLeft: 18 }} className="gft-ethics-grid">
            {["No personally identifiable data", "No names without permission", "No exact household information", "No sensitive individual stories without permission", "No invented statistics", "No fabricated outcomes", "No unsupported claims", "No misleading percentages", "Every chart states its sample size"].map((r) => (
              <li key={r} style={{ fontSize: 14.5, color: "var(--ink-soft)" }}>{r}</li>
            ))}
          </ul>
          <style>{`@media (min-width:700px){ .gft-ethics-grid{ grid-template-columns: repeat(2,1fr) !important; } }`}</style>
        </div>

        <div style={{ marginTop: 56 }}>
          <h3 className="gft-serif" style={{ fontSize: 24 }}>50+ students, one community</h3>
          <p style={{ marginTop: 10, fontSize: 14.5, color: "var(--ink-soft)", maxWidth: 620 }}>The work was genuinely collaborative — organised loosely around these roles, not a single leader.</p>
          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }} className="gft-roles-grid">
            {["Research & surveys", "Community engagement", "Documentation", "Communications", "Data & analysis", "Design", "Environmental work", "Outreach"].map((r) => (
              <div key={r} className="card-flat" style={{ padding: "12px 16px", fontSize: 14, overflowWrap: "anywhere" }}>{r}</div>
            ))}
          </div>
          <style>{`@media (min-width:640px){ .gft-roles-grid{ grid-template-columns: repeat(4,1fr) !important; } }`}</style>
        </div>

        <div style={{ marginTop: 56 }}>
          <h3 className="gft-serif" style={{ fontSize: 24 }}>Sources & references</h3>
          {[["Primary data", SOURCES.primary], ["Secondary sources", SOURCES.secondary], ["Interpretation", SOURCES.interpretation]].map(([label, items]) => (
            <div key={label} style={{ marginTop: 20 }}>
              <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--moss)" }}>{label}</div>
              <ul style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6, paddingLeft: 18 }}>
                {items.map((s, i) => <li key={i} style={{ fontSize: 14, color: "var(--ink-soft)" }}>{s}</li>)}
              </ul>
            </div>
          ))}
          <p style={{ marginTop: 20, fontSize: 13, color: "var(--ink-faint)" }}>We rely on Gandhi's documented ideas rather than widely-circulated quote posters — several popular "Gandhi quotes" online are unverified or misattributed, so this site avoids quoting him directly.</p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   PRESENTATION MODE
   ========================================================================= */

const PRESENT_SLIDES = [
  { kicker: "The big question", title: "Can an idea from 1869 help us build 2030?" },
  { kicker: "Gandhi", title: "Ahimsa. Satya. Sarvodaya. Gram Swaraj. Swadeshi.", body: "Five ideas, translated into eleven working principles for this project." },
  { kicker: "The problem", title: "Philosophy rarely gets translated into a checklist anyone can act on.", body: "We tried to build that checklist." },
  { kicker: "Our school", title: "We worked toward solar energy and more responsible practices at our own school first.", body: "Action started where we had standing to act." },
  { kicker: "Our research", title: "We went into communities and listened before we built anything.", body: "Full methodology is on the About page." },
  { kicker: "What the data shows", title: "See Our Data for the complete findings.", body: "This deck highlights the categories we studied: women's skills, youth, environment and health." },
  { kicker: "Women & skills", title: "The skills that often go unseen.", body: "We looked for skills already present in the community that weren't being used professionally." },
  { kicker: "50+ students", title: "One community, built by many hands.", body: "Research, outreach, design, documentation and communications." },
  { kicker: "SDG alignment", title: "SDGs 4, 5, 13 and 17 — with 3, 15 and 16 as additional areas.", body: "Areas addressed, not areas achieved." },
  { kicker: "What changed / what remains", title: "Outputs are proven. Outcomes are emerging. Long-term goals are ahead.", body: "We're honest about which is which." },
  { kicker: "Call to action", title: "Which principle will you put into action?", body: "Explore, measure your impact, or take the pledge." },
];

function PresentMode({ onExit }) {
  const [i, setI] = useState(0);
  const next = () => setI((x) => Math.min(x + 1, PRESENT_SLIDES.length - 1));
  const prev = () => setI((x) => Math.max(x - 1, 0));
  useEffect(() => {
    const handler = (e) => { if (e.key === "ArrowRight") next(); if (e.key === "ArrowLeft") prev(); if (e.key === "Escape") onExit(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onExit]);
  const slide = PRESENT_SLIDES[i];
  return (
    <div className="gft" style={{ position: "fixed", inset: 0, zIndex: 70, background: "var(--ink)", color: "var(--white)", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", padding: 24 }}>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{i + 1} / {PRESENT_SLIDES.length}</span>
        <button onClick={onExit} style={{ background: "none", border: "none", color: "var(--white)" }}><X size={22} /></button>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 40px", maxWidth: 900, margin: "0 auto", textAlign: "left" }}>
        <div style={{ fontSize: 14, color: "var(--saffron-pale, #F0DFC0)", fontWeight: 600, marginBottom: 14 }}>{slide.kicker}</div>
        <h2 className="gft-serif" style={{ fontSize: 40, lineHeight: 1.2, color: "var(--white)" }}>{slide.title}</h2>
        {slide.body && <p style={{ marginTop: 20, fontSize: 18, color: "rgba(255,255,255,0.75)" }}>{slide.body}</p>}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: 24 }}>
        <button onClick={prev} disabled={i === 0} className="btn" style={{ background: "rgba(255,255,255,0.1)", color: "var(--white)" }}><ChevronLeft size={16} /> Back</button>
        <button onClick={next} disabled={i === PRESENT_SLIDES.length - 1} className="btn" style={{ background: "rgba(255,255,255,0.1)", color: "var(--white)" }}>Next <ChevronRight size={16} /></button>
      </div>
    </div>
  );
}

/* =========================================================================
   ROOT APP
   ========================================================================= */

export default function App() {
  const [page, setPage] = useState("home");
  const [presenting, setPresenting] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Work+Sans:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "auto" }); }, [page]);

  const PAGES = { home: HomePage, ideas: IdeasPage, sdgs: SdgPage, journey: JourneyPage, data: DataPage, interact: InteractPage, action: ActionPage, about: AboutPage };
  const Page = PAGES[page] || HomePage;

  return (
    <div className="gft">
      <GlobalStyles />
      <Nav page={page} setPage={setPage} onPresent={() => setPresenting(true)} />
      <Page setPage={setPage} />
      <Footer setPage={setPage} />
      {presenting && <PresentMode onExit={() => setPresenting(false)} />}
    </div>
  );
}
