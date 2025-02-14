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
import { Plus, Minus, Printer, UtensilsCrossed, Loader } from "lucide-react";
import { useCategoryStore, useProductStore } from "@/store/useCategoryStore";
import { getCategories } from "@/services/category";
import Image from "next/image";
import { getProducts } from "@/services/product";
import { Input } from "@/components/ui/input";

const MenuPage = () => {
  const { categories, setCategories, loading, setLoading } = useCategoryStore();
  const { products, setProducts, loadingProducts, setLoadingProducts } =
    useProductStore();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<
    { id: number; name: string; price: number; quantity: number }[]
  >([]);
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [cashAmount, setCashAmount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const currentDate = new Date();
    setDate(currentDate.toLocaleDateString());
    setTime(currentDate.toLocaleTimeString());
  }, []);

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
    return selectedCategory
      ? product.category === selectedCategory &&
          product.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true && product.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const addToCart = (product: { id: number; name: string; price: number }) => {
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

  const removeFromCart = (productId: number) => {
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

  // Calculate total bill with discount
  const totalBill = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const discountAmount = (totalBill * discount) / 100;

  const changeAmount = cashAmount - totalBill + discountAmount;

  return (
    <div className="container mx-auto ">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  gap-6">
        <div className="lg:col-span-3 xl:col-span-3">
          <Card className=" backdrop-blur-sm shadow-xl ">
            <CardHeader className="border-b py-2 bg-background">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Menu
                </CardTitle>
                <Input
                  type="text"
                  placeholder="Search for items"
                  className="w-1/3 mt-2"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <UtensilsCrossed className="h-8 w-8 text-primary opacity-80" />
              </div>
              <ScrollArea className="w-full max-w-full overflow-y-hidden py-4">
                <div className="flex gap-3 whitespace-nowrap px-2">
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
                      className="cursor-pointer hover:scale-105 transition-all duration-200 flex items-center gap-2 px-4 py-2 capitalize min-w-[100px]"
                      onClick={() => setSelectedCategory(category.name)}
                    >
                      <Image
                        src={category.image || "/placeholder.png"}
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
              </ScrollArea>
            </CardHeader>

            <CardContent className="p-6">
              <ScrollArea className="h-[calc(100vh-280px)]">
                {loadingProducts ? (
                  <div className="flex justify-center items-center py-5">
                    <Loader className="h-6 w-6 text-primary animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProductsByCategoryAndSearch.map((product) => (
                      <Card
                        key={product._id}
                        className="overflow-hidden hover:shadow-xl transition-all duration-300 group"
                      >
                        <div className="relative h-32 overflow-hidden">
                          <Image
                            src={
                              product.image ? product.image : "/placeholder.png"
                            }
                            alt={product.name}
                            width={200}
                            height={200}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <Badge
                            variant="secondary"
                            className="absolute top-3 right-3 dark:bg-white/90 text-primary-foreground bg-black/90 backdrop-blur-sm"
                          >
                            {product.category}
                          </Badge>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg mb-1 capitalize">
                            {product.name}
                          </h3>

                          <div className="flex justify-between items-center mb-4">
                            <div className="text-lg font-bold text-destructive dark:text-red-500">
                              <p className="font-bold text-lg ">
                                Rs {parseFloat(product.price).toFixed(2)}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              size="sm"
                              className={`${
                                product.stock > 10
                                  ? "text-green-600 border-green-600"
                                  : "text-orange-600 border-orange-600 "
                              }`}
                            >
                              {product.stock} left
                            </Badge>
                          </div>
                          <Button
                            onClick={() =>
                              addToCart({
                                id: product._id,
                                name: product.name,
                                price: product.price,
                              })
                            }
                            className="w-full bg-primary hover:bg-primary/90  group-hover:scale-105 transition-transform"
                          >
                            Add to Bill
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        <Card className="w-full max-w-xs mx-auto">
          <div className="flex justify-between items-center p-4 gap-2">
            <div>
              <span className="text-xs">Given Amount</span>
              <Input
                placeholder="amount_given"
                type="number"
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value) && value >= 0) {
                    setCashAmount(value);
                  }
                  if (e.target.value.length === 0) {
                    setCashAmount(0);
                  }
                }}
              />
            </div>

            <div>
              <span className="text-xs">Discount</span>
              <Input
                placeholder="discount"
                type="number"
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
              />
            </div>
          </div>
          <ScrollArea className="h-[calc(100vh-250px)] border">
            <CardHeader className="text-center">
              <CardTitle>
                <h2 className="text-2xl font-bold">Vimukthi's Restaurant</h2>
                <div className="text-sm font-normal text-muted-foreground mt-1">
                  <span>123, Main Street, Colombo 07</span>
                </div>
                <div className="text-sm font-normal text-muted-foreground">
                  <span>+94 123 456 789</span>
                </div>
              </CardTitle>
              <div className="text-sm text-muted-foreground mt-2">
                <span>Date: {date}</span>
                <br />
                <span>Time: {time}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <span className="text-sm text-muted-foreground">
                        Rs {parseFloat(item.price).toFixed(2)} x {item.quantity}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeFromCart(item.id)}
                        className="h-8 w-8 rounded-full"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => addToCart(item)}
                        className="h-8 w-8 rounded-full"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="space-y-2">
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
            </CardContent>
            <CardFooter className="flex flex-col items-center">
              <span className="text-center text-sm text-muted-foreground mb-4">
                Thank you for your visit!
                <br />
                Have a nice day!
              </span>
            </CardFooter>
          </ScrollArea>
          <div className="p-2">
            <Button className="w-full" onClick={() => ""}>
              <Printer className="mr-2 h-4 w-4" /> Print Bill
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MenuPage;
