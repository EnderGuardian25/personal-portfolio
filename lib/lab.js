// Registry for the /lab reference gallery. Pure data — no component imports —
// so server code (generateStaticParams, metadata) can consume it. The slug is
// the stable ID: it names the route (/lab/[slug]) and keys the component map
// in components/lab/registry.jsx. To add a demo: one entry here, one component
// in components/lab/demos/, one line in the component map.

export const CATEGORIES = [
  { id: "hero", label: "Hero Sections" },
  { id: "text", label: "Text Animations" },
  { id: "carousel", label: "Image Carousels" },
  { id: "cursor", label: "Cursor & Hover" },
];

export const DEMOS = [
  // ——— Hero sections ———
  {
    slug: "xray-hero",
    title: "X-Ray Hero",
    category: "hero",
    tags: ["webgl", "flowmap", "signature"],
    description:
      "Hover peels the image open to what's underneath — the streak slowly heals itself closed behind you.",
    webgl: true,
    span: 2,
  },
  {
    slug: "kinetic-slab-hero",
    title: "Kinetic Slab",
    category: "hero",
    tags: ["gsap", "typography"],
    description:
      "Oversized display type rises through masks, then leans with your pointer's velocity.",
  },
  {
    slug: "gradient-field-hero",
    title: "Gradient Field",
    category: "hero",
    tags: ["webgl", "shader"],
    description:
      "A slow fog of color drifting through noise — the pointer warps the field as it passes.",
    webgl: true,
  },
  {
    slug: "split-panel-hero",
    title: "Split Panel",
    category: "hero",
    tags: ["framer-motion", "choreography"],
    description:
      "The hero assembles itself: panels slide apart, image and type stagger in. Hit replay.",
  },

  // ——— Text animations ———
  {
    slug: "ripple-swap",
    title: "Ripple Swap",
    category: "text",
    tags: ["raf", "per-char", "signature"],
    description:
      "Trace the sentence and a second one surfaces in your wake — rippling outward, healing back.",
    span: 2,
  },
  {
    slug: "scramble-hover",
    title: "Scramble Links",
    category: "text",
    tags: ["raf", "glyphs"],
    description:
      "Links that boil into glyph noise and resolve left-to-right on hover.",
  },
  {
    slug: "variable-weight-wave",
    title: "Weight Wave",
    category: "text",
    tags: ["variable-font", "raf"],
    description:
      "The line gets heavier under your cursor — a gaussian of font weight that springs back.",
  },
  {
    slug: "velocity-marquee",
    title: "Velocity Marquee",
    category: "text",
    tags: ["raf", "physics"],
    description:
      "Grab the ribbon and throw it — momentum, settle, and skew mapped to velocity.",
  },

  // ——— Image carousels ———
  {
    slug: "distortion-slider",
    title: "Distortion Slider",
    category: "carousel",
    tags: ["webgl", "gsap", "shader"],
    description:
      "Slides melt into each other through a noise displacement field.",
    webgl: true,
  },
  {
    slug: "momentum-gallery",
    title: "Momentum Gallery",
    category: "carousel",
    tags: ["framer-motion", "drag"],
    description:
      "A draggable row with real momentum — images parallax inside their frames as you throw it.",
  },
  {
    slug: "clip-reveal-carousel",
    title: "Clip Reveal",
    category: "carousel",
    tags: ["gsap", "clip-path"],
    description:
      "Slides wipe in through animated clip masks with an index counter. Arrow keys work.",
  },
  {
    slug: "depth-stack",
    title: "Depth Stack",
    category: "carousel",
    tags: ["framer-motion", "3d"],
    description:
      "A stacked deck in 3D that fans toward your cursor — click a card to bring it forward.",
  },

  // ——— Cursor & hover ———
  {
    slug: "image-trail",
    title: "Image Trail",
    category: "cursor",
    tags: ["canvas"],
    description:
      "Move fast and the cursor sheds a trail of images that bloom and fade.",
  },
  {
    slug: "magnetic-dock",
    title: "Magnetic Dock",
    category: "cursor",
    tags: ["framer-motion", "springs"],
    description:
      "Buttons that reach for the cursor and snap back on release, with an elastic blob between them.",
  },
  {
    slug: "hover-lens",
    title: "Hover Lens",
    category: "cursor",
    tags: ["dom", "transforms"],
    description:
      "A magnifying, color-inverting lens that glides over a board of type and image.",
  },
  {
    slug: "spotlight-grid",
    title: "Spotlight Grid",
    category: "cursor",
    tags: ["css-mask", "raf"],
    description:
      "A dim grid where your cursor is the light source — cards ignite and tilt as the beam passes.",
  },
];

export const getDemo = (slug) => DEMOS.find((d) => d.slug === slug);

export const demoIndex = (slug) => DEMOS.findIndex((d) => d.slug === slug);
