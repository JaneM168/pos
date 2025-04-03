"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

export function OrderFilters() {
  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <div className="flex w-full items-center space-x-2 md:w-auto">
        <Input placeholder="Search orders..." className="h-9 md:w-[300px]" />
        <Button size="sm" className="h-9 px-4">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>
      <div className="flex flex-1 items-center space-x-2">
        <Select defaultValue="all">
          <SelectTrigger className="h-9 w-full md:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="today">
          <SelectTrigger className="h-9 w-full md:w-[180px]">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

