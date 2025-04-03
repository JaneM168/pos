"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye } from "lucide-react"

export function OrderList() {
  const [orders, setOrders] = useState([
    {
      id: "ORD-001",
      customer: "John Doe",
      date: "2023-04-01T10:30:00",
      status: "completed",
      total: 45.0,
      items: 3,
    },
    {
      id: "ORD-002",
      customer: "Jane Smith",
      date: "2023-04-01T11:15:00",
      status: "processing",
      total: 27.5,
      items: 2,
    },
    {
      id: "ORD-003",
      customer: "Robert Johnson",
      date: "2023-04-01T12:45:00",
      status: "pending",
      total: 32.75,
      items: 4,
    },
    {
      id: "ORD-004",
      customer: "Emily Davis",
      date: "2023-04-01T13:20:00",
      status: "completed",
      total: 19.99,
      items: 1,
    },
    {
      id: "ORD-005",
      customer: "Michael Wilson",
      date: "2023-04-01T14:10:00",
      status: "completed",
      total: 52.25,
      items: 5,
    },
    {
      id: "ORD-006",
      customer: "Sarah Brown",
      date: "2023-04-01T15:30:00",
      status: "cancelled",
      total: 0.0,
      items: 0,
    },
    {
      id: "ORD-007",
      customer: "David Miller",
      date: "2023-04-01T16:45:00",
      status: "processing",
      total: 38.5,
      items: 3,
    },
  ])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "processing":
        return "secondary"
      case "pending":
        return "warning"
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Items</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id}</TableCell>
              <TableCell>{order.customer}</TableCell>
              <TableCell>{formatDate(order.date)}</TableCell>
              <TableCell>
                <Badge variant={getStatusColor(order.status) as any}>{order.status}</Badge>
              </TableCell>
              <TableCell>${order.total.toFixed(2)}</TableCell>
              <TableCell>{order.items}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>Update Status</DropdownMenuItem>
                    <DropdownMenuItem>Print Receipt</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

