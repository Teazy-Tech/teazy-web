import {
  BookOpen,
  ClipboardList,
  Clapperboard,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Layers,
  ListChecks,
  type LucideIcon,
  PenLine,
  Presentation,
  TextQuote,
  UserRound,
} from "lucide-react";

/**
 * The one list of places in the app. The sidebar, the phone bottom bar, the
 * K-12 / Higher Ed hubs, the dashboard and the 404 page all read from here,
 * so a tool is added or renamed in one place (frontend assessment F-29).
 */
export interface NavItem {
  id: string;
  /** Full label: sidebar, hubs, "All tools" sheet. */
  label: string;
  /** Short label for the phone bottom bar (fits ~70 px). */
  shortLabel: string;
  href: string;
  description: string;
  icon: LucideIcon;
}

export const CREATE_TOOLS = [
  {
    id: "lessons",
    label: "Lesson notes",
    shortLabel: "Lessons",
    href: "/lessons",
    description: "Curriculum-aligned lesson plans and full notes, saved automatically.",
    icon: BookOpen,
  },
  {
    id: "quizzes",
    label: "Quiz generator",
    shortLabel: "Quizzes",
    href: "/quizzes",
    description: "Quizzes and test questions with a separate answer key.",
    icon: ListChecks,
  },
  {
    id: "worksheets",
    label: "Worksheet designer",
    shortLabel: "Worksheets",
    href: "/worksheets",
    description: "Printable practice worksheets with answer space and an answer key.",
    icon: FileText,
  },
  {
    id: "slides",
    label: "Presentation slides",
    shortLabel: "Slides",
    href: "/slides",
    description: "Classroom or lecture slides with speaker notes, downloadable as PowerPoint.",
    icon: Presentation,
  },
  {
    id: "rubrics",
    label: "Rubric generator",
    shortLabel: "Rubrics",
    href: "/rubrics",
    description: "Marking rubrics for essays, projects and presentations.",
    icon: ClipboardList,
  },
  {
    id: "videos",
    label: "Animated videos",
    shortLabel: "Videos",
    href: "/videos",
    description: "Narrated animated lesson videos made from one topic.",
    icon: Clapperboard,
  },
  {
    id: "simplifier",
    label: "Content simplifier",
    shortLabel: "Simplify",
    href: "/simplifier",
    description: "Paste a passage and get a version your class can read.",
    icon: TextQuote,
  },
] as const satisfies readonly NavItem[];

export const ASSESS_TOOLS = [
  {
    id: "assessment",
    label: "Mark a script",
    shortLabel: "Mark",
    href: "/assessment",
    description: "Mark one handwritten or typed script, then review every mark.",
    icon: PenLine,
  },
  {
    id: "bulk-marking",
    label: "Bulk marking",
    shortLabel: "Bulk",
    href: "/assessment/bulk",
    description: "Upload a whole class of scripts and review the results together.",
    icon: Layers,
  },
] as const satisfies readonly NavItem[];

/** Personal pages. Signed-in only (they redirect to sign-in; see lib/auth/routes.ts). */
export const PERSONAL_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    shortLabel: "Home",
    href: "/dashboard",
    description: "Your tools and recent work.",
    icon: LayoutDashboard,
  },
  {
    id: "workspace",
    label: "My Workspace",
    shortLabel: "Workspace",
    href: "/workspace",
    description: "Everything you have generated and saved.",
    icon: FolderOpen,
  },
  {
    id: "account",
    label: "Account",
    shortLabel: "Account",
    href: "/account",
    description: "Plan, usage and profile.",
    icon: UserRound,
  },
] as const satisfies readonly NavItem[];

export const ALL_TOOLS: readonly NavItem[] = [...CREATE_TOOLS, ...ASSESS_TOOLS];

export type ToolId = (typeof CREATE_TOOLS)[number]["id"] | (typeof ASSESS_TOOLS)[number]["id"];

export function toolById(id: ToolId): NavItem {
  const tool = ALL_TOOLS.find((t) => t.id === id);
  if (!tool) throw new Error(`Unknown tool: ${id}`);
  return tool;
}

export interface NavGroup {
  label: string;
  items: readonly NavItem[];
}

/** Sidebar / "All tools" groups. Personal items only for signed-in teachers (F-29). */
export function navGroups(signedIn: boolean): NavGroup[] {
  const groups: NavGroup[] = [
    { label: "Create", items: CREATE_TOOLS },
    { label: "Assess", items: ASSESS_TOOLS },
  ];
  if (signedIn) groups.unshift({ label: "My Teazy", items: PERSONAL_ITEMS });
  return groups;
}

/** The four bottom-bar slots before "More". The rest are one tap away in the sheet. */
export function bottomBarItems(signedIn: boolean): readonly NavItem[] {
  const [lessons, quizzes, worksheets] = CREATE_TOOLS;
  const [mark] = ASSESS_TOOLS;
  const workspace = PERSONAL_ITEMS[1];
  return signedIn ? [lessons, quizzes, mark, workspace] : [lessons, quizzes, worksheets, mark];
}

/**
 * The href of the item that owns `pathname`: the longest matching path, so
 * `/assessment/bulk` highlights Bulk marking, not Mark a script.
 */
export function activeHref(pathname: string, items: readonly NavItem[]): string | null {
  let best: string | null = null;
  for (const { href } of items) {
    const base = href.split("?")[0];
    const matches = pathname === base || pathname.startsWith(`${base}/`);
    if (matches && (best === null || base.length > best.length)) best = href;
  }
  return best;
}

/** Public site links in the header (Pricing added per F-29). */
export const PUBLIC_LINKS = [
  { label: "K-12", href: "/k12" },
  { label: "Higher Ed", href: "/higher-ed" },
  { label: "Pricing", href: "/pricing" },
] as const;
