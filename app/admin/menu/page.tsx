import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { MenuCategoryList } from "@/components/admin/menu/category-list"
import { MenuItemList } from "@/components/admin/menu/item-list"

export default function MenuManagement() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Menu Management</h2>
        <div className="flex items-center gap-2">
          <Button className="bg-red-600 hover:bg-red-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Category
          </Button>
          <Button className="bg-red-600 hover:bg-red-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Menu Item
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="text-xl font-semibold mb-4">Categories</h3>
          <MenuCategoryList />
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-4">Menu Items</h3>
          <MenuItemList />
        </div>
      </div>
    </div>
  )
}

