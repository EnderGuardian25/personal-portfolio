"use client";
import { useEffect, useRef } from "react";

export default function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);

  useEffect(() => {
    let mx = 0, my = 0, rx = 0, ry = 0;
    const move = (e) => { mx = e.clientX; my = e.clientY; };
    const onOver = (e) => {
      if (e.target.closest("a, button, [data-hover]")) {
        ring.current?.style.setProperty("width", "60px");
        ring.current?.style.setProperty("height", "60px");
        ring.current?.style.setProperty("opacity", "0.6");
      } else {
        ring.current?.style.setProperty("width", "36px");
        ring.current?.style.setProperty("height", "36px");
        ring.current?.style.setProperty("opacity", "1");
      }
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", onOver);
    let raf;
    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (dot.current) dot.current.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
      if (ring.current) ring.current.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", onOver);
    };
  }, []);

  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden />
      <div ref={dot} className="cursor-dot" aria-hidden />
    </>
  );
}
