export type LayoutStyle = "editorial" | "gallery" | "archive" | "fullbleed";
export type SpacingStyle = "compact" | "balanced" | "spacious";

export interface Artwork {
  id: string;
  slug: string;
  title: string;
  year: string;
  medium: string;
  dimensions: string;
  description?: string;
  price?: string;
  showPrice: boolean;
  available: boolean;
  showInquire: boolean;
  images: string[];
  seriesId?: string;
  location?: string;
  edition?: string;
  order: number;
}

export interface Exhibition {
  id: string;
  slug: string;
  title: string;
  year: string;
  type: "Solo Exhibition" | "Group Exhibition" | "Art Fair" | "Residency" | "Online";
  venue: string;
  city: string;
  description?: string;
  artworkIds?: string[];
  link?: string;
}

export interface Series {
  id: string;
  slug: string;
  title: string;
  dateRange: string;
  description: string;
  cover: string;
}

export interface FieldNote {
  id: string;
  index: string;
  text: string;
  date: string;
}

export interface StudioItem {
  id: string;
  image: string;
  caption: string;
}

export interface ArtistTheme {
  layout: LayoutStyle;
  palette: string;
  typeface: string;
  spacing: SpacingStyle;
  bg: string;
  fg: string;
}

export interface Artist {
  username: string;
  name: string;
  location: string;
  disciplines: string[];
  bio: string;
  statement: string;
  email: string;
  instagram: string;
  website?: string;
  status?: string;
  avatar?: string;
  theme: ArtistTheme;
  isPro: boolean;
  published: boolean;
  demo?: boolean;
  artworks: Artwork[];
  exhibitions: Exhibition[];
  series: Series[];
  notes: FieldNote[];
  studio: StudioItem[];
}

export const PALETTES = [
  { id: "paper", name: "Paper", bg: "#F5F2EC", fg: "#1C1C1A" },
  { id: "bone", name: "Bone", bg: "#FBFAF7", fg: "#1C1C1A" },
  { id: "ink", name: "Ink", bg: "#1C1C1A", fg: "#F5F2EC" },
  { id: "clay", name: "Clay", bg: "#EDE7DA", fg: "#2A2723" },
  { id: "sage", name: "Sage", bg: "#E8EAE3", fg: "#22261F" },
  { id: "stone", name: "Stone", bg: "#E8E6E1", fg: "#1C1C1A" },
  { id: "blush", name: "Blush", bg: "#F3ECE6", fg: "#2B2320" },
  { id: "mist", name: "Mist", bg: "#EDF0F0", fg: "#1E2424" },
];

export const TYPEFACES = [
  { id: "cormorant", name: "Cormorant", serif: '"Cormorant Garamond", Georgia, serif' },
  { id: "instrument", name: "Instrument", serif: '"Instrument Serif", Georgia, serif' },
  { id: "garamond", name: "Garamond", serif: 'Garamond, "Cormorant Garamond", serif' },
  { id: "didot", name: "Didot", serif: 'Didot, "Bodoni MT", serif' },
  { id: "caslon", name: "Caslon", serif: '"Adobe Caslon", Georgia, serif' },
  { id: "baskerville", name: "Baskerville", serif: 'Baskerville, Georgia, serif' },
  { id: "times", name: "Times", serif: '"Times New Roman", Times, serif' },
  { id: "optima", name: "Optima", serif: 'Optima, Georgia, serif' },
];

export const LAYOUTS: { id: LayoutStyle; name: string; desc: string }[] = [
  { id: "editorial", name: "Editorial", desc: "Large image, breathing room, catalogue rhythm." },
  { id: "gallery", name: "Gallery", desc: "Clean two-column gallery grid." },
  { id: "archive", name: "Archive", desc: "Dense masonry for photos & works on paper." },
  { id: "fullbleed", name: "Full Bleed", desc: "Work fills the viewport, edge to edge." },
];

/* Local artwork files (public domain Van Gogh scans, hosted in /public/art). */
export const ART = {
  greenField: "/art/green-field.jpg",
  roses: "/art/roses.jpg",
  farmhouse: "/art/farmhouse.jpg",
  starryNight: "/art/starry-night.jpg",
  olive: "/art/olive.jpg",
  flowerBeds: "/art/flower-beds.jpg",
  almond: "/art/almond.jpg",
  sunflowers: "/art/sunflowers.jpg",
  potato: "/art/potato.jpg",
  bedroom: "/art/bedroom.jpg",
};

export const DEMO_ARTISTS: Artist[] = [
  {
    username: "mayachen",
    name: "Maya Chen",
    location: "Austin, TX",
    disciplines: ["Painting", "Mixed Media"],
    bio: "Maya Chen is a painter based in Austin whose work explores memory, repetition, and the spaces between physical and imagined landscapes.",
    statement: "Exploring memory, time, and the spaces between what was and what could be.",
    email: "hello@mayachen.art",
    instagram: "@mayachen.art",
    website: "mayachen.art",
    status: "Open for commissions",
    theme: { layout: "editorial", palette: "paper", typeface: "cormorant", spacing: "balanced", bg: "#F5F2EC", fg: "#1C1C1A" },
    isPro: false,
    published: true,
    demo: true,
    artworks: [
      {
        id: "m1", slug: "green-wheat-field", title: "Green Field", year: "1889",
        medium: "Oil on canvas", dimensions: "28 × 36 in.", description: "Wind made visible — a green field under a racing sky, painted fast before the light changed.",
        price: "$6,800", showPrice: true, available: true, showInquire: true,
        images: [ART.greenField],
        location: "Austin, TX", order: 0,
      },
      {
        id: "m2", slug: "roses-1890", title: "Roses", year: "1890",
        medium: "Oil on canvas", dimensions: "28 × 35 in.", description: "White roses against green — painted in the last summer.",
        price: "$5,200", showPrice: true, available: true, showInquire: true,
        images: [ART.roses],
        location: "Austin, TX", seriesId: "s1", order: 1,
      },
      {
        id: "m3", slug: "farmhouse-in-provence", title: "Farmhouse in Provence", year: "1888",
        medium: "Oil on canvas", dimensions: "18 × 22 in.", description: "A house holding its wheat — gold against a wall of blue.",
        price: "", showPrice: false, available: false, showInquire: true,
        images: [ART.farmhouse],
        seriesId: "s1", order: 2,
      },
      {
        id: "m4", slug: "the-starry-night", title: "The Starry Night", year: "1889",
        medium: "Oil on canvas", dimensions: "29 × 36 in.", description: "The night, remembered rather than observed.",
        price: "", showPrice: false, available: false, showInquire: false,
        images: [ART.starryNight],
        order: 3,
      },
      {
        id: "m5", slug: "the-olive-picking", title: "Women Picking Olives", year: "1889",
        medium: "Oil on canvas", dimensions: "29 × 36 in.", description: "Three figures, one ladder, late light.",
        price: "$4,000", showPrice: true, available: true, showInquire: true,
        images: [ART.olive],
        order: 4,
      },
      {
        id: "m6", slug: "flower-beds-in-holland", title: "Flower Beds in Holland", year: "c. 1883",
        medium: "Oil on canvas", dimensions: "25 × 30 in.",
        description: "Color as plot, plot as color.", price: "$3,200", showPrice: true, available: true, showInquire: true,
        images: [ART.flowerBeds],
        order: 5,
      },
    ],
    exhibitions: [
      { id: "e1", slug: "echoes-of-light", title: "Echoes of Light", year: "2024", type: "Group Exhibition", venue: "Contemporary Austin", city: "Austin, TX", description: "New paintings alongside three Texas-based artists working with light and archive." },
      { id: "e2", slug: "fragments-of-time", title: "Fragments of Time", year: "2023", type: "Solo Exhibition", venue: "The New Gallery", city: "Austin, TX", description: "Twelve works tracing one image across two years." },
      { id: "e3", slug: "soft-forms", title: "Soft Forms", year: "2022", type: "Group Exhibition", venue: "Lone Star Art Space", city: "Austin, TX" },
    ],
    series: [
      { id: "s1", slug: "fragmented-time", title: "Fragmented Time", dateRange: "2025–2026", description: "Late greens — wheat, roses, farmhouses — traced through overpainting, repetition and memory.", cover: ART.roses },
    ],
    notes: [
      { id: "n1", index: "04", text: "I kept painting over the blue because it felt too certain.", date: "Mar 2026" },
      { id: "n2", index: "05", text: "Started with a portrait. Ended somewhere else.", date: "Apr 2026" },
    ],
    studio: [
      { id: "st1", image: ART.bedroom, caption: "Studio wall, March — studies pinned before varnish." },
    ],
  },
  {
    username: "sofiaalvarez",
    name: "Sofia Alvarez",
    location: "New York, NY",
    disciplines: ["Photography"],
    bio: "Sofia Alvarez photographs fields, houses and quiet labor — images that hold still long enough to be remembered.",
    statement: "Photographs of fields, houses and the hours in between.",
    email: "sofia@sofiaalvarez.photo",
    instagram: "@sofia.alvarez",
    status: "Available for exhibitions",
    theme: { layout: "archive", palette: "bone", typeface: "instrument", spacing: "balanced", bg: "#FBFAF7", fg: "#1C1C1A" },
    isPro: true,
    published: true,
    demo: true,
    artworks: [
      { id: "a1", slug: "flower-beds", title: "Flower Beds in Holland", year: "2026", medium: "Archival pigment print", dimensions: "30 × 40 in.", edition: "Edition of 5 + 2 AP", description: "Color as plot, plot as color.", price: "$1,800", showPrice: true, available: true, showInquire: true, images: [ART.flowerBeds], order: 0 },
      { id: "a2", slug: "farmhouse-provence", title: "Farmhouse in Provence", year: "2025", medium: "Archival pigment print", dimensions: "24 × 30 in.", edition: "Edition of 8", description: "A house holding its field.", price: "$1,400", showPrice: true, available: true, showInquire: true, images: [ART.farmhouse], order: 1 },
      { id: "a3", slug: "green-wheat", title: "Green Wheat Field", year: "2025", medium: "Archival pigment print", dimensions: "36 × 48 in.", description: "Wind made visible.", price: "$2,200", showPrice: true, available: true, showInquire: true, images: [ART.greenField], order: 2 },
      { id: "a4", slug: "olive-picking", title: "The Olive Picking", year: "2024", medium: "Silver gelatin print", dimensions: "20 × 24 in.", description: "Three figures, one ladder, late light.", price: "", showPrice: false, available: false, showInquire: true, images: [ART.olive], order: 3 },
    ],
    exhibitions: [
      { id: "e1", slug: "flat-light", title: "Flat Light", year: "2026", type: "Solo Exhibition", venue: "Halide Gallery", city: "New York, NY" },
      { id: "e2", slug: "new-topographics", title: "Field Work", year: "2024", type: "Group Exhibition", venue: "Brooklyn Photo Room", city: "Brooklyn, NY" },
    ],
    series: [
      { id: "s1", slug: "field-work", title: "Field Work", dateRange: "2024–2026", description: "Photographs made walking the same three fields for two years.", cover: ART.greenField },
    ],
    notes: [{ id: "n1", index: "01", text: "The field was greener on the walk back. I swear.", date: "Feb 2026" }],
    studio: [],
  },
  {
    username: "eliaspark",
    name: "Elias Park",
    location: "Los Angeles, CA",
    disciplines: ["Sculpture"],
    bio: "Elias Park builds quiet forms in plaster, stone and found wood — objects that ask to be circled slowly.",
    statement: "Objects that ask to be circled slowly.",
    email: "studio@eliaspark.com",
    instagram: "@eliaspark.studio",
    status: "Studio visits by appointment",
    theme: { layout: "fullbleed", palette: "ink", typeface: "cormorant", spacing: "spacious", bg: "#1C1C1A", fg: "#F5F2EC" },
    isPro: true,
    published: true,
    demo: true,
    artworks: [
      { id: "p1", slug: "white-roses", title: "Roses, White", year: "2026", medium: "Cast plaster, pigment", dimensions: "18 × 22 × 14 in.", description: "A bouquet that will not wilt.", price: "$3,400", showPrice: true, available: true, showInquire: true, images: [ART.roses], order: 0 },
      { id: "p2", slug: "almond-blossom-form", title: "Almond Blossom Form", year: "2025", medium: "Carved maple, gesso", dimensions: "30 × 30 × 6 in.", description: "Branch as drawing in space.", price: "$4,800", showPrice: true, available: true, showInquire: true, images: [ART.almond], order: 1 },
      { id: "p3", slug: "sunflower-study", title: "Sunflower Study II", year: "2024", medium: "Bronze, patina", dimensions: "24 × 18 × 18 in.", description: "Weight of a summer.", price: "", showPrice: false, available: false, showInquire: true, images: [ART.sunflowers], order: 2 },
    ],
    exhibitions: [
      { id: "e1", slug: "soft-structures", title: "Soft Structures", year: "2026", type: "Group Exhibition", venue: "Matter Gallery", city: "Los Angeles, CA" },
    ],
    series: [],
    notes: [],
    studio: [
      { id: "st1", image: ART.bedroom, caption: "Plaster curing, north light." },
    ],
  },
  {
    username: "noorrahman",
    name: "Noor Rahman",
    location: "Chicago, IL",
    disciplines: ["Textiles", "Installation"],
    bio: "Noor Rahman works with dye, thread and night skies — textiles that map migration, home and return.",
    statement: "Textiles that map migration, home and return.",
    email: "noor@noorrahman.art",
    instagram: "@noor.rahman",
    status: "Currently making",
    theme: { layout: "gallery", palette: "sage", typeface: "instrument", spacing: "balanced", bg: "#E8EAE3", fg: "#22261F" },
    isPro: false,
    published: true,
    demo: true,
    artworks: [
      { id: "r1", slug: "starry-night-weave", title: "Night Weave No. 3", year: "2026", medium: "Natural dye, cotton, silk", dimensions: "60 × 72 in.", description: "A sky remembered, not observed.", price: "$2,600", showPrice: true, available: true, showInquire: true, images: [ART.starryNight], order: 0 },
      { id: "r2", slug: "potato-eaters-cloth", title: "Evening Meal Cloth", year: "2025", medium: "Charcoal, indigo on linen", dimensions: "48 × 60 in.", description: "Five figures around lamplight.", price: "$1,900", showPrice: true, available: true, showInquire: true, images: [ART.potato], order: 1 },
      { id: "r3", slug: "bedroom-textile", title: "Room, Held", year: "2024", medium: "Quilted cotton, thread", dimensions: "72 × 72 in.", description: "A bedroom as portrait.", price: "", showPrice: false, available: false, showInquire: false, images: [ART.bedroom], order: 2 },
    ],
    exhibitions: [
      { id: "e1", slug: "threaded-light", title: "Threaded Light", year: "2025", type: "Solo Exhibition", venue: "Chicago Textile House", city: "Chicago, IL" },
    ],
    series: [],
    notes: [{ id: "n1", index: "02", text: "Dye lot three finally matched the night I remembered.", date: "Jan 2026" }],
    studio: [],
  },
];

export function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 48) || "untitled";
}
