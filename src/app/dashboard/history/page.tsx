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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, ClockIcon, Eye, Search } from "lucide-react";
import { getBillStats } from "@/services/bill";
import { useBillStore } from "@/store/useBillStore";
import { Popover } from "@radix-ui/react-popover";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RiResetRightLine } from "react-icons/ri";

const BillHistoryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const { fetchBills, billHistory } = useBillStore();
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    fetchBills();
  }, []);

  const filteredBills = billHistory.filter((bill) => {
    const isSearchMatch =
      bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.date.includes(searchTerm);

    const isDateMatch =
      (!startDate || new Date(bill.date) >= new Date(startDate)) &&
      (!endDate || new Date(bill.date) <= new Date(endDate));

    return isSearchMatch && isDateMatch;
  });

  const handleReset = () => {
    setSpinning(true);
    setTimeout(() => {
      setStartDate("");
      setEndDate("");
      setSearchTerm("");
      setSpinning(false);
    }, 200);
  };

  const getBillStats = (bills: (typeof billHistory)[0][]) => {
    const totalSales = filteredBills.reduce((acc, bill) => acc + bill.total, 0);
    return { totalSales };
  };

  const BillDetails = ({ bill }: { bill: (typeof billHistory)[0] }) => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="border-b">
        <CardTitle className="text-2xl font-bold">Bill Details</CardTitle>
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
          <div className="flex justify-between items-center">
            <span>Cash:</span>
            <span>Rs {bill.cash.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-lg font-semibold text-green-600">
            <span>Change:</span>
            <span>Rs {bill.change.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
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

        <div className="flex space-x-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2" />
                {startDate && endDate ? (
                  `From ${format(new Date(startDate), "PPP")} to ${format(
                    new Date(endDate),
                    "PPP"
                  )}`
                ) : (
                  <span>Select Date Range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label>Start Date</label>
                  <Calendar
                    mode="single"
                    selected={startDate ? new Date(startDate) : null}
                    onSelect={(date) =>
                      setStartDate(date ? date.toISOString() : "")
                    }
                    initialFocus
                    
                  />
                </div>
                <div>
                  <label>End Date</label>
                  <Calendar
                    mode="single"
                    selected={endDate ? new Date(endDate) : null}
                    onSelect={(date) =>
                      setEndDate(date ? date.toISOString() : "")
                    }
                    initialFocus
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
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
                <div className="text-muted-foreground">Total:</div>
                <div className="font-medium">Rs {bill.total.toFixed(2)}</div>
              </div>
            </CardContent>
          </Card>
        ))}
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
                  <TableCell colSpan={7}>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Showing {filteredBills.length} of {billHistory.length}{" "}
                        bills
                      </span>
                      <div className="flex items-center space-x-2">
                        {/**total sales price*/}
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
                    <TableCell>Rs {bill.total.toFixed(2)}</TableCell>
                    <TableCell>Rs {bill.cash.toFixed(2)}</TableCell>
                    <TableCell>Rs {bill.change.toFixed(2)}</TableCell>
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
