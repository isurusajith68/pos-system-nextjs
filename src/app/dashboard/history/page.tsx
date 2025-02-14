"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Search } from "lucide-react";

// Mock data for bill history
const billHistory = [
  {
    id: 1,
    billNumber: "BILL001",
    date: "2023-06-01",
    time: "14:30",
    cashier: "John Doe",
    total: 45.99,
    cash: 50.0,
    change: 4.01,
  },
  {
    id: 2,
    billNumber: "BILL002",
    date: "2023-06-02",
    time: "11:15",
    cashier: "Jane Smith",
    total: 32.5,
    cash: 35.0,
    change: 2.5,
  },
  {
    id: 3,
    billNumber: "BILL003",
    date: "2023-06-03",
    time: "18:45",
    cashier: "Mike Johnson",
    total: 78.25,
    cash: 80.0,
    change: 1.75,
  },
  {
    id: 4,
    billNumber: "BILL004",
    date: "2023-06-04",
    time: "09:20",
    cashier: "Sarah Brown",
    total: 22.99,
    cash: 25.0,
    change: 2.01,
  },
  {
    id: 5,
    billNumber: "BILL005",
    date: "2023-06-05",
    time: "20:10",
    cashier: "Chris Lee",
    total: 55.75,
    cash: 60.0,
    change: 4.25,
  },
];

const BillHistoryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBill, setSelectedBill] = useState(null);

  const filteredBills = billHistory.filter(
    (bill) =>
      bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.date.includes(searchTerm) ||
      bill.cashier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-2">
      <h1 className="text-xl font-bold mb-6">Bill History</h1>

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <Input
            type="text"
            placeholder="Search bills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bills</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill Number</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Cashier</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Cash</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBills.map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell>{bill.billNumber}</TableCell>
                  <TableCell>{bill.date}</TableCell>
                  <TableCell>{bill.time}</TableCell>
                  <TableCell>{bill.cashier}</TableCell>
                  <TableCell>${bill.total.toFixed(2)}</TableCell>
                  <TableCell>${bill.cash.toFixed(2)}</TableCell>
                  <TableCell>${bill.change.toFixed(2)}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedBill(bill)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Bill Details - {bill.billNumber}
                          </DialogTitle>
                          <DialogDescription>
                            Detailed information about the selected bill.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4">
                          <p>
                            <strong>Date:</strong> {bill.date}
                          </p>
                          <p>
                            <strong>Time:</strong> {bill.time}
                          </p>
                          <p>
                            <strong>Cashier:</strong> {bill.cashier}
                          </p>
                          <p>
                            <strong>Total:</strong> ${bill.total.toFixed(2)}
                          </p>
                          <p>
                            <strong>Cash:</strong> ${bill.cash.toFixed(2)}
                          </p>
                          <p>
                            <strong>Change:</strong> ${bill.change.toFixed(2)}
                          </p>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillHistoryPage;
