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
};
