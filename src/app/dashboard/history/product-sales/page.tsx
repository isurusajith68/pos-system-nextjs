"use client";
import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useAuthStore } from "@/store/useAuthStore";
import { useBillStore } from "@/store/useBillStore";
import { Button } from "@/components/ui/button";
import { IoReload } from "react-icons/io5";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const ITEMS_PER_PAGE = 10;

const ProductSales = () => {
  const { user } = useAuthStore();
  const { fetchBills, billHistory } = useBillStore();
  const [salesProduct, setSalesProduct] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [date, setDate] = useState(null);
  useEffect(() => {
    if (billHistory.length > 0) {
      // Format selected date from input (YYYY-MM-DD)
      const formattedDate = date
        ? new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
          })
        : null;

      const filteredBills = billHistory.filter((bill) => {
        if (!date) return true;

        const billDate = new Date(bill.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        });

        return billDate === formattedDate;
      });

      console.log("Formatted Date:", formattedDate);
      console.log("Filtered Bills:", filteredBills);

      const products = filteredBills.flatMap((bill) => bill.cart);

      const sales = products.reduce((acc, product) => {
        const existingProduct = acc.find((p) => p.id === product.id);
        if (existingProduct) {
          existingProduct.quantity += product.quantity;
        } else {
          acc.push({ ...product });
        }
        return acc;
      }, []);

      const sortedSales = sales.sort((a, b) => b.quantity - a.quantity);
      setSalesProduct(sortedSales);
    }
  }, [billHistory, date]);

  useEffect(() => {
    fetchBills();
  }, [user]);

  const totalQuantity = salesProduct.reduce(
    (sum, product) => sum + product.quantity,
    0
  );

  const totalPages = Math.ceil(salesProduct.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = salesProduct.slice(startIndex, endIndex);

  const chartData = currentProducts.slice(0, 10).map((product) => ({
    name: product.name,
    value: product.quantity,
  }));

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 2;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => handlePageChange(1)}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        items.push(
          <PaginationItem key="start-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <PaginationItem key={page}>
          <PaginationLink
            onClick={() => handlePageChange(page)}
            isActive={currentPage === page}
            className="cursor-pointer"
          >
            {page}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="end-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => handlePageChange(totalPages)}
            className="cursor-pointer"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center justify-between">
            Product Sales Overview
            <div className="flex items-center text-sm font-thin">
              <input
                type="date"
                className="border border-gray-300 rounded-md p-2"
                onChange={(e) => setDate(e.target.value)}
              />
              <Button
                className="ml-4"
                variant="outline"
                onClick={() => history.back()}
              >
                Back
              </Button>
              <IoReload className="ml-4" onClick={() => setDate(null)} />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead className="text-center">Product</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-center">% of Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentProducts.map((product, index) => (
                    <TableRow key={product.id}>
                      <TableCell>{startIndex + index + 1}</TableCell>
                      <TableCell className="font-medium text-center">
                        {product.name}
                      </TableCell>
                      <TableCell className="text-center">
                        {product.quantity}
                      </TableCell>
                      <TableCell className="text-center">
                        {((product.quantity / totalQuantity) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            handlePageChange(Math.max(1, currentPage - 1))
                          }
                          className={
                            currentPage === 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>

                      {getPaginationItems()}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            handlePageChange(
                              Math.min(totalPages, currentPage + 1)
                            )
                          }
                          className={
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductSales;
