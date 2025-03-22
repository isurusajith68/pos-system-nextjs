"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import EditStockForm from "./stock-edit";
import { deleteStock } from "@/services/stock";
import { useRouter } from "next/navigation";
import PermissionGuard from "@/components/PermissionGuard/PermissionGuard";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function StockList({
  stocks,
  setRefetch,
}: {
  stocks: any[];
  setRefetch: any;
}) {
  const router = useRouter();
  return (
    <div className="w-full space-y-4">
      {/* Mobile View (Card Layout) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {stocks.map((stock) => (
          <div
            key={stock._id}
            className="rounded-lg border bg-card p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{stock.ingredientName}</h3>
              <StockStatus
                current={stock.currentQuantity}
                minimum={stock.minimumStockLevel}
                reorder={stock.reorderLevel}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Category</p>
                <p>{stock.category}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Quantity</p>
                <p>
                  {stock.currentQuantity} {stock.unitOfMeasurement}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Minimum Level</p>
                <p>{stock.minimumStockLevel}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Updated</p>
                <p>{format(new Date(stock.lastUpdated), "MMM d, yyyy")}</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <PermissionGuard module="stock_management" action="edit_stock">
                <Button variant="ghost" size="sm">
                  <EditStockForm stockData={stock} />
                </Button>
              </PermissionGuard>
              <PermissionGuard module="stock_management" action="delete_stock">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await deleteStock(stock._id);
                    setRefetch((prev: boolean) =>
                      typeof prev === "boolean" ? !prev : prev
                    );
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </PermissionGuard>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View (Table Layout) */}
      <div className="hidden md:block">
        <ScrollArea className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ingredient Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Minimum Stock Level</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stocks.map((stock) => (
                <TableRow key={stock._id}>
                  <TableCell className="font-medium">
                    {stock.ingredientName}
                  </TableCell>
                  <TableCell>{stock.category}</TableCell>
                  <TableCell>{stock.currentQuantity}</TableCell>
                  <TableCell>{stock.minimumStockLevel}</TableCell>
                  <TableCell>{stock.unitOfMeasurement}</TableCell>
                  <TableCell>
                    <StockStatus
                      current={stock.currentQuantity}
                      minimum={stock.minimumStockLevel}
                      reorder={stock.reorderLevel}
                    />
                  </TableCell>
                  <TableCell>
                    {format(new Date(stock.lastUpdated), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <PermissionGuard
                        module="stock_management"
                        action="edit_stock"
                      >
                        <Button variant="ghost" size="icon">
                          <EditStockForm stockData={stock} />
                        </Button>
                      </PermissionGuard>
                      <PermissionGuard
                        module="stock_management"
                        action="delete_stock"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={async () => {
                            await deleteStock(stock._id);
                            setRefetch((prev: boolean) =>
                              typeof prev === "boolean" ? !prev : prev
                            );
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </PermissionGuard>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
}

function StockStatus({
  current,
  minimum,
  reorder,
}: {
  current: number;
  minimum: number;
  reorder: number;
}) {
  if (current <= minimum) {
    return (
      <Badge variant="destructive" className="bg-red-100 text-red-800">
        Low Stock
      </Badge>
    );
  }
  if (current <= reorder) {
    return (
      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
        Reorder Soon
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="bg-green-100 text-green-800">
      In Stock
    </Badge>
  );
}
