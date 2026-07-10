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
  { id: "scroll", label: "Scroll Effects" },
  { id: "transition", label: "Transitions & Loaders" },
  { id: "grid", label: "Grids & Layout" },
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

  // ——— Hero sections · wave 2 ———
  {
    slug: "particle-name-hero",
    title: "Particle Name",
    category: "hero",
    tags: ["webgl", "particles", "signature"],
    description:
      "A name built from thousands of GPU particles — the pointer scatters them, and they find their way home.",
    webgl: true,
    span: 2,
  },
  {
    slug: "blueprint-hero",
    title: "Blueprint",
    category: "hero",
    tags: ["svg", "gsap"],
    description:
      "The hero drafts itself: grid paper, measurement lines, a sketched wireframe — then the real thing settles over the plan.",
  },
  {
    slug: "slice-hero",
    title: "Slice",
    category: "hero",
    tags: ["gsap", "typography"],
    description:
      "Display type cut into horizontal strips that shear in from alternating sides, then lean with pointer velocity.",
  },

  // ——— Text animations · wave 2 ———
  {
    slug: "liquid-type",
    title: "Liquid Type",
    category: "text",
    tags: ["webgl", "shader"],
    description:
      "Type behind rippling glass — the surface bends and refracts the letters wherever the pointer stirs it.",
    webgl: true,
  },
  {
    slug: "path-text",
    title: "Path Text",
    category: "text",
    tags: ["svg", "raf"],
    description:
      "A sentence riding a curved path on repeat — your pointer bends the curve and drives the speed.",
  },
  {
    slug: "odometer-roll",
    title: "Odometer Roll",
    category: "text",
    tags: ["dom", "per-char"],
    description:
      "Words swap like a slot machine — each character rolls vertically on its own delay.",
  },

  // ——— Image carousels · wave 2 ———
  {
    slug: "panorama-strip",
    title: "Panorama Strip",
    category: "carousel",
    tags: ["webgl", "drag"],
    description:
      "One continuous strip of images on a curved lens — drag it and the edges bow away like a panorama.",
    webgl: true,
  },
  {
    slug: "filmstrip-scrub",
    title: "Filmstrip Scrub",
    category: "carousel",
    tags: ["raf", "pointer"],
    description:
      "Sweep across the strip to scrub through frames — let go and it snaps magnetically to the nearest one.",
  },
  {
    slug: "accordion-gallery",
    title: "Accordion Gallery",
    category: "carousel",
    tags: ["dom", "flex"],
    description:
      "Vertical slats of image — the one under your cursor breathes open while the others compress. Click to lock.",
  },

  // ——— Cursor & hover · wave 2 ———
  {
    slug: "particle-comet",
    title: "Particle Comet",
    category: "cursor",
    tags: ["canvas", "particles"],
    description:
      "The cursor becomes a comet — a curl-noise tail streams behind it, and clicking detonates a burst.",
  },
  {
    slug: "char-repel",
    title: "Char Repel",
    category: "cursor",
    tags: ["dom", "raf", "per-char"],
    description:
      "Letters flee the cursor inside its radius and spring back into the sentence when it passes.",
  },
  {
    slug: "tilt-glare-cards",
    title: "Tilt & Glare",
    category: "cursor",
    tags: ["dom", "3d"],
    description:
      "Cards that tilt in 3D under the pointer with a holographic sheen sweeping across the face.",
  },

  // ——— Scroll effects ———
  {
    slug: "pin-morph-scroll",
    title: "Pin Morph",
    category: "scroll",
    tags: ["scroll", "gsap", "signature"],
    description:
      "Scroll pins the scene while a small photo grows to fill the frame and the caption splits apart around it.",
    span: 2,
  },
  {
    slug: "horizontal-journey",
    title: "Horizontal Journey",
    category: "scroll",
    tags: ["scroll", "raf"],
    description:
      "Vertical scroll drives a sideways journey through panels, with a progress rail marking the stops.",
  },
  {
    slug: "parallax-scene",
    title: "Parallax Scene",
    category: "scroll",
    tags: ["scroll", "depth"],
    description:
      "Layers of the same scene sliding at different depths — far ones drift slow and soft, near ones fast and sharp.",
  },
  {
    slug: "velocity-skew",
    title: "Velocity Skew",
    category: "scroll",
    tags: ["scroll", "raf"],
    description:
      "Content that leans with how hard you scroll — flick it and the rows shear and blur, stop and they stand back up.",
  },
  {
    slug: "text-scrub-reveal",
    title: "Scrub Reveal",
    category: "scroll",
    tags: ["scroll", "typography"],
    description:
      "A paragraph that reads itself in — words brighten one by one, tied exactly to scroll depth.",
  },
  {
    slug: "sticky-stack",
    title: "Sticky Stack",
    category: "scroll",
    tags: ["scroll", "css"],
    description:
      "Cards pin at the top and get pressed down in scale and brightness as the next one slides over.",
  },
  {
    slug: "mask-wipe-scroll",
    title: "Mask Wipe",
    category: "scroll",
    tags: ["scroll", "clip-path"],
    description:
      "Scrolling opens a circular window onto the next scene until it swallows the frame.",
  },
  {
    slug: "line-draw-scroll",
    title: "Line Draw",
    category: "scroll",
    tags: ["scroll", "svg"],
    description:
      "An SVG line draws itself down the page as you scroll, threading through the milestones it passes.",
  },

  // ——— Transitions & loaders ———
  {
    slug: "curtain-transition",
    title: "Curtain",
    category: "transition",
    tags: ["gsap", "choreography"],
    description:
      "Staggered panels sweep the stage between scenes — the classic studio page-to-page curtain.",
  },
  {
    slug: "counter-preloader",
    title: "Counter Preloader",
    category: "transition",
    tags: ["gsap", "typography"],
    description:
      "A huge 0-to-100 that jumps in eased bursts, then the screen splits open on the finished site.",
  },
  {
    slug: "morph-loader",
    title: "Morph Loader",
    category: "transition",
    tags: ["svg", "morph"],
    description:
      "A blob loader that never repeats itself — the shape breathes through morph targets while the count climbs.",
  },
  {
    slug: "pixel-dissolve",
    title: "Pixel Dissolve",
    category: "transition",
    tags: ["canvas", "grid"],
    description:
      "The scene shatters into pixel blocks that flip away in random order to uncover the next one.",
  },
  {
    slug: "iris-transition",
    title: "Iris",
    category: "transition",
    tags: ["clip-path"],
    description:
      "Click anywhere — a circle opens from exactly that point onto the next scene.",
  },
  {
    slug: "glitch-transition",
    title: "Glitch Cut",
    category: "transition",
    tags: ["css", "rgb-split"],
    description:
      "A hard cut dressed in a frame of RGB-split, slice offsets, and static — blink and the scene has changed.",
  },
  {
    slug: "logo-sting",
    title: "Logo Sting",
    category: "transition",
    tags: ["svg", "stroke"],
    description:
      "A monogram draws itself stroke by stroke, fills, pops, and hands off to the page — a reusable brand intro.",
  },

  // ——— Grids & layout ———
  {
    slug: "infinite-drag-canvas",
    title: "Infinite Canvas",
    category: "grid",
    tags: ["raf", "drag", "signature"],
    description:
      "A boundless plane of images you can throw in any direction — it wraps forever and never hits an edge.",
    span: 2,
  },
  {
    slug: "expand-grid",
    title: "Expand Grid",
    category: "grid",
    tags: ["framer-motion", "flip"],
    description:
      "Tap a tile and it unfolds into the detail view while the rest of the grid steps aside.",
  },
  {
    slug: "masonry-flow",
    title: "Masonry Flow",
    category: "grid",
    tags: ["framer-motion", "filter"],
    description:
      "A masonry wall that re-choreographs itself when you filter — every tile glides to its new home.",
  },
  {
    slug: "hover-index-list",
    title: "Hover Index",
    category: "grid",
    tags: ["dom", "raf"],
    description:
      "An editorial index — rows fill on hover while a floating preview image chases the cursor.",
  },
  {
    slug: "mosaic-ripple",
    title: "Mosaic Ripple",
    category: "grid",
    tags: ["raf", "wave"],
    description:
      "Touch one tile and the whole mosaic answers — a scale wave rolls outward and settles.",
  },
  {
    slug: "bento-cascade",
    title: "Bento Cascade",
    category: "grid",
    tags: ["framer-motion", "hover"],
    description:
      "A bento board that deals itself in, tile by tile — each cell has its own micro-interaction inside.",
  },
  {
    slug: "counter-columns",
    title: "Counter Columns",
    category: "grid",
    tags: ["scroll", "raf"],
    description:
      "Two columns sliding against each other as you scroll — one rises, one sinks, meeting in the middle.",
  },
];

export const getDemo = (slug) => DEMOS.find((d) => d.slug === slug);

export const demoIndex = (slug) => DEMOS.findIndex((d) => d.slug === slug);
