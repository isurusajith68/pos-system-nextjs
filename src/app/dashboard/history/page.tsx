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
import { ScrollArea } from "@/components/ui/scroll-area";

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

  const filteredBills = billHistory.filter(
    (bill) =>
      bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.date.includes(searchTerm) ||
      bill.cashier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const BillDetails = ({ bill }: { bill: (typeof billHistory)[0] }) => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <p className="font-semibold">Date:</p>
        <p>{bill.date}</p>
        <p className="font-semibold">Time:</p>
        <p>{bill.time}</p>
        <p className="font-semibold">Cashier:</p>
        <p>{bill.cashier}</p>
        <p className="font-semibold">Total:</p>
        <p>${bill.total.toFixed(2)}</p>
        <p className="font-semibold">Cash:</p>
        <p>${bill.cash.toFixed(2)}</p>
        <p className="font-semibold">Change:</p>
        <p>${bill.change.toFixed(2)}</p>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-2xl font-bold mb-6 md:text-3xl">Bill History</h1>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-64">
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

      {/* Mobile View */}
      <div className="block md:hidden space-y-4">
        {filteredBills.map((bill) => (
          <Card key={bill.id} className="w-full">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{bill.billNumber}</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-secondary"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="text-xl">
                        Bill Details - {bill.billNumber}
                      </DialogTitle>
                      <DialogDescription>
                        Detailed information about the selected bill.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                      <BillDetails bill={bill} />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-muted-foreground">Date & Time:</div>
                <div>
                  {bill.date} {bill.time}
                </div>
                <div className="text-muted-foreground">Cashier:</div>
                <div>{bill.cashier}</div>
                <div className="text-muted-foreground">Total:</div>
                <div className="font-medium">${bill.total.toFixed(2)}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <Card>
          <CardHeader>
            <CardTitle>Bills</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
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
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-medium">
                      {bill.billNumber}
                    </TableCell>
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
                            className="hover:bg-secondary"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle className="text-xl">
                              Bill Details - {bill.billNumber}
                            </DialogTitle>
                            <DialogDescription>
                              Detailed information about the selected bill.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="mt-4">
                            <BillDetails bill={bill} />
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
    </div>
  );
};

export default BillHistoryPage;
