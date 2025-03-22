"use client";

import { getStocks } from "@/services/stock";
import StockHeader from "./components/stock-header";
import StockList from "./components/stock-list";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import PermissionGuard from "@/components/PermissionGuard/PermissionGuard";

export default function StockPage() {
  const [stocks, setStocks] = useState<any[]>([]);
  const [reFetch, setReFetch] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    getStocks(
      Object.fromEntries(searchParams as any) as {
        category?: string;
        search?: string;
        lowStock?: string;
      }
    ).then((data) => setStocks(data));
  }, [
    searchParams.get("category"),
    searchParams.get("search"),
    searchParams.get("lowStock"),
    reFetch,
  ]);

  return (
    <div className="mx-auto sm:p-5">
      <StockHeader setReFetch={setReFetch} />
      <PermissionGuard module="stock_management" action="view_stock">
        <StockList stocks={stocks || []} setRefetch={setReFetch} />
      </PermissionGuard>
    </div>
  );
}
