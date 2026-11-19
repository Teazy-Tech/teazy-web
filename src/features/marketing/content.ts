import type { ToolId } from "@/components/layout";
import { FREE_MONTHLY, PER_DOWNLOAD_PRICE, planById } from "@/lib/plans";

/** Copy ported from the legacy home page. Prices come from lib/plans, never retyped. */

export const FEATURES: readonly { tool: ToolId; title: string; body: string; tags: string[] }[] = [
  {
    tool: "lessons",
    title: "Generate lesson notes",
    body: "Complete curriculum-aligned lesson notes in seconds: objectives, set induction, presentation and evaluation.",
    tags: ["NERDC", "NaCCA", "CBC"],
  },
  {
    tool: "assessment",
    title: "Assess handwritten work",
    body: "Upload handwritten essays and theory answers. Get marks, feedback and suggestions, then review every mark.",
    tags: ["Rubric marking", "Feedback"],
  },
  {
    tool: "quizzes",
    title: "Quiz generator",
    body: "Quizzes, tests and exam questions with answer keys ready for the classroom.",
    tags: ["MCQ", "Theory", "Answer keys"],
  },
  {
    tool: "worksheets",
    title: "Worksheet designer",
    body: "Printable worksheets with numbered sections, answer space, matching pictures and an answer key.",
    tags: ["PDF", "Word", "Answer key"],
  },
  {
    tool: "slides",
    title: "Presentation slides",
    body: "Designed slide decks with topic-matched pictures and speaker notes. Upload your own notes to build from them.",
    tags: ["PowerPoint", "Speaker notes"],
  },
  {
    tool: "videos",
    title: "Animated videos",
    body: "Type one topic and get a narrated animated lesson video with scenes, voiceover and music.",
    tags: ["Narration", "Scenes"],
  },
];

export const STEPS = [
  {
    title: "Tell us your class",
    body: "Choose curriculum, class and topic, or switch to online teaching with an age group and platform.",
  },
  {
    title: "Draft, then reviewed",
    body: "Teazy drafts the lesson, then checks curriculum fit, objectives and flow before you see it.",
  },
  {
    title: "Teach or export",
    body: "Edit inline, teach straight from the screen, or export a clean Word or PDF for your school file.",
  },
] as const;

const standard = planById("standard");
const pro = planById("pro");

export const FAQS: readonly { q: string; a: string }[] = [
  {
    q: "Can I use the Nigerian curriculum?",
    a: "Yes. Teazy AI generates Nigerian lesson notes that follow the NERDC structure: behavioural objectives, set induction, presentation, evaluation and assignment. Ghana NaCCA and Kenya CBC are supported too.",
  },
  {
    q: "Does it assess handwritten essays and exam scripts?",
    a: "Yes. Upload a photo of a handwritten essay or exam script. Teazy AI reads the text and marks it against a rubric covering content, grammar, structure and originality. You review and correct every mark before it is final.",
  },
  {
    q: "Can I edit generated lessons?",
    a: "Yes. Every generated lesson note can be edited inside Teazy AI before you export it as Word or PDF, and your edits are saved.",
  },
  {
    q: "Is there a free version?",
    a: `Yes. Every month you get ${FREE_MONTHLY.lesson} lesson notes, ${FREE_MONTHLY.quiz} quizzes, ${FREE_MONTHLY.worksheet} worksheets, ${FREE_MONTHLY.slides} presentation slide decks, ${FREE_MONTHLY.video} animated video and ${FREE_MONTHLY.writing} Writing Assessment uploads. Usage resets at the start of each month. A single PDF or Word download costs ${PER_DOWNLOAD_PRICE.NGN} (${PER_DOWNLOAD_PRICE.GHS} or ${PER_DOWNLOAD_PRICE.KES}).`,
  },
  {
    q: "What do the paid plans cost?",
    a: `${standard.name} is ${standard.price.NGN}, ${standard.price.GHS} or ${standard.price.KES} a month. ${pro.name} is ${pro.price.NGN}, ${pro.price.GHS} or ${pro.price.KES} a month.`,
  },
  {
    q: `What is the difference between ${standard.name} and ${pro.name}?`,
    a: `${standard.name} is for everyday lesson preparation. ${pro.name} includes everything in ${standard.name} and adds up to 1000 handwritten scripts a month, bulk marking, saved marking schemes, folders, analytics and Excel/CSV export.`,
  },
  {
    q: "Is there anything for university lecturers?",
    a: "Yes. The Higher Ed section has presentation slides, a quiz generator, writing assessment that marks against your own scheme, and a rubric generator.",
  },
  {
    q: "Where are my saved resources?",
    a: "Everything you generate and save is kept in My Workspace, where you can search, reopen, download or delete it.",
  },
];

export interface HubItem {
  tool: ToolId;
  /** Audience-specific wording; defaults to the tool's description. */
  description?: string;
  /** Extra query string, e.g. "for=higher-ed". */
  query?: string;
}

export interface Hub {
  title: string;
  intro: string;
  groups: readonly { title: string; items: readonly HubItem[] }[];
  other: { href: string; label: string };
}

export const K12_HUB: Hub = {
  title: "K-12",
  intro:
    "Tools for primary and secondary school teachers, homeschooling parents and online teachers.",
  other: { href: "/higher-ed", label: "Higher Ed" },
  groups: [
    {
      title: "Plan and teach",
      items: [
        { tool: "lessons" },
        { tool: "slides", description: "Classroom slides you can download as PowerPoint." },
        { tool: "videos" },
        { tool: "simplifier" },
      ],
    },
    {
      title: "Practise and assess",
      items: [
        { tool: "quizzes" },
        { tool: "worksheets" },
        {
          tool: "assessment",
          description: "Mark handwritten or typed scripts, one at a time or in bulk.",
        },
      ],
    },
  ],
};

export const HIGHER_ED_HUB: Hub = {
  title: "Higher Ed",
  intro:
    "Tools for university lecturers, college instructors and other higher education educators.",
  other: { href: "/k12", label: "K-12" },
  groups: [
    {
      title: "Assess",
      items: [
        {
          tool: "assessment",
          description: "Mark scripts against your own marking scheme and question paper.",
          query: "for=higher-ed",
        },
        { tool: "bulk-marking", query: "for=higher-ed" },
        { tool: "quizzes" },
        { tool: "rubrics" },
      ],
    },
    {
      title: "Teach",
      items: [
        {
          tool: "slides",
          description: "Lecture slides with speaker notes, downloadable as PowerPoint.",
          query: "for=higher-ed",
        },
      ],
    },
  ],
};
