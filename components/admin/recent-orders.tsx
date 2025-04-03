"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function RecentOrders() {
  const orders = [
    {
      id: "ORD-001",
      customer: "John Doe",
      initials: "JD",
      status: "completed",
      total: "$45.00",
      items: 3,
      date: "2 minutes ago",
    },
    {
      id: "ORD-002",
      customer: "Jane Smith",
      initials: "JS",
      status: "processing",
      total: "$27.50",
      items: 2,
      date: "15 minutes ago",
    },
    {
      id: "ORD-003",
      customer: "Robert Johnson",
      initials: "RJ",
      status: "pending",
      total: "$32.75",
      items: 4,
      date: "45 minutes ago",
    },
    {
      id: "ORD-004",
      customer: "Emily Davis",
      initials: "ED",
      status: "completed",
      total: "$19.99",
      items: 1,
      date: "1 hour ago",
    },
    {
      id: "ORD-005",
      customer: "Michael Wilson",
      initials: "MW",
      status: "completed",
      total: "$52.25",
      items: 5,
      date: "2 hours ago",
    },
  ]

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{order.initials}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{order.customer}</p>
            <p className="text-sm text-muted-foreground">
              {order.items} items · {order.date}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge
              variant={
                order.status === "completed" ? "default" : order.status === "processing" ? "secondary" : "outline"
              }
            >
              {order.status}
            </Badge>
            <div className="font-medium">{order.total}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

