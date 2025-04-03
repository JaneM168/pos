"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, ShoppingBag, Tag, Settings, LogOut, Menu, X, Utensils } from "lucide-react"
import { useState } from "react"
import { signOut } from "next-auth/react"

export function AdminSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const routes = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
      active: pathname === "/admin",
    },
    {
      href: "/admin/orders",
      label: "Orders",
      icon: ShoppingBag,
      active: pathname === "/admin/orders",
    },
    {
      href: "/admin/menu",
      label: "Menu Management",
      icon: Tag,
      active: pathname === "/admin/menu",
    },
    {
      href: "/admin/diagnostics",
      label: "System Diagnostics",
      icon: Settings,
      active: pathname === "/admin/diagnostics",
    },
    {
      href: "/admin/settings",
      label: "Settings",
      icon: Settings,
      active: pathname === "/admin/settings",
    },
  ]

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-background border-r transform transition-transform duration-200 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center h-16 px-6 border-b">
            <Utensils className="h-5 w-5 text-red-600 mr-2" />
            <h1 className="text-xl font-bold text-red-600">Sushi Café Admin</h1>
          </div>
          <div className="flex-1 overflow-auto py-4 px-3">
            <nav className="space-y-1">
              {routes.map((route) => (
                <Link key={route.href} href={route.href} onClick={() => setIsOpen(false)}>
                  <Button variant={route.active ? "secondary" : "ghost"} className="w-full justify-start">
                    <route.icon className="mr-2 h-4 w-4" />
                    {route.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
          <div className="p-4 border-t">
            <Button variant="ghost" className="w-full justify-start" onClick={() => signOut({ callbackUrl: "/" })}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

