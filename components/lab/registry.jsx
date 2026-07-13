"use client";
import dynamic from "next/dynamic";

// The single client boundary for demo code. Everything loads via next/dynamic
// so each demo is its own chunk: gsap/ogl never reach the (site) bundle, and
// the /lab index only downloads a demo when its card actually mounts.
// ssr: false across the board — every demo measures the DOM, touches canvas,
// or drives WebGL, none of which survive server rendering.

const loading = () => <div className="lab-demo-skeleton" />;
const demo = (importer) => dynamic(importer, { ssr: false, loading });

export const DEMO_COMPONENTS = {
  // Hero
  "xray-hero": demo(() => import("./demos/XrayHero")),
  "kinetic-slab-hero": demo(() => import("./demos/KineticSlabHero")),
  "gradient-field-hero": demo(() => import("./demos/GradientFieldHero")),
  "split-panel-hero": demo(() => import("./demos/SplitPanelHero")),
  // Text
  "ripple-swap": demo(() => import("./demos/RippleSwap")),
  "scramble-hover": demo(() => import("./demos/ScrambleHover")),
  "variable-weight-wave": demo(() => import("./demos/VariableWeightWave")),
  "velocity-marquee": demo(() => import("./demos/VelocityMarquee")),
  // Carousel
  "distortion-slider": demo(() => import("./demos/DistortionSlider")),
  "momentum-gallery": demo(() => import("./demos/MomentumGallery")),
  "clip-reveal-carousel": demo(() => import("./demos/ClipRevealCarousel")),
  "depth-stack": demo(() => import("./demos/DepthStack")),
  // Cursor & hover
  "image-trail": demo(() => import("./demos/ImageTrail")),
  "magnetic-dock": demo(() => import("./demos/MagneticDock")),
  "hover-lens": demo(() => import("./demos/HoverLens")),
  "spotlight-grid": demo(() => import("./demos/SpotlightGrid")),
  // Hero · wave 2
  "particle-name-hero": demo(() => import("./demos/ParticleNameHero")),
  "blueprint-hero": demo(() => import("./demos/BlueprintHero")),
  "slice-hero": demo(() => import("./demos/SliceHero")),
  // Text · wave 2
  "liquid-type": demo(() => import("./demos/LiquidType")),
  "path-text": demo(() => import("./demos/PathText")),
  "odometer-roll": demo(() => import("./demos/OdometerRoll")),
  // Carousel · wave 2
  "panorama-strip": demo(() => import("./demos/PanoramaStrip")),
  "filmstrip-scrub": demo(() => import("./demos/FilmstripScrub")),
  "accordion-gallery": demo(() => import("./demos/AccordionGallery")),
  // Cursor & hover · wave 2
  "particle-comet": demo(() => import("./demos/ParticleComet")),
  "char-repel": demo(() => import("./demos/CharRepel")),
  "tilt-glare-cards": demo(() => import("./demos/TiltGlareCards")),
  // Scroll effects
  "pin-morph-scroll": demo(() => import("./demos/PinMorphScroll")),
  "horizontal-journey": demo(() => import("./demos/HorizontalJourney")),
  "parallax-scene": demo(() => import("./demos/ParallaxScene")),
  "velocity-skew": demo(() => import("./demos/VelocitySkew")),
  "text-scrub-reveal": demo(() => import("./demos/TextScrubReveal")),
  "sticky-stack": demo(() => import("./demos/StickyStack")),
  "mask-wipe-scroll": demo(() => import("./demos/MaskWipeScroll")),
  "line-draw-scroll": demo(() => import("./demos/LineDrawScroll")),
  // Transitions & loaders
  "curtain-transition": demo(() => import("./demos/CurtainTransition")),
  "counter-preloader": demo(() => import("./demos/CounterPreloader")),
  "morph-loader": demo(() => import("./demos/MorphLoader")),
  "pixel-dissolve": demo(() => import("./demos/PixelDissolve")),
  "iris-transition": demo(() => import("./demos/IrisTransition")),
  "glitch-transition": demo(() => import("./demos/GlitchTransition")),
  "logo-sting": demo(() => import("./demos/LogoSting")),
  // Grids & layout
  "infinite-drag-canvas": demo(() => import("./demos/InfiniteDragCanvas")),
  "expand-grid": demo(() => import("./demos/ExpandGrid")),
  "masonry-flow": demo(() => import("./demos/MasonryFlow")),
  "hover-index-list": demo(() => import("./demos/HoverIndexList")),
  "mosaic-ripple": demo(() => import("./demos/MosaicRipple")),
  "bento-cascade": demo(() => import("./demos/BentoCascade")),
  "counter-columns": demo(() => import("./demos/CounterColumns")),
  // Hero · wave 3
  "aurora-veil-hero": demo(() => import("./demos/AuroraVeilHero")),
  "terminal-hero": demo(() => import("./demos/TerminalHero")),
  "floating-panels-hero": demo(() => import("./demos/FloatingPanelsHero")),
  // Text · wave 3
  "split-flap": demo(() => import("./demos/SplitFlap")),
  "focus-type": demo(() => import("./demos/FocusType")),
  "rag-doll-type": demo(() => import("./demos/RagDollType")),
  // Carousel · wave 3
  coverflow: demo(() => import("./demos/Coverflow")),
  "ken-burns": demo(() => import("./demos/KenBurns")),
  "shared-frame": demo(() => import("./demos/SharedFrame")),
  // Cursor & hover · wave 3
  "glow-cards": demo(() => import("./demos/GlowCards")),
  "morph-cursor": demo(() => import("./demos/MorphCursor")),
  "dot-field": demo(() => import("./demos/DotField")),
  // Scroll effects · wave 3
  "scroll-dolly": demo(() => import("./demos/ScrollDolly")),
  "chapter-split": demo(() => import("./demos/ChapterSplit")),
  // Transitions & loaders · wave 3
  "lens-blur": demo(() => import("./demos/LensBlur")),
  "skeleton-morph": demo(() => import("./demos/SkeletonMorph")),
  "ink-bleed": demo(() => import("./demos/InkBleed")),
  // Grids & layout · wave 3
  "sort-grid": demo(() => import("./demos/SortGrid")),
  "isometric-board": demo(() => import("./demos/IsometricBoard")),
  "view-morph": demo(() => import("./demos/ViewMorph")),
};
