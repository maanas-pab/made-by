import Link from "next/link";
import React from "react";

export function MadeByMark({ light = false, className = "" }: { light?: boolean; className?: string }) {
  return (
    <Link href="/" className={`serif font-medium tracking-tight text-[22px] leading-none ${light ? "text-paper" : "text-ink"} ${className}`} aria-label="made by home">
      made by
    </Link>
  );
}

export function MicroLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`micro-label text-warmgray ${className}`}>{children}</p>;
}

export function Hairline({ className = "" }: { className?: string }) {
  return <div className={`h-px w-full bg-line ${className}`} aria-hidden />;
}

export function ArrowLink({ href, children, dark = false }: { href: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <Link href={href} className={`group inline-flex items-center gap-2 text-[11px] tracking-[0.16em] uppercase font-medium ${dark ? "text-paper" : "text-ink"} hover:opacity-60`}>
      <span className="border-b border-current pb-0.5">{children}</span>
      <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
    </Link>
  );
}

export function Button({ children, onClick, href, variant = "primary", className = "", type = "button" as const, disabled = false }: {
  children: React.ReactNode; onClick?: () => void; href?: string;
  variant?: "primary" | "ghost" | "line"; className?: string; type?: "button" | "submit"; disabled?: boolean;
}) {
  const base = "inline-flex items-center justify-center px-5 py-2.5 text-[13px] font-medium tracking-wide transition-all disabled:opacity-40";
  const styles = variant === "primary"
    ? "bg-ink text-paper hover:opacity-85"
    : variant === "line" ? "border border-line text-ink hover:border-ink" : "text-ink hover:opacity-60 underline underline-offset-4";
  if (href) return <Link href={href} className={`${base} ${styles} ${className}`}>{children}</Link>;
  return <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${styles} ${className}`}>{children}</button>;
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full border border-line bg-transparent px-3.5 py-2.5 text-[14px] placeholder:text-warmgray focus:border-ink focus:outline-none ${props.className ?? ""}`} />;
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`w-full border border-line bg-transparent px-3.5 py-2.5 text-[14px] placeholder:text-warmgray focus:border-ink focus:outline-none min-h-[96px] ${props.className ?? ""}`} />;
}
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`w-full border border-line bg-transparent px-3.5 py-2.5 text-[14px] focus:border-ink focus:outline-none ${props.className ?? ""}`} />;
}
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="micro-label text-warmgray block mb-2">{label}</span>
      {children}
    </label>
  );
}

export function SiteFooter({ artistName, artistLocation, minimal = false }: { artistName?: string; artistLocation?: string; minimal?: boolean }) {
  return (
    <footer className="mt-24 border-t hairline">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex justify-center mb-8" aria-hidden><span className="text-warmgray text-sm">✦</span></div>
        {artistName && (
          <p className="text-center serif text-xl mb-1">{artistName}</p>
        )}
        {artistLocation && <p className="text-center text-[12px] text-warmgray mb-6">{artistLocation}</p>}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-[13px]">
          <div>
            <p className="serif text-[20px] leading-none">made by</p>
            <p className="text-warmgray mt-1">For artists.</p>
          </div>
          <div className="flex flex-col gap-1.5 text-warmgray">
            <Link href="/explore" className="hover:text-ink">Explore</Link>
            <Link href="/about" className="hover:text-ink">About</Link>
            <Link href="/pricing" className="hover:text-ink">Pricing</Link>
          </div>
          <div className="flex flex-col gap-1.5 text-warmgray">
            <Link href="/about" className="hover:text-ink">Privacy</Link>
            <Link href="/about" className="hover:text-ink">Terms</Link>
          </div>
          <p className="text-warmgray md:text-right">© 2026 Made by</p>
        </div>
        {!minimal && (
          <p className="text-center mt-10 text-[12px] text-warmgray">made by</p>
        )}
      </div>
    </footer>
  );
}

export function SiteTopbar({ right }: { right?: React.ReactNode }) {
  return (
    <header className="border-b hairline">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        <MadeByMark />
        <div className="flex items-center gap-5 text-[13px]">{right}</div>
      </div>
    </header>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="border border-line px-8 py-14 text-center">
      <p className="serif text-3xl mb-2">{title}</p>
      <p className="text-[13px] text-warmgray mb-6">{body}</p>
      {action}
    </div>
  );
}

export function Toast({ msg }: { msg: string }) {
  if (!msg) return null;
  return <div role="status" className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-ink text-paper text-[13px] px-4 py-2.5 shadow-lg z-50">{msg}</div>;
}
