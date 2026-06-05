"use client";

export default function PixelLoader({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 select-none">
      <div className="pixel-loader-scene" aria-hidden="true">
        <div className="pixel-book">
          <div className="pixel-book-page pixel-book-page--1" />
          <div className="pixel-book-page pixel-book-page--2" />
          <div className="pixel-book-page pixel-book-page--3" />
          <div className="pixel-book-cover" />
        </div>
        <div className="pixel-dots">
          <span />
          <span />
          <span />
        </div>
      </div>
      <p className="text-[10px] font-mono text-text-muted tracking-[0.2em] uppercase">
        {message}
      </p>
    </div>
  );
}
