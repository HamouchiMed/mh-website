import { collection, config, fields, singleton } from "@keystatic/core";
import { services } from "./src/content/services";

// Content editor available at /keystatic.
// - Locally (`npm run dev`) it edits the files in /content directly.
// - In production it commits to GitHub once the Keystatic GitHub app env vars
//   are set (see README → "Content editor"). The public app slug is the switch
//   because this config is also bundled for the browser.
export const useGithub = Boolean(process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG);

const languages = [
  { label: "Français", value: "fr" },
  { label: "English", value: "en" },
  { label: "العربية", value: "ar" },
] as const;

const localized = (label: string, opts: { multiline?: boolean; required?: boolean } = {}) =>
  fields.object(
    {
      fr: fields.text({ label: `${label} — FR`, multiline: opts.multiline, validation: { isRequired: opts.required } }),
      en: fields.text({ label: `${label} — EN`, multiline: opts.multiline }),
      ar: fields.text({ label: `${label} — AR`, multiline: opts.multiline }),
    },
    { label },
  );

const localizedList = (label: string) =>
  fields.object(
    {
      fr: fields.array(fields.text({ label: "Item" }), { label: `${label} — FR`, itemLabel: (p) => p.value }),
      en: fields.array(fields.text({ label: "Item" }), { label: `${label} — EN`, itemLabel: (p) => p.value }),
      ar: fields.array(fields.text({ label: "Item" }), { label: `${label} — AR`, itemLabel: (p) => p.value }),
    },
    { label },
  );

export default config({
  storage: useGithub ? { kind: "github", repo: "HamouchiMed/mh-website" } : { kind: "local" },
  ui: {
    brand: { name: "MH Group" },
    navigation: { Contenu: ["posts", "projects"], Confiance: ["testimonials", "clients"], Studio: ["studio", "team"] },
  },
  singletons: {
    studio: singleton({
      label: "Studio (showreel, chiffres)",
      path: "content/studio",
      format: { data: "json" },
      schema: {
        showreel: fields.file({
          label: "Vidéo showreel (MP4, 20–40 s)",
          description: "Ajoute un bouton « Voir le showreel » sur la page d'accueil.",
          directory: "public/media",
          publicPath: "/media/",
        }),
        showreelPoster: fields.image({ label: "Image d'aperçu de la vidéo", directory: "public/media", publicPath: "/media/" }),
        stats: fields.array(
          fields.object({
            value: fields.text({ label: "Valeur (ex. 40+)" }),
            label: localized("Libellé"),
          }),
          {
            label: "Chiffres clés",
            description: "Uniquement des chiffres réels. La section s'affiche dès qu'il y en a au moins un.",
            itemLabel: (p) => p.fields.value.value,
          },
        ),
      },
    }),
  },
  collections: {
    team: collection({
      label: "Équipe",
      slugField: "name",
      path: "content/team/*",
      format: { data: "json" },
      columns: ["name", "order"],
      schema: {
        name: fields.slug({ name: { label: "Nom" } }),
        order: fields.integer({ label: "Ordre", defaultValue: 10 }),
        role: localized("Poste", { required: true }),
        photo: fields.image({ label: "Photo (portrait)", directory: "public/team", publicPath: "/team/" }),
      },
    }),
    posts: collection({
      label: "Blog",
      slugField: "title",
      path: "content/posts/*",
      format: { contentField: "content" },
      entryLayout: "content",
      columns: ["title", "lang", "date"],
      schema: {
        title: fields.slug({ name: { label: "Titre" }, slug: { label: "URL (slug)" } }),
        lang: fields.select({ label: "Langue", options: [...languages], defaultValue: "fr" }),
        translationKey: fields.text({
          label: "Clé de traduction",
          description: "Même valeur sur les versions FR / EN / AR d'un article pour les relier (hreflang).",
        }),
        description: fields.text({
          label: "Description (Google)",
          multiline: true,
          validation: { length: { min: 50, max: 170 } },
        }),
        category: fields.text({ label: "Catégorie" }),
        date: fields.date({ label: "Date de publication", validation: { isRequired: true } }),
        updated: fields.date({ label: "Dernière mise à jour" }),
        content: fields.markdoc({ label: "Contenu", extension: "md" }),
      },
    }),
    projects: collection({
      label: "Réalisations",
      slugField: "name",
      path: "content/projects/*",
      format: { data: "json" },
      columns: ["name", "order"],
      schema: {
        name: fields.slug({ name: { label: "Nom du projet" }, slug: { label: "URL (slug)" } }),
        order: fields.integer({ label: "Ordre d'affichage", defaultValue: 10 }),
        featured: fields.checkbox({ label: "Afficher sur la page d'accueil", defaultValue: true }),
        client: fields.text({ label: "Client (optionnel)" }),
        year: fields.text({ label: "Année (optionnel)" }),
        url: fields.url({ label: "Site en ligne (optionnel)" }),
        cover: fields.image({
          label: "Couverture (4:3, idéalement 1600×1200)",
          description: "Image principale : maquette, capture d'écran ou visuel du projet.",
          directory: "public/work",
          publicPath: "/work/",
        }),
        gallery: fields.array(
          fields.object({
            image: fields.image({ label: "Capture", directory: "public/work", publicPath: "/work/" }),
            device: fields.select({
              label: "Format",
              options: [
                { label: "Ordinateur", value: "desktop" },
                { label: "Téléphone", value: "mobile" },
              ],
              defaultValue: "desktop",
            }),
          }),
          { label: "Captures d'écran", itemLabel: (p) => p.fields.device.value },
        ),
        category: localized("Catégorie", { required: true }),
        summary: localized("Résumé", { multiline: true, required: true }),
        challenge: localized("Le défi", { multiline: true }),
        solution: localized("Notre solution", { multiline: true }),
        features: localizedList("Fonctionnalités clés"),
        services: fields.multiselect({
          label: "Services liés",
          options: services.map((s) => ({ label: s.fr.title, value: s.id })),
        }),
        stack: fields.array(fields.text({ label: "Technologie" }), { label: "Technologies", itemLabel: (p) => p.value }),
        tags: fields.array(fields.text({ label: "Tag" }), { label: "Tags", itemLabel: (p) => p.value }),
        palette: fields.array(fields.text({ label: "Couleur (hex)" }), {
          label: "Couleurs de la couverture (3)",
          itemLabel: (p) => p.value,
          validation: { length: { min: 3, max: 3 } },
        }),
      },
    }),
    testimonials: collection({
      label: "Avis clients",
      slugField: "author",
      path: "content/testimonials/*",
      format: { data: "json" },
      schema: {
        author: fields.slug({ name: { label: "Nom" } }),
        role: fields.text({ label: "Poste / entreprise" }),
        quote: localized("Témoignage", { multiline: true, required: true }),
        project: fields.text({ label: "Projet lié (slug, optionnel)" }),
      },
    }),
    clients: collection({
      label: "Logos clients",
      slugField: "name",
      path: "content/clients/*",
      format: { data: "json" },
      schema: {
        name: fields.slug({ name: { label: "Nom" } }),
        logo: fields.image({ label: "Logo (SVG ou PNG)", directory: "public/clients", publicPath: "/clients/" }),
        url: fields.url({ label: "Site (optionnel)" }),
      },
    }),
  },
});
