"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/admin/overview"
import { RecentOrders } from "@/components/admin/recent-orders"

import { DollarSign, Users, ShoppingBag, TrendingUp, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AdminDashboard() {
  const [isInitializing, setIsInitializing] = useState(false)
  const [initSuccess, setInitSuccess] = useState<boolean | null>(null)
  const [initError, setInitError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleInitDb = async () => {
    setIsInitializing(true)
    setInitSuccess(null)
    setInitError(null)

    try {
      const response = await fetch("/api/init-db", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize database")
      }

      setInitSuccess(true)
      toast({
        title: "Success",
        description: "Database initialized successfully",
      })
    } catch (error) {
      console.error("Error initializing database:", error)
      setInitSuccess(false)
      setInitError((error as Error).message)
      toast({
        title: "Error",
        description: "Failed to initialize database",
        variant: "destructive",
      })
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Button variant="outline" size="sm" onClick={handleInitDb} disabled={isInitializing}>
          <Database className="mr-2 h-4 w-4" />
          {isInitializing ? "Initializing..." : "Initialize Database"}
        </Button>
      </div>

      {initSuccess === true && (
        <Alert className="bg-green-50 border-green-200">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>
            Database initialized successfully. Your menu items and categories are now ready to use.
          </AlertDescription>
        </Alert>
      )}

      {initSuccess === false && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{initError || "Failed to initialize database. Please try again."}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">+180.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">+19% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">+201 since last hour</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>You have received 12 orders today.</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentOrders />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

