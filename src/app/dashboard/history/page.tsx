"use client";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ClockIcon,
  Delete,
  Eye,
  Search,
  Trash2,
} from "lucide-react";
import { getBillStats, refundBillAction, removeBill } from "@/services/bill";
import { useBillStore } from "@/store/useBillStore";
import { Popover } from "@radix-ui/react-popover";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  format,
  formatDate,
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
} from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RiRefundFill, RiResetRightLine } from "react-icons/ri";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ITEMS_PER_PAGE = 10;

const BillHistoryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const { fetchBills, billHistory } = useBillStore();
  const [spinning, setSpinning] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("theme") === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    fetchBills();
  }, []);

  const filteredBills = billHistory.filter((bill) => {
    const billDate = new Date(bill.date);
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    const isSearchMatch =
      bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.date.includes(searchTerm);

    const isMonthMatch = billDate >= monthStart && billDate <= monthEnd;

    const isDateMatch =
      (!startDate || new Date(bill.date) >= new Date(startDate)) &&
      (!endDate || new Date(bill.date) <= new Date(endDate));
    
      if (selectedDate) {
      const selectedDateObj = new Date(selectedDate);
      const billDateObj = new Date(bill.date);
      return (
        billDateObj.getDate() === selectedDateObj.getDate() &&
        billDateObj.getMonth() === selectedDateObj.getMonth() &&
        billDateObj.getFullYear() === selectedDateObj.getFullYear()
      );

      
    }

    return isSearchMatch && (startDate && endDate ? isDateMatch : isMonthMatch);
  });

  const totalPages = Math.ceil(filteredBills.length / ITEMS_PER_PAGE);
  const paginatedBills = filteredBills.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
    setCurrentPage(1);
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSpinning(true);
    setTimeout(() => {
      setStartDate("");
      setEndDate("");
      setSearchTerm("");
      setCurrentMonth(new Date());
      setCurrentPage(1);
      setSelectedDate("");
      setSpinning(false);
    }, 200);
  };

  const printBill = async (data: {
    totalBill: number;
    subTotal: number;
    discount: number;
    discountAmount: number;
    changeAmount: number;
    cashAmount: number;
    date: string;
    time: string;
    cart: { name: string; quantity: number; price: number }[];
    billNo: string;
  }) => {
    const bill = {
      totalBill: data.totalBill,
      subTotal: data.subTotal,
      discount: data.discount,
      discountAmount: data.discountAmount,
      changeAmount: data.changeAmount,
      cashAmount: data.cashAmount,
      date: data.date,
      time: data.time,
      cart: data.cart,
      billNo: data.billNo,
    };

    try {
      const response = await fetch("http://localhost:5000/print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bill),
      });
      const result = await response.json();
      if (result.success) {
        toast({
          title: "Bill Printed",
          description: "Bill has been printed successfully.",
          className: "bg-green-500 border-green-500 text-white",
        });
      }
    } catch (error) {
      console.error("Print error:", error);
      toast({
        title: "Print Error",
        description: "An error occurred while printing the bill.",
        className: "bg-red-500 border-red-500 text-white",
      });
    }
  };

  const refundBill = async (billId: string) => {
    try {
      const result = await refundBillAction(billId);
      console.log("Refund result:", result);

      if (result.success) {
        fetchBills();
        toast({
          title: "Bill Refunded",
          description: "Bill has been refunded successfully.",
          className: "bg-green-500 border-green-500 text-white",
        });
      } else {
        toast({
          title: "Refund Error",
          description: result.message,
          className: "bg-red-500 border-red-500 text-white",
        });
      }
    } catch (error) {
      console.error("Refund error:", error);
      toast({
        title: "Refund Error",
        description: "An error occurred while refunding the bill.",
        className: "bg-red-500 border-red-500 text-white",
      });
    }
  };

  const getBillStats = (bills: (typeof billHistory)[0][]) => {
    const totalSales = filteredBills.reduce((acc, bill) => acc + bill.total, 0);
    return { totalSales };
  };

  const BillDetails = ({ bill }: { bill: (typeof billHistory)[0] }) => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="border-b">
        <CardTitle className="text-2xl font-bold">Bill Details</CardTitle>
        {bill.refunded && (
          <div className="flex items-center space-x-2">
            <span className="text-red-500 text-xs">
              This bill has been refunded. Refunded at{" "}
              {formatDate(bill.refundedAt, "PPpp")}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center text-muted-foreground">
          <div className="flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2" />
            <span>{bill.date}</span>
          </div>
          <div className="flex items-center">
            <ClockIcon className="w-4 h-4 mr-2" />
            <span>{bill.time}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead className="text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bill?.cart.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.name}</TableCell>
                <TableCell>
                  {item.quantity} * Rs {Number(item.price).toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  Rs {Number(item.price * item.quantity).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-6 space-y-2">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Sub Total:</span>
            <span>Rs {bill.subTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Discount:</span>
            <span>{bill.discount} %</span>
          </div>
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total:</span>
            <span>Rs {bill.total.toFixed(2)}</span>
          </div>
          {bill.cash > 0 && (
            <>
              <div className="flex justify-between items-center">
                <span>Cash:</span>
                <span>Rs {bill.cash.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-semibold text-green-600">
                <span>Change:</span>
                <span>Rs {bill.change.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex justify-end items-center">
          <Button
            variant="outline"
            className="mr-2"
            onClick={() =>
              printBill({
                totalBill: bill.total,
                subTotal: bill.subTotal,
                discount: bill.discount,
                discountAmount: bill.discountAmount,
                changeAmount: bill.change,
                cashAmount: bill.cash,
                date: bill.date,
                time: bill.time,
                cart: bill.cart,
                billNo: bill.billNumber,
              })
            }
            disabled={bill.refunded}
          >
            Print Bill
          </Button>
          <Button
            variant="outline"
            onClick={() => refundBill(bill.id)}
            className="bg-destructive text-destructive-foreground"
            disabled={bill.refunded}
          >
            Refund Bill
          </Button>
        </div>
      </CardFooter>
    </Card>
  );

  return (
    <div className="container mx-auto sm:p-4 max-w-8xl">
      <h1 className="text-xl font-bold mb-6">Bill History</h1>

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

        <div className="flex space-x-4 ">
          <div className="flex sm:flex-row flex-col justify-between items-center gap-2">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-[150px] text-center">
                {format(currentMonth, "MMMM yyyy")}
              </div>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-2 w-full">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="p-2  rounded-md w-full"
                style={{
                  colorScheme: darkMode ? "dark" : "light",
                }}
              />
            </div>
          </div>
          <div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="bg-primary p-1 rounded-full text-secondary">
                    <RiResetRightLine
                      onClick={handleReset}
                      className={`h-6 w-6 cursor-pointer ${
                        spinning ? "animate-spin" : ""
                      }`}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" align="center" sideOffset={16}>
                  <p>Reset</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      <div className="block md:hidden space-y-4">
        {paginatedBills.map((bill) => (
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
                <div className="text-muted-foreground">Total:</div>
                <div className="font-medium">Rs {bill.total.toFixed(2)}</div>
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-center items-center space-x-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="hidden md:block">
        <Card>
          <CardHeader>
            <CardTitle>Bills</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <Table>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={9}>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Showing {paginatedBills.length} of{" "}
                        {filteredBills.length} bills
                      </span>

                      <div className="flex items-center space-x-2">
                        <span className="text-muted-foreground">
                          Total Sales: Rs{" "}
                          {getBillStats(billHistory).totalSales.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              </TableFooter>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill Number</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Discount Amount</TableHead>

                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedBills.map((bill) => (
                  <TableRow
                    key={bill.id}
                    className={
                      bill.refunded
                        ? "bg-red-500 hover:bg-red-500 text-white"
                        : ""
                    }
                  >
                    <TableCell className="font-medium">
                      {bill.billNumber}
                    </TableCell>
                    <TableCell>{bill.date}</TableCell>
                    <TableCell>{bill.time}</TableCell>
                    <TableCell>Rs {bill.total.toFixed(2)}</TableCell>
                    <TableCell>{bill.discount} %</TableCell>
                    <TableCell>
                      {bill.discountAmount
                        ? `Rs ${Number(bill.discountAmount).toFixed(2)}`
                        : "Rs 0.00"}
                    </TableCell>

                    <TableCell className="flex justify-center items-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="flex gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="hover:bg-secondary"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="right"
                                  align="center"
                                  sideOffset={16}
                                >
                                  <p>
                                    <span className="font-medium">
                                      View Bill
                                    </span>
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
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
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <div className="flex gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="hover:bg-secondary"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="right"
                                  align="center"
                                  sideOffset={16}
                                >
                                  <p>
                                    <span className="font-medium">
                                      Delete Bill
                                    </span>
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Bill - {bill.billNumber}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this bill?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-white"
                              onClick={async () => {
                                await removeBill(bill.id);
                                fetchBills();
                              }}
                            >
                              Delete Bill
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-center items-center space-x-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BillHistoryPage;
