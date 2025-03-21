"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  LineChart,
} from "recharts";
import {
  Package,
  Users,
  ListIcon as Category,
  DollarSign,
  AlertCircle,
  Loader,
  CheckCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  getBillStats,
  getDailySales,
  getLastBillNumber,
  lowStockProducts,
  salesDataWeekly,
} from "../../services/bill";
import { useStats } from "@/store/useStats";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast, useToast } from "@/hooks/use-toast";
import { getCash, starterCash, updateCash } from "../../services/cash";
import { Toaster } from "@/components/ui/toaster";
import { useCashDrawer } from "@/store/useCashDrawer";
import { useSalesData } from "@/store/useSalesData";
import Link from "next/link";
import { usePermissionStore } from "@/store/usePremissionStore";
import PermissionGuard from "@/components/PermissionGuard/PermissionGuard";

const salesData = [
  { day: "Mon", sales: 1000 },
  { day: "Tue", sales: 1200 },
  { day: "Wed", sales: 900 },
  { day: "Thu", sales: 1500 },
  { day: "Fri", sales: 2000 },
  { day: "Sat", sales: 1800 },
  { day: "Sun", sales: 1300 },
];

const DashboardPage = () => {
  const dateTimeRef = React.useRef<HTMLSpanElement>(null);
  const [time, setTime] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [lowStockProductsList, setLowStockProductsList] = useState([]);
  const { permissions } = usePermissionStore();
  const {
    setDeclaredCash,
    setIsDayEnded,
    setIsDayStarted,
    setIsDrawerOpen,
    setStartingCash,
    setVariance,
    startingCash,
    declaredCash,
    expectedCash,
    setExpectedCash,
    variance,
    isDayEnded,
    isDayStarted,
    isDrawerOpen,
  } = useCashDrawer();
  const {
    totalRevenue,
    totalUsers,
    totalProducts,
    totalCategories,
    totalSales,
    setTotalRevenue,
    setTotalBills,
    setTotalUsers,
    setTotalProducts,
    setTotalCategories,
    setTotalSales,
  } = useStats();
  const { toast } = useToast();

  const {
    salesData,
    setSalesData,
    isLoading: salesDataLoading,
    setIsLoading: setIsSalesDataLoading,
  } = useSalesData() as {
    salesData: { _id: string; total: number; billCount: number }[];
    setSalesData: (
      data: { _id: string; total: number; billCount: number }[]
    ) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
  };
  useEffect(() => {
    if (localStorage.getItem("theme") === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }

    lowStockProductsFetch();
    const lastBillNumber = localStorage.getItem("lastBillNumber");
    if (lastBillNumber) {
      return;
    }
    fetchLastBillNumber();
    async function fetchLastBillNumber() {
      try {
        const result = await getLastBillNumber();
        if (result.success) {
          localStorage.setItem("lastBillNumber", result.billNumber.toString());
        } else {
          console.error("Failed to fetch last bill number:", result.error);
        }
      } catch (error) {
        console.error("Error fetching last bill number:", error);
      }
    }

    async function lowStockProductsFetch() {
      try {
        const result = await lowStockProducts();
        if (result.success) {
          setLowStockProductsList(result.lowStockProductData);
        } else {
          console.error("Failed to fetch low stock products:", result.error);
        }
      } catch (error) {
        console.error("Error fetching low stock products:", error);
      }
    }
  }, []);
  useEffect(() => {
    const ex = totalRevenue + Number(startingCash);
    setExpectedCash(ex);

    const calculatedVariance = Number(declaredCash) - ex;
    setVariance(calculatedVariance);
  }, [expectedCash, declaredCash, startingCash, totalRevenue]);

  const handleStartDay = async () => {
    if (startingCash) {
      const result = await starterCash({
        cash: Number(startingCash),
        date: new Date().toISOString(),
      });
      if (result.success) {
        toast({
          title: "Cash Drawer Started",
          description: "Cash drawer has been started successfully.",
          className: "bg-green-500 border-green-500 text-white",
        });
      } else {
        toast({
          title: "Cash Drawer Error",
          description: "An error occurred while starting the cash drawer.",
          className: "bg-red-500 border-red-500 text-white",
        });
      }
      setIsDayStarted(true);
      setIsDrawerOpen(true);
    }
  };

  const handleEndDay = async () => {
    if (declaredCash) {
      setIsDayEnded(true);
      setIsDrawerOpen(false);
      const result = await updateCash({
        cash: Number(startingCash),
        date: new Date().toISOString(),
        declaredCash: Number(declaredCash),
        dailyRevenue: totalRevenue,
        expectedCash,
        variance,
      });
      if (result.success) {
        toast({
          title: "Cash Drawer Ended",
          description: "Cash drawer has been ended successfully.",
          className: "bg-green-500 border-green-500 text-white",
        });
      } else {
        toast({
          title: "Cash Drawer Error",
          description: "An error occurred while ending the cash drawer.",
          className: "bg-red-500 border-red-500 text-white",
        });
      }
    }
  };

  useEffect(() => {
    setIsLoading(true);

    Promise.all([getBillStats(), getCash({ date: new Date().toISOString() })])
      .then(([billStats, cashData]) => {
        if (billStats.success) {
          setTotalRevenue(billStats.totalRevenue);
          setTotalSales(billStats.totalSales);
          setTotalUsers(billStats.totalUsers);
          setTotalProducts(billStats.totalProducts);
          setTotalCategories(billStats.totalCategories);

          const ec = billStats.totalRevenue + Number(startingCash);
          setExpectedCash(ec);
        }

        if (cashData.success) {
          setIsDayStarted(cashData?.cash?.isDayStarted || false);
          setIsDrawerOpen(cashData?.cash?.isDrawerOpen || false);
          setIsDayEnded(cashData?.cash?.isDayEnded || false);
          setStartingCash(cashData?.cash?.cash || "");
          setDeclaredCash(cashData?.cash?.declaredCash || "");
          setVariance(cashData?.cash?.variance || 0);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  React.useEffect(() => {
    const secondsTimer = setInterval(() => {
      if (dateTimeRef.current) {
        dateTimeRef.current.innerText = new Date().toLocaleString();
      }
    }, 1000);
    return () => clearInterval(secondsTimer);
  }, []);

  React.useEffect(() => {
    if (salesData && salesData.length > 0) {
      return;
    }
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    setIsSalesDataLoading(true);
    try {
      const sales = await salesDataWeekly();
      setIsSalesDataLoading(false);
      setSalesData(sales);
    } catch (error) {
      setIsSalesDataLoading(false);
      console.error("Error fetching sales data:", error);
    }
  };
  const dayOrder = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const sortedSalesData = salesData.sort(
    (a: { _id: string }, b: { _id: string }) => {
      return dayOrder.indexOf(a._id) - dayOrder.indexOf(b._id);
    }
  );
  return (
    <div className="container mx-auto sm:p-4 space-y-4 max-w-full">
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <PermissionGuard module="dashboard" action="view_total_products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Products
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  Total number of products available in the inventory.
                </p>
              </CardContent>
            </Card>
          </PermissionGuard>{" "}
          <PermissionGuard module="dashboard" action="view_total_categories">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Categories
                </CardTitle>
                <Category className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCategories}</div>
                <p className="text-xs text-muted-foreground">
                  Number of product categories in the system.
                </p>
              </CardContent>
            </Card>
          </PermissionGuard>
          <PermissionGuard module="dashboard" action="view_daily_sales">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Daily Sales
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSales}</div>
                <p className="text-xs text-muted-foreground">
                  Total sales made in the current period.
                </p>
              </CardContent>
            </Card>
          </PermissionGuard>
          <PermissionGuard module="dashboard" action="view_daily_total_revenue">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Daily Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Rs {totalRevenue}</div>
                <p className="text-xs text-muted-foreground">
                  Total revenue generated in the current period.
                </p>
              </CardContent>
            </Card>
          </PermissionGuard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <PermissionGuard module="dashboard" action="view_cash_drawer">
            <Card>
              {isLoading ? (
                <div className="flex justify-center items-center py-5">
                  <Loader className="h-6 w-6 text-primary animate-spin" />
                </div>
              ) : (
                <>
                  <CardHeader>
                    <CardTitle className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                      <div>
                        <span className="text-sm font-medium">
                          Cash Drawer Management
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {" "}
                          (Today){" "}
                        </span>
                      </div>
                      <div>
                        <span
                          className="text-xs text-muted-foreground"
                          ref={dateTimeRef}
                        ></span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6">
                    {!isDayStarted ? (
                      <div className="space-y-4">
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Start your day by entering the starting cash amount
                            in the drawer.
                          </AlertDescription>
                        </Alert>
                        <div className="space-y-2">
                          <label className="text-xs text-muted-foreground">
                            Starting Cash
                          </label>
                          <input
                            type="number"
                            className="w-full px-3 py-2 border rounded-md bg-gray-100 text-muted-foreground"
                            value={startingCash}
                            onChange={(e) => setStartingCash(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            The amount of money in the cash drawer at the start
                            of the day.
                          </p>
                        </div>

                        <Button
                          className="w-full"
                          onClick={handleStartDay}
                          disabled={!startingCash}
                        >
                          Start Day
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <label className="text-xs text-muted-foreground">
                              Starting Cash
                            </label>
                            <input
                              type="number"
                              className="w-full px-3 py-2 border rounded-md bg-gray-100 text-muted-foreground"
                              value={startingCash}
                              readOnly
                            />
                            <p className="text-xs text-muted-foreground">
                              The amount of money in the cash drawer at the
                              start of the day.
                            </p>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs text-muted-foreground">
                              Today's Revenue
                            </label>
                            <input
                              className="w-full px-3 py-2 border rounded-md bg-gray-100 text-muted-foreground"
                              value={totalRevenue}
                              readOnly
                            />
                            <p className="text-xs text-muted-foreground">
                              Total revenue generated from sales today.
                            </p>
                          </div>
                        </div>

                        <div className="mb-2">
                          <label className="text-xs text-muted-foreground">
                            Expected Cash
                          </label>
                          <input
                            type="number"
                            className="w-full px-3 py-2 border rounded-md bg-gray-100 text-muted-foreground"
                            value={expectedCash}
                            readOnly
                          />
                          <p className="text-xs text-muted-foreground">
                            The cash amount that should be available in the
                            drawer.
                          </p>
                        </div>

                        <div className="mb-2">
                          <label className="text-xs text-muted-foreground">
                            Declared Cash
                          </label>
                          <input
                            type="number"
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-muted-foreground"
                            placeholder="Enter declared cash"
                            value={declaredCash}
                            onChange={(e) => setDeclaredCash(e.target.value)}
                            readOnly={isDayEnded}
                          />
                          <p className="text-xs text-muted-foreground">
                            The cash amount that you are declaring for the day,
                            which should match the cash available in the drawer.
                          </p>
                        </div>

                        {!isDayEnded && (
                          <>
                            <div className="text-2xl font-bold">
                              Variance:{" "}
                              <span
                                className={
                                  variance < 0
                                    ? "text-red-600"
                                    : "text-green-600"
                                }
                              >
                                Rs {variance}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Difference between expected cash and declared
                              cash.
                            </p>
                            <Button
                              className="w-full"
                              onClick={handleEndDay}
                              disabled={!declaredCash}
                            >
                              End Day
                            </Button>
                          </>
                        )}

                        {isDayEnded && (
                          <Alert className="bg-green-50 border-green-200">
                            <AlertCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription
                              className={
                                variance < 0 ? "text-red-600" : "text-green-600"
                              }
                            >
                              Day has been ended successfully. Final variance:
                              Rs {variance}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
                  </CardContent>
                </>
              )}
            </Card>
          </PermissionGuard>
          <PermissionGuard module="dashboard" action="view_low_stock_alerts">
            {lowStockProductsList.length > 0 && (
              <Card className="p-5">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <AlertCircle className="text-yellow-500" /> Low Stock Alerts
                  </h2>
                  <Link
                    href="/dashboard/stock"
                    className="text-xs text-primary underline"
                  >
                    Add Inventory
                  </Link>
                </div>

                {lowStockProductsList.length > 0 ? (
                  <ul className="mt-4 space-y-3">
                    {lowStockProductsList.map((item) => (
                      <li
                        key={item._id}
                        className="flex justify-between items-center p-3 bg-red-100 rounded-lg"
                      >
                        <span className="text-gray-700">
                          <strong>{item.ingredientName}</strong> is low on stock
                          ({item.currentQuantity} {item.unitOfMeasurement} left)
                        </span>
                        <span className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-200 rounded">
                          Low
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-4 flex items-center gap-2 text-green-600">
                    <CheckCircle className="text-green-500" />
                    <p className="font-medium">
                      All stock levels are sufficient.
                    </p>
                  </div>
                )}
              </Card>
            )}
          </PermissionGuard>
          <PermissionGuard module="dashboard" action="view_weekly_sales">
            <Card className="max-sm:p-0 p-0">
              {salesDataLoading ? (
                <div className="flex justify-center items-center py-5">
                  <Loader className="h-6 w-6 text-primary animate-spin" />
                </div>
              ) : (
                <>
                  {sortedSalesData.length > 0 ? (
                    <>
                      <CardHeader>
                        <CardTitle>Weekly Sales & Bill Count</CardTitle>
                      </CardHeader>
                      <CardContent className="h-[350px] sm:h-[400px] p-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={sortedSalesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="_id" />
                            <YAxis yAxisId="left" stroke="#8884d8" />{" "}
                            <YAxis
                              yAxisId="right"
                              orientation="right"
                              stroke="#82ca9d"
                            />{" "}
                            <Tooltip
                              contentStyle={{
                                backgroundColor: darkMode ? "black" : "white",
                              }}
                            />
                            <Line
                              yAxisId="left"
                              type="monotone"
                              dataKey="total"
                              stroke="#8884d8"
                              strokeWidth={2}
                            />{" "}
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="billCount"
                              stroke="#82ca9d"
                              strokeWidth={2}
                            />{" "}
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </>
                  ) : (
                    <div className="flex justify-center items-center py-5">
                      No data available
                    </div>
                  )}
                </>
              )}
            </Card>
          </PermissionGuard>
        </div>
      </>
      <Toaster />
    </div>
  );
};

export default DashboardPage;
