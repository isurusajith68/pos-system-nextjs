"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import StockForm from "./stock-form";

export default function StockHeader({ setReFetch }: { setReFetch: any }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  return (
    <div className="mb-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Stock Management</h1>
        <div>
          <StockForm  setReFetch={setReFetch} />
          <Button
            onClick={() => router.push("/dashboard/stock/stock-activity")}
            className="ml-4"
            variant="outline"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Stock Activity
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search stocks..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              router.push(`?${createQueryString("search", e.target.value)}`);
            }}
            className="pl-9"
          />
        </div>
        <Select
          defaultValue={searchParams.get("category") || "all"}
          onValueChange={(value) =>
            router.push(`?${createQueryString("category", value)}`)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="dairy">Dairy</SelectItem>
            <SelectItem value="meat">Meat</SelectItem>
            <SelectItem value="vegetables">Vegetables</SelectItem>
            <SelectItem value="fruits">Fruits</SelectItem>
            <SelectItem value="grains">Grains</SelectItem>
            <SelectItem value="spices">Spices</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
