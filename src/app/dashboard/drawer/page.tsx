"use client";
import React, { useEffect } from "react";
import { DollarSign, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { getAllCash } from "@/services/cash";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "LKR",
  }).format(amount);
}

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
    <div className="min-h-screen ">
      <div className="max-w-8xl mx-auto  py-6 sm:px-6 lg:px-5">
        <h1 className="text-xl font-bold ">Drawer History</h1>
      </div>

      <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-5 py-8">
        <div className=" shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y ">
              <thead className="">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                    Cash
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                    Daily Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                    Expected Cash
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                    Declared Cash
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                    Variance
                  </th>
                </tr>
              </thead>
              <tbody className=" divide-y ">
                {drawerHistory.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm ">
                      {record.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm ">
                      {record.cash ? formatCurrency(record.cash) : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm ">
                      {record.dailyRevenue
                        ? formatCurrency(record.dailyRevenue)
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm ">
                      {record.expectedCash
                        ? formatCurrency(record.expectedCash)
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm ">
                      {record.declaredCash
                        ? formatCurrency(record.declaredCash)
                        : "N/A"}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        record.variance >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {record.variance
                        ? formatCurrency(record.variance)
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
