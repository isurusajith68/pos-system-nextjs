"use client";

import { getStocks } from "@/services/stock";
import StockHeader from "./components/stock-header";
import StockList from "./components/stock-list";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function StockPage() {
  const [stocks, setStocks] = useState<any[]>([]);
  const [reFetch, setReFetch] = useState(false);
  const searchParams = useSearchParams();
  console.log(searchParams);

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
    <div className="container mx-auto p-5">
      <StockHeader setReFetch={setReFetch} />
      <StockList stocks={stocks || []}  setRefetch={setReFetch}/>
    </div>
  );
}
