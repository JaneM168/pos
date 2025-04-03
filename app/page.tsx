import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Settings, Utensils } from "lucide-react"
import Image from "next/image"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Utensils className="h-6 w-6 text-red-600" />
            <h1 className="text-xl font-bold text-red-600">Sushi Café POS</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/signin">
              <Button variant="outline">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="relative w-full h-64 rounded-lg overflow-hidden">
            <Image src="/images/counter.png" alt="Sushi Café" fill className="object-cover" priority />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <h2 className="text-4xl font-bold text-white">Welcome to Sushi Café</h2>
            </div>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col items-center justify-center p-8 border rounded-lg shadow-sm bg-card">
            <ShoppingCart className="h-12 w-12 mb-4 text-red-600" />
            <h2 className="text-xl font-semibold mb-2">Online Ordering</h2>
            <p className="text-center text-muted-foreground mb-4">Browse our menu and place orders for pickup</p>
            <Link href="/order">
              <Button className="bg-red-600 hover:bg-red-700">Order Now</Button>
            </Link>
          </div>
          <div className="flex flex-col items-center justify-center p-8 border rounded-lg shadow-sm bg-card">
            <Utensils className="h-12 w-12 mb-4 text-red-600" />
            <h2 className="text-xl font-semibold mb-2">Self-Service Kiosk</h2>
            <p className="text-center text-muted-foreground mb-4">
              Use our self-service kiosk for a quick ordering experience
            </p>
            <Link href="/kiosk">
              <Button className="bg-red-600 hover:bg-red-700">Start Kiosk</Button>
            </Link>
          </div>
          <div className="flex flex-col items-center justify-center p-8 border rounded-lg shadow-sm bg-card">
            <Settings className="h-12 w-12 mb-4 text-red-600" />
            <h2 className="text-xl font-semibold mb-2">Admin Dashboard</h2>
            <p className="text-center text-muted-foreground mb-4">
              Manage menu items, track orders, and view analytics
            </p>
            <Link href="/admin">
              <Button className="bg-red-600 hover:bg-red-700">Admin Access</Button>
            </Link>
          </div>
        </div>
      </main>
      <footer className="bg-muted py-6">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} Sushi Café POS System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

