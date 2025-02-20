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
} from "recharts";
import {
  Package,
  Users,
  ListIcon as Category,
  DollarSign,
  AlertCircle,
  Loader,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { getBillStats, getDailySales } from "@/services/bill";
import { useStats } from "@/store/useStats";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast, useToast } from "@/hooks/use-toast";
import { getCash, starterCash, updateCash } from "@/services/cash";
import { Toaster } from "@/components/ui/toaster";
import { useCashDrawer } from "@/store/useCashDrawer";

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

  useEffect(() => {
    const ex = totalRevenue + Number(startingCash);
    setExpectedCash(ex);

    const calculatedVariance = expectedCash - Number(declaredCash);
    setVariance(calculatedVariance);
  }, [expectedCash, declaredCash, startingCash, totalRevenue]);

  const handleStartDay = async () => {
    if (startingCash) {
      const result = await starterCash({
        cash: Number(startingCash),
        date: new Date().toISOString(),
      });
      console.log(result);
      if (result.success) {
        toast({
          title: "Cash Drawer Started",
          description: "Cash drawer has been started successfully.",
          className: "bg-green-500 border-green-500 text-white",
        });
      } else {
        console.log("Cash Drawer Error:", result.message);
        toast({
          title: "Cash Drawer Error",
          description: "An error occurred while starting the cash drawer.",
          className: "bg-red-500 border-red-500 text-white",
        });
      }
      setIsDayStarted(true);
      setIsDrawerOpen(true);

      console.log("Day Started with Starting Cash:", startingCash);
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

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
        Welcome to the Dashboard
      </h1>

      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Sales</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSales}</div>
              <p className="text-xs text-muted-foreground">
                Total sales made in the current period.
              </p>
            </CardContent>
          </Card>

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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
                          Start your day by entering the starting cash amount in
                          the drawer.
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
                          The amount of money in the cash drawer at the start of
                          the day.
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
                            The amount of money in the cash drawer at the start
                            of the day.
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
                                variance < 0 ? "text-red-600" : "text-green-600"
                              }
                            >
                              Rs {variance}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Difference between expected cash and declared cash.
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
                          <AlertDescription className="text-green-600">
                            Day has been ended successfully. Final variance: Rs{" "}
                            {variance}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </CardContent>
              </>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily Sales</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px] sm:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </>
      <Toaster />
    </div>
  );
};

export default DashboardPage;
