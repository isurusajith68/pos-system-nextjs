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

export default function StockList({
  stocks,
  setRefetch,
}: {
  stocks: any[];
  setRefetch: any;
}) {
  const router = useRouter();
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ingredient Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead> Quantity</TableHead>
            <TableHead>Minimum Stock Level</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Actions</TableHead>
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
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <EditStockForm stockData={stock} />
                  </Button>
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
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
