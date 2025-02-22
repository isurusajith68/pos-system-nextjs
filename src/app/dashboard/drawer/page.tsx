"use client";
import React, { useEffect } from "react";
import { DollarSign, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { getAllCash } from "@/services/cash";
import { Card, CardContent } from "@/components/ui/card";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "LKR",
  }).format(amount);
}

const DrawerCard = ({ record }) => {
  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="font-medium">{record.date}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="text-sm text-muted-foreground">Cash</div>
            <div className="text-sm font-medium text-right">
              {record.cash ? formatCurrency(record.cash) : "N/A"}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="text-sm text-muted-foreground">Daily Revenue</div>
            <div className="text-sm font-medium text-right">
              {record.dailyRevenue
                ? formatCurrency(record.dailyRevenue)
                : "N/A"}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="text-sm text-muted-foreground">Expected Cash</div>
            <div className="text-sm font-medium text-right">
              {record.expectedCash
                ? formatCurrency(record.expectedCash)
                : "N/A"}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="text-sm text-muted-foreground">Declared Cash</div>
            <div className="text-sm font-medium text-right">
              {record.declaredCash
                ? formatCurrency(record.declaredCash)
                : "N/A"}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t">
            <div className="text-sm font-medium">Variance</div>
            <div
              className={`text-sm font-medium text-right ${
                record.variance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {record.variance ? formatCurrency(record.variance) : "N/A"}
              {record.variance >= 0 ? (
                <TrendingUp className="h-4 w-4 inline ml-1" />
              ) : (
                <TrendingDown className="h-4 w-4 inline ml-1" />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

function App() {
  const [drawerHistory, setDrawerHistory] = React.useState([]);

  useEffect(() => {
    fetchDrawerHistory();
  }, []);

  const fetchDrawerHistory = async () => {
    try {
      const response = await getAllCash();

      if (response.success) {
        setDrawerHistory(response.cashData);
      } else {
        console.error("Failed to fetch drawer history:");
      }
    } catch (error) {
      console.error("Error fetching drawer history:", error);
    }
  };

  return (
    <div className="">
      <div className="container mx-auto sm:p-4 max-w-8xl">
        <h1 className="text-xl font-bold tracking-tight">Drawer History</h1>

        <div className="sm:hidden mt-6">
          {drawerHistory.map((record, index) => (
            <DrawerCard key={index} record={record} />
          ))}
        </div>

        <div className="hidden sm:block mt-6">
          <div className="ring-1 ring-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Cash
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Daily Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Expected Cash
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Declared Cash
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Variance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {drawerHistory.map((record, index) => (
                    <tr
                      key={index}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          {record.date}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {record.cash ? formatCurrency(record.cash) : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {record.dailyRevenue
                          ? formatCurrency(record.dailyRevenue)
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {record.expectedCash
                          ? formatCurrency(record.expectedCash)
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {record.declaredCash
                          ? formatCurrency(record.declaredCash)
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div
                          className={`flex items-center ${
                            record.variance >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {record.variance
                            ? formatCurrency(record.variance)
                            : "N/A"}
                          {record.variance >= 0 ? (
                            <TrendingUp className="h-4 w-4 ml-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 ml-1" />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
