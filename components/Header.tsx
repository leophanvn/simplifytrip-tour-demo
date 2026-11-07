"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FlagVN, Icon } from "./Icon";
import { ComingSoonButton } from "./ComingSoon";

const NAV = [
  { label: "SIM Vật Lý", href: "https://simplifytrip.com/" },
  { label: "eSIM", href: "https://simplifytrip.com/" },
  { label: "Tour", href: "/tour", isNew: true },
  { label: "Visa", href: "#visa", isNew: true },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header className="relative z-30 border-b border-line-soft bg-white">
      <div className="flex h-14 items-center justify-between gap-6 px-4 lg:h-[60px] lg:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-5">
          <Link href="/tour" aria-label="Simplify Trip – Trang chủ">
            <Image src="/brand/logo.png" alt="Simplify Trip" width={120} height={32} className="h-7 w-auto lg:h-8" priority />
          </Link>
          <label className="hidden h-[38px] w-[260px] items-center gap-2 rounded-md bg-n50 px-3 text-sm text-subtle xl:flex">
            <Icon name="search" />
            <input className="w-full bg-transparent outline-none placeholder:text-subtle" placeholder="Hôm nay bạn đi đâu..." />
          </label>
        </div>

        <nav aria-label="Dịch vụ" className="hidden items-center gap-6 lg:flex">
          {NAV.map((n) => {
            const active = n.href === "/tour" && pathname.startsWith("/tour");
            return (
              <Link
                key={n.label}
                href={n.href}
                className={`relative flex h-[60px] items-center text-[15px] ${
                  active ? "border-b-2 border-brand font-semibold text-brand" : "font-medium text-ink hover:text-brand"
                }`}
              >
                {n.label}
                {n.isNew && !active && (
                  <span className="relative -top-2 ml-1 rounded bg-orange px-1 text-[10px] leading-4 font-bold text-white">MỚI</span>
                )}
              </Link>
            );
          })}
          <span className="flex items-center gap-1 text-[15px] font-medium">
            Sản phẩm khác <Icon name="down" size={14} />
          </span>
          <a href="https://simplifytrip.com/" className="text-[15px] font-medium text-ink hover:text-brand">
            Liên Hệ
          </a>
        </nav>

        <div className="flex items-center">
          <ComingSoonButton feature="Giỏ hàng" ariaLabel="Giỏ hàng" className="relative flex h-11 w-10 items-center justify-center">
            <Icon name="cart" size={22} />
            <span className="absolute top-1 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              2
            </span>
          </ComingSoonButton>
          <button aria-label="Thông báo" className="hidden h-11 w-10 items-center justify-center lg:flex">
            <Icon name="bell" size={22} />
          </button>
          <span className="hidden px-2 lg:flex">
            <FlagVN />
          </span>
          <span className="hidden items-center gap-2 pl-1.5 lg:flex">
            <span className="flex size-8 items-center justify-center rounded-full bg-green-50 text-brand">
              <Icon name="user" size={18} />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-[11px] text-total">Đại lý cấp 4</span>
              <span className="text-[13px] font-semibold">Tài khoản demo</span>
            </span>
          </span>
          <button
            aria-label="Mở menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="flex h-11 w-11 items-center justify-center lg:hidden"
          >
            <Icon name="menu" size={22} />
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button aria-label="Đóng menu" className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute top-0 right-0 flex h-full w-[82%] max-w-[320px] flex-col bg-white shadow-hover">
            <div className="flex h-14 items-center justify-between border-b border-line-soft px-4">
              <span className="text-sm font-semibold">Menu</span>
              <button aria-label="Đóng menu" onClick={() => setOpen(false)} className="flex size-11 items-center justify-center">
                <Icon name="x" size={20} />
              </button>
            </div>
            <nav className="flex flex-col p-2" aria-label="Dịch vụ">
              {[...NAV, { label: "Sản phẩm khác", href: "#" }, { label: "Liên Hệ", href: "https://simplifytrip.com/" }].map((n) => (
                <Link key={n.label} href={n.href} className="flex min-h-12 items-center gap-2 rounded-md px-3 text-[15px] font-medium hover:bg-n50">
                  {n.label}
                  {"isNew" in n && n.isNew && <span className="rounded bg-orange px-1 text-[10px] font-bold text-white">MỚI</span>}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
