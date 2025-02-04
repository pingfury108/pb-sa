"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  {
    title: "主页",
    href: "/",
  },
  {
    title: "仪表盘",
    href: "/dashboard",
  },
  {
    title: "设置",
    href: "/settings",
  },
  {
    title: "百度教育AI助手",
    href: "/bedu",
  },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col space-y-1">
      {navigation.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            pathname === item.href
              ? "bg-accent text-accent-foreground"
              : "transparent"
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
