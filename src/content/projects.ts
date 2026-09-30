import type { Locale } from "@/lib/i18n";

export type Project = {
  id: string;
  name: string;
  category: Record<Locale, string>;
  tags: string[];
  // Three colours used to generate the abstract cover art.
  palette: [string, string, string];
  url?: string;
};

// TODO: check names and categories, add live URLs, and replace or extend this
// list with the projects you want to showcase publicly.
export const projects: Project[] = [
  {
    id: "bricol",
    name: "Bricol.clic",
    category: { fr: "Plateforme web & mobile", en: "Web & mobile platform" },
    tags: ["Web", "Mobile", "Dashboard"],
    palette: ["#2E3BFF", "#8FA2FF", "#FF7A45"],
  },
  {
    id: "soubai",
    name: "SOUBAI Location Sahara",
    category: { fr: "Site de location", en: "Rental website" },
    tags: ["Web", "Booking"],
    palette: ["#FF8A3D", "#FFD2A8", "#7A2E12"],
  },
  {
    id: "smartwathiqa",
    name: "SmartWathiqa",
    category: { fr: "Application web", en: "Web application" },
    tags: ["SaaS", "Web"],
    palette: ["#0FB9A0", "#C6FFF1", "#0A3B4F"],
  },
  {
    id: "talentdakhla",
    name: "TalentDakhla",
    category: { fr: "Plateforme de talents", en: "Talent platform" },
    tags: ["Web", "Platform"],
    palette: ["#B24BFF", "#F2C6FF", "#2A0F55"],
  },
  {
    id: "sirh",
    name: "SIRH",
    category: { fr: "Logiciel RH", en: "HR software" },
    tags: ["SaaS", "Dashboard"],
    palette: ["#1B1B24", "#5C6BFF", "#D9DEFF"],
  },
  {
    id: "obbo",
    name: "Obbo",
    category: { fr: "Landing page", en: "Landing page" },
    tags: ["Web", "Design"],
    palette: ["#FF3D7F", "#FFC2D6", "#3A0A1F"],
  },
];
