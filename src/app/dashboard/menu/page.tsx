"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Minus,
  Printer,
  UtensilsCrossed,
  Loader,
  Keyboard,
} from "lucide-react";
import {
  Ingredient,
  useCategoryStore,
  useProductStore,
} from "@/store/useCategoryStore";
import { getCategories } from "../../../services/category";
import Image from "next/image";
import {
  getProducts,
  updateProduct,
  updateStock,
} from "../../../services/product";
import { Input } from "@/components/ui/input";
import { useReactToPrint } from "react-to-print";
import { useHotkeys } from "react-hotkeys-hook";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { debounce } from "lodash";
import { addBill } from "../../../services/bill";
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
import PermissionGuard from "@/components/PermissionGuard/PermissionGuard";

const MenuPage = () => {
  const { categories, setCategories, loading, setLoading } = useCategoryStore();
  const { products, setProducts, loadingProducts, setLoadingProducts } =
    useProductStore();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProductIndex, setSelectedProductIndex] = useState<number>(-1);
  const [isKeyboardNavigating, setIsKeyboardNavigating] = useState(false);
  const [cart, setCart] = useState<
    {
      id: string;
      name: string;
      price: number;
      quantity: number;
      ingredients?: Ingredient[];
    }[]
  >([]);
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [cashAmount, setCashAmount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cashInputRef = useRef<HTMLInputElement>(null);
  const discountInputRef = useRef<HTMLInputElement>(null);
  const selectedProductRef = useRef<HTMLDivElement>(null);
  const dateTimeRef = useRef<HTMLSpanElement>(null);
  const alertDialogRef = useRef<HTMLButtonElement>(null);
  const printRef = useRef<HTMLButtonElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const secondsTimer = setInterval(() => {
      if (dateTimeRef.current) {
        dateTimeRef.current.innerText = new Date().toLocaleString();
      }
    }, 1000);
    return () => clearInterval(secondsTimer);
  }, []);

  useEffect(() => {
    const updateDateTime = () => {
      const currentDate = new Date();
      setDate(currentDate.toLocaleDateString());
      setTime(currentDate.toLocaleTimeString());
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedProductRef.current && isKeyboardNavigating) {
      selectedProductRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedProductIndex, isKeyboardNavigating]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const productData = await getProducts();
      setProducts(productData);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (products.length === 0 && !loadingProducts) {
      fetchProducts();
    }

    if (categories.length === 0 && !loading) {
      loadCategories();
    }
  }, []);

  const filteredProductsByCategoryAndSearch = products.filter((product) => {
    return (
      (!selectedCategory || product.category === selectedCategory) &&
      (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.itemCode.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const addToCart = (product: {
    id: string;
    name: string;
    price: number;
    ingredients: Ingredient[];
  }) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === productId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prevCart.filter((item) => item.id !== productId);
    });
  };

  const clearCart = ({ stock }: { stock: boolean }) => {
    setCart([]);
    setCashAmount(0);
    setDiscount(0);

    //reset stock

    if (cashInputRef.current) cashInputRef.current.value = "";
    if (discountInputRef.current) discountInputRef.current.value = "";
  };

  const totalBill = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const discountAmount = (totalBill * discount) / 100;
  const changeAmount = cashAmount - totalBill + discountAmount;

  const debouncedSetSelectedProductIndex = debounce((index) => {
    setSelectedProductIndex(index);
  }, 50);

  useHotkeys("enter", () => {
    if (
      filteredProductsByCategoryAndSearch.length > 0 &&
      selectedProductIndex >= 0
    ) {
      addToCart({
        id: filteredProductsByCategoryAndSearch[selectedProductIndex]._id,
        name: filteredProductsByCategoryAndSearch[selectedProductIndex].name,
        price: filteredProductsByCategoryAndSearch[selectedProductIndex].price,
        ingredients:
          filteredProductsByCategoryAndSearch[selectedProductIndex].ingredients,
      });
    }
  });

  useHotkeys("arrowleft", () => {
    setIsKeyboardNavigating(true);
    if (selectedProductIndex > 0) {
      debouncedSetSelectedProductIndex(selectedProductIndex - 1);
    }
  });

  useHotkeys("arrowright", () => {
    setIsKeyboardNavigating(true);
    if (selectedProductIndex < filteredProductsByCategoryAndSearch.length - 1) {
      debouncedSetSelectedProductIndex(selectedProductIndex + 1);
    }
  });

  useHotkeys("arrowup", () => {
    setIsKeyboardNavigating(true);
    if (selectedProductIndex > 3) {
      debouncedSetSelectedProductIndex(selectedProductIndex - 4);
    }
  });

  useHotkeys("arrowdown", () => {
    setIsKeyboardNavigating(true);
    if (selectedProductIndex < filteredProductsByCategoryAndSearch.length - 4) {
      debouncedSetSelectedProductIndex(selectedProductIndex + 4);
    } else if (
      selectedProductIndex <
      filteredProductsByCategoryAndSearch.length - 3
    ) {
      debouncedSetSelectedProductIndex(selectedProductIndex + 3);
    } else if (
      selectedProductIndex <
      filteredProductsByCategoryAndSearch.length - 2
    ) {
      debouncedSetSelectedProductIndex(selectedProductIndex + 2);
    } else if (
      selectedProductIndex <
      filteredProductsByCategoryAndSearch.length - 1
    ) {
      debouncedSetSelectedProductIndex(selectedProductIndex + 1);
    } else if (
      selectedProductIndex === -1 &&
      filteredProductsByCategoryAndSearch.length > 0
    ) {
      debouncedSetSelectedProductIndex(0);
    }
  });

  useEffect(() => {
    const handleMouseMove = () => {
      setIsKeyboardNavigating(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useHotkeys("backspace", () => {
    if (selectedProductIndex >= 0) {
      const productToRemove =
        filteredProductsByCategoryAndSearch[selectedProductIndex];

      setCart((prevCart) => {
        products.filter((item) => {
          if (item._id === productToRemove._id) {
            //real product stock get
            if (cart.length > 0) {
              products.filter((product) => {
                return product;
              });
            } else {
              return;
            }

            return;
          }
        });
        const updatedCart = prevCart
          .map((item) => {
            if (item.id === productToRemove._id && item.quantity > 1) {
              return { ...item, quantity: item.quantity - 1 };
            }
            return item.id === productToRemove._id && item.quantity === 1
              ? null
              : item;
          })
          .filter((item) => item !== null);

        return updatedCart;
      });
    }
  });

  useHotkeys("plus", () => {
    if (cart.length > 0) {
      const firstItemInCart = cart[0];
      addToCart({
        ...firstItemInCart,
        ingredients: firstItemInCart.ingredients || [],
      });
    }
  });

  useHotkeys("minus", () => {
    if (cart.length > 0) {
      const firstItemInCart = cart[0];
      removeFromCart(firstItemInCart.id);
    }
  });

  useHotkeys("p", () => {
    alertDialogRef.current?.click();
  });

  useHotkeys("s", (e) => {
    e.preventDefault();
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  });

  useHotkeys("c", (e) => {
    e.preventDefault();
    if (cashInputRef.current) {
      cashInputRef.current.focus();
    }
  });

  useHotkeys("d", (e) => {
    e.preventDefault();
    if (discountInputRef.current) {
      discountInputRef.current.focus();
    }
  });

  useHotkeys("escape", () => {
    clearCart({ stock: true });
  });

  useHotkeys("space", () => {
    printRef.current?.click();
  });

  const shortcuts = [
    { key: "←", description: "Select previous item" },
    { key: "→", description: "Select next item" },
    { key: "↑", description: "Select item above" },
    { key: "↓", description: "Select item below" },
    { key: "S", description: "Focus search input" },
    { key: "C", description: "Focus customer paid input" },
    { key: "D", description: "Focus discount input" },
    { key: "P", description: "Print bill" },
    { key: "Esc", description: "Clear cart" },
    { key: "Space", description: "Print bill Confirm" },
    { key: "Enter", description: "Add selected item to cart" },
    { key: "Backspace", description: "Remove selected item from cart" },
  ];

  const printBill = async (data: {
    totalBill: number;
    subTotal: number;
    discount: number;
    discountAmount: number;
    changeAmount: number;
    cashAmount: number;
    date: string;
    time: string;
    cart: {
      id: string;
      name: string;
      price: number;
      quantity: number;
      ingredients?: Ingredient[];
    }[];
  }) => {
    const {
      totalBill,
      discount,
      subTotal,
      changeAmount,
      cashAmount,
      discountAmount,
      date,
      time,
    } = data;

    if (totalBill <= 0) {
      toast({
        title: "Error",
        description: "Total bill should be greater than 0",
        className: "bg-red-500 border-red-500 text-white",
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "Error",
        description: "Cart is empty",
        className: "bg-red-500 border-red-500 text-white",
      });
      return;
    }

    const lastBillNumber = await localStorage.getItem("lastBillNumber");

    const bill = {
      totalBill,
      subTotal,
      discount,
      discountAmount,
      changeAmount,
      cashAmount,
      date,
      time,
      cart,
      billNo: lastBillNumber + 1,
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
          title: "Bill printed",
          description: "Bill printed successfully",
          className: "bg-green-500 border-green-500 text-white",
        });
      }
    } catch (error) {
      console.error("Print error:", error);

      toast({
        title: "Error",
        description: "Failed to print bill",
        className: "bg-red-500 border-red-500 text-white",
      });
    }
    const result = await addBill({
      totalBill,
      subTotal,
      discount,
      discountAmount,
      changeAmount,
      cashAmount,
      date,
      time,
      cart,
    });

    if (result.success) {
      toast({
        title: "Bill added",
        description: "Bill added successfully",
        className: "bg-green-500 border-green-500 text-white",
      });

      //stock update
      products.filter((product) => {
        cart.filter((item) => {
          if (product._id === item.id) {
            return;
          }
        });
      });
      clearCart({
        stock: false,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to add bill",
        className: "bg-red-500 border-red-500 text-white",
      });
    }
  };

  return (
    <div className="container mx-auto border-none ring-0 max-w-full sm:p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PermissionGuard module="menu" action="view_menu">
          <div className="lg:col-span-3 xl:col-span-3">
            <Card
              className={`backdrop-blur-sm shadow-xl transition-all duration-300 `}
            >
              <CardHeader className="border-b py-2 bg-background">
                <div className="flex items-center justify-between max-sm:flex-col">
                  <CardTitle className="text-xl text-left font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    Menu
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <Input
                      type="text"
                      placeholder="Search item code or name (S)"
                      className="w-64 mt-2 max-sm:w-full focus-visible:ring-2"
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setSelectedProductIndex(-1);
                      }}
                      ref={searchInputRef}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          searchInputRef.current?.blur();
                        }
                      }}
                    />
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="hover:bg-primary/10"
                        >
                          <Keyboard className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Keyboard Shortcuts</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4">
                          {shortcuts.map((shortcut) => (
                            <div
                              key={shortcut.key}
                              className="flex items-center gap-2"
                            >
                              <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                                {shortcut.key}
                              </kbd>
                              <span className="text-sm">
                                {shortcut.description}
                              </span>
                            </div>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <UtensilsCrossed className="h-8 w-8 text-primary opacity-80 max-sm:hidden" />
                </div>

                <div className="flex gap-3 flex-wrap px-2">
                  <Badge
                    variant={selectedCategory === null ? "default" : "outline"}
                    className="cursor-pointer hover:scale-105 transition-all duration-200 px-4 py-2"
                    onClick={() => setSelectedCategory(null)}
                  >
                    All Items
                  </Badge>
                  {categories.map((category) => (
                    <Badge
                      key={category._id}
                      variant={
                        selectedCategory === category.name
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer hover:scale-105 transition-all duration-200 flex items-center gap-2 px-4 py-2 capitalize "
                      onClick={() => setSelectedCategory(category.name)}
                    >
                      <Image
                        src={category.image || "/placeholder.jpg"}
                        alt={category.name}
                        width={24}
                        height={24}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      {category.name}
                    </Badge>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </CardHeader>

              <CardContent className="p-6">
                <ScrollArea className="h-[calc(100vh-280px)]">
                  {loadingProducts ? (
                    <div className="flex justify-center items-center py-5">
                      <Loader className="h-6 w-6 text-primary animate-spin" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  gap-6">
                      {filteredProductsByCategoryAndSearch.map(
                        (product, index) => (
                          <Card
                            key={product._id}
                            ref={
                              index === selectedProductIndex
                                ? selectedProductRef
                                : null
                            }
                            className={`overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer ${
                              selectedProductIndex === index
                                ? "border-2 border-primary"
                                : ""
                            } `}
                            style={{
                              backgroundColor: "rgba(0, 255, 0, 0.1)",
                            }}
                            onClick={() => {
                              setSelectedProductIndex(index);
                              addToCart({
                                id: product._id,
                                name: product.name,
                                price: product.price,
                                ingredients: product.ingredients,
                              });
                            }}
                          >
                            <div className="relative h-32 overflow-hidden">
                              <div className="flex justify-center item-center">
                                <Image
                                  src={
                                    product.image
                                      ? product.image
                                      : "/placeholder.jpg"
                                  }
                                  alt={product.name}
                                  width={100}
                                  height={100}
                                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                              <Badge
                                variant="secondary"
                                className="absolute top-3 right-3 dark:bg-white/90 text-primary-foreground bg-black/90 backdrop-blur-sm"
                              >
                                {product.category}
                              </Badge>
                            </div>
                            <CardContent className="p-4">
                              <h3 className="font-semibold text-lg mb-1 capitalize max-w-full break-words whitespace-normal">
                                {product.name}{" "}
                                <span className="text-muted-foreground text-xs ml-2">
                                  ({product.itemCode})
                                </span>
                              </h3>

                              <div className="flex justify-between items-center mb-4">
                                <div className="text-lg font-bold text-destructive dark:text-red-500">
                                  <p className="font-bold text-lg ">
                                    Rs{" "}
                                    {parseFloat(
                                      product.price.toString()
                                    ).toFixed(2)}
                                  </p>
                                </div>
                                {/* {product.stock >= 0 && product.stock !== null && (
                                <>
                                  <Badge
                                    variant="outline"
                                    className={
                                      product.stock === 0
                                        ? "text-red-500"
                                        : product.stock < 5
                                        ? "text-yellow-500"
                                        : "text-green-500"
                                    }
                                  >
                                    stock: {product.stock}
                                  </Badge>
                                </>
                              )} */}
                              </div>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart({
                                    id: product._id,
                                    name: product.name,
                                    price: product.price,
                                    ingredients: product.ingredients,
                                  });
                                }}
                                className="w-full bg-primary hover:bg-primary/90 group-hover:scale-105 transition-transform"
                              >
                                Add to Bill
                              </Button>
                            </CardContent>
                          </Card>
                        )
                      )}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </PermissionGuard>
        <PermissionGuard module="menu" action="print_bill">
          <Card className="w-full max-w-xs mx-auto">
            <div className="flex justify-between items-center p-4 gap-2">
              <div>
                <span className="text-xs">Customer paid (C)</span>
                <Input
                  placeholder="amount_given"
                  type="number"
                  ref={cashInputRef}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value) && value >= 0) {
                      setCashAmount(value);
                    }
                    if (e.target.value.length === 0) {
                      setCashAmount(0);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      cashInputRef.current?.blur();
                    }
                  }}
                  className="focus-visible:ring-2"
                />
              </div>

              <div>
                <span className="text-xs">Discount (D)</span>
                <Input
                  placeholder="discount"
                  type="number"
                  ref={discountInputRef}
                  onChange={(e) => {
                    let value = parseFloat(e.target.value);

                    if (value > 100) {
                      value = 100;
                    }

                    if (e.target.value === "" || isNaN(value)) {
                      value = 0;
                    }

                    setDiscount(value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      discountInputRef.current?.blur();
                    }
                  }}
                  className="focus-visible:ring-2"
                />
              </div>
            </div>
            <ScrollArea
              className="h-[calc(100vh-450px)] border"
              ref={contentRef}
            >
              <CardContent className="p-2">
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium max-w-32 break-words whitespace-normal">
                          {item.name}
                        </p>
                        <span className="text-sm text-muted-foreground">
                          Rs {parseFloat(item.price.toString()).toFixed(2)} x{" "}
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeFromCart(item.id)}
                          className="h-8 w-8 rounded-full hover:bg-destructive/10"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            addToCart({
                              ...item,
                              ingredients: item.ingredients || [],
                            })
                          }
                          className="h-8 w-8 rounded-full hover:bg-primary/10"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {cart.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full">
                      <p className="text-muted-foreground">
                        No items in the cart
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </ScrollArea>
            <Separator className="" />
            <div className="space-y-2 p-2">
              <div className="flex justify-between">
                <p>Subtotal:</p>
                <p>Rs {totalBill.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p>Discount:</p>
                <p>{discount}%</p>
              </div>
              <div className="flex justify-between">
                <p>Total:</p>
                <p className="font-bold">
                  Rs {(totalBill - discountAmount).toFixed(2)}
                </p>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between">
                <p>Cash:</p>
                <p>Rs {cashAmount.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p>Change:</p>
                <p>Rs {cashAmount ? changeAmount.toFixed(2) : "0.00"}</p>
              </div>
            </div>
            <div className="p-2 space-y-2">
              <AlertDialog>
                <AlertDialogTrigger asChild ref={alertDialogRef}>
                  <Button className="w-full hover:bg-primary/90 transition-colors">
                    <Printer className="mr-2 h-4 w-4" /> Print Bill (P)
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will clear the cart and
                      close the menu.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        printBill({
                          date: date,
                          time: time,
                          totalBill: parseFloat(
                            (totalBill - discountAmount).toFixed(2)
                          ),
                          subTotal: totalBill,
                          cashAmount: cashAmount,
                          changeAmount: changeAmount,
                          discount: discount,
                          discountAmount: discountAmount,
                          cart: cart,
                        });
                      }}
                      ref={printRef}
                    >
                      Print Bill (Space)
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button
                variant="destructive"
                className="w-full hover:bg-destructive/90 transition-colors"
                onClick={() =>
                  clearCart({
                    stock: true,
                  })
                }
              >
                Clear Cart (Esc)
              </Button>
            </div>
          </Card>
        </PermissionGuard>
      </div>
    </div>
  );
};

export default MenuPage;
