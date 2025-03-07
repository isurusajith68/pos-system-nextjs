"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  addProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from "../../../services/product";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RiLoader2Fill, RiResetRightLine } from "react-icons/ri";
import { Edit, Loader, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { getCategories } from "../../../services/category";
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
import { useCategoryStore, useProductStore } from "@/store/useCategoryStore";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useScrollStore } from "@/store/useScrollRef";
import { scrollToTop } from "@/components/scrollToTop";

const formSchema = z.object({
  productName: z
    .string()
    .min(2, { message: "Product name must be at least 2 characters." }),
  itemCode: z
    .string()
    .min(2, { message: "Item code must be at least 2 characters." }),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, {
    message: "Price must be a valid number with up to 2 decimal places.",
  }),
  category: z.string().min(1, { message: "Please select a category." }),
  stock: z.coerce
    .number()
    .int()
    .min(0, { message: "Stock must be a positive number." }),
  productImage:
    typeof window !== "undefined" ? z.instanceof(File).optional() : z.any(),
});

export default function ProductManagement() {
  const {
    products,
    setProducts,
    loadingProducts,
    setLoadingProducts,
    setProductImage,
    setEditingProduct,
    editingProduct,
    productImage,
  } = useProductStore();

  const { toast } = useToast();

  const {
    categories,
    setCategories,
    loading: loadingCategories,
    setLoading: setLoadingCategories,
  } = useCategoryStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: "",
      itemCode: "",
      price: "",
      category: "",
      stock: 0,
    },
  });
  const [spinning, setSpinning] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory
      ? product.category === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  const handleReset = () => {
    setSpinning(true);
    form.reset();
    setProductImage(null);
    setEditingProduct(null);
    setTimeout(() => {
      setSpinning(false);
    }, 1000);
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

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { productName, price, category, stock, itemCode } = values;

    const newProduct = {
      name: productName,
      itemCode,
      price,
      category,
      stock,
      image: productImage ? productImage : undefined,
    };

    try {
      if (editingProduct) {
        let url: string | undefined;
        if (productImage) {
          try {
            const res = await fetch("/api/upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ image: productImage }),
            });

            if (!res.ok) {
              throw new Error(`Failed to upload image: ${res.statusText}`);
            }

            const data = await res.json();
            url = data.url;

            toast({
              title: "Image uploaded successfully",
              description: "Image has been uploaded successfully.",
              className: "bg-green-500 text-white",
            });
          } catch (error) {
            toast({
              title: "Error uploading image",
              description: error.message,
              className: "bg-red-500 text-white",
            });
          }
        }

        const updateResult = await updateProduct(
          editingProduct._id,
          newProduct.name,
          newProduct.itemCode,
          newProduct.price,
          newProduct.category,
          newProduct.stock,
          url || editingProduct.image || null
        );

        if (!updateResult.status) {
          return toast({
            title: "Error updating product",
            description: updateResult.message,
            className: "bg-red-500 text-white",
          });
        }

        if (updateResult.status) {
          toast({
            title: "Product updated successfully",
            description: "Product has been updated successfully.",
            className: "bg-green-500 text-white",
          });
          fetchProducts();
        }
      } else {
        let url: string | undefined;
        if (productImage) {
          try {
            const res = await fetch("/api/upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ image: productImage }),
            });

            if (!res.ok) {
              throw new Error(`Failed to upload image: ${res.statusText}`);
            }

            const data = await res.json();
            url = data.url;

            toast({
              title: "Image uploaded successfully",
              description: "Image has been uploaded successfully.",
              className: "bg-green-500 text-white",
            });
          } catch (error) {
            toast({
              title: "Error uploading image",
              description: error.message,
              className: "bg-red-500 text-white",
            });
          }
        }

        const result = await addProduct(
          newProduct.name,
          newProduct.itemCode,
          newProduct.price,
          newProduct.category,
          newProduct.stock,
          url || null
        );

        if (!result.status) {
          return toast({
            title: "Error adding product",
            description: result.message,
            className: "bg-red-500 text-white",
          });
        }

        if (result.status) {
          toast({
            title: "Product added successfully",
            description: "Product has been added successfully.",
            className: "bg-green-500 text-white",
          });
          fetchProducts();
        }
      }
    } catch (error) {
      console.error("Error processing product:", error);
    }

    form.reset();
    setProductImage(null);
    setEditingProduct(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  useEffect(() => {
    if (products.length === 0 && !loadingProducts) {
      fetchProducts();
    }

    if (categories.length === 0 && !loadingCategories) {
      loadCategories();
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        setProductImage(base64Image);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (product: {
    _id: string;
    name: string;
    itemCode: string;
    price: number;
    category: string;
    stock: number;
    image?: string;
  }) => {
    setEditingProduct({
      ...product,
      price: parseFloat(product.price.toString()),
      stock: parseInt(product.stock.toString(), 10),
    });
    form.setValue("productName", product.name);
    form.setValue("itemCode", product.itemCode);
    form.setValue("price", product.price.toString());
    form.setValue("category", product.category);
    form.setValue("stock", product.stock);
    setProductImage(product.image);

    scrollToTop(document.getElementById("scroll-area"), true);
  };

  const ProductCard = ({ product }) => (
    <Card key={product._id} className="w-full ">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg capitalize">{product.name}</CardTitle>
            <p className="text-sm text-muted-foreground capitalize mt-1">
              {product.category}
            </p>
          </div>
          {product.image && (
            <div className="flex-shrink-0">
              <Image
                src={product.image || "/placeholder.jpg"}
                alt={product.name}
                width={60}
                height={60}
                className="rounded-md object-cover"
              />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-y-2 text-sm mb-4">
          <div className="text-muted-foreground">Price:</div>
          <div className="font-medium">
            Rs {parseFloat(product.price.toString()).toFixed(2)}
          </div>
          <div className="text-muted-foreground">Stock:</div>
          <div>{product.stock}</div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            onClick={() => handleEdit(product)}
            variant="ghost"
            size="sm"
            className="h-8"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="h-8">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  this product.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDelete(product._id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div
      className="container mx-auto sm:p-4 space-y-4 scroll-area max-w-full"
      id="scroll-area"
    >
      <h1 className="text-xl font-bold text-primary mb-6">Products</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              {editingProduct ? "Edit Product" : "Add Product"}
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
            </CardTitle>
          </CardHeader>
          <CardContent className="">
            {loadingCategories ? (
              <div className="flex justify-center items-center py-5">
                <Loader className="h-6 w-6 text-primary animate-spin" />
              </div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="productName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Product Name
                          <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter product name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="itemCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Item Code
                          <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter product stock" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Price
                          <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter product price"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Category
                          <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem
                                  key={category._id}
                                  value={category.name}
                                >
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Stock <span className="text-xs ml-2">(Optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter stock quantity"
                            {...field}
                            type="number"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="productImage"
                    render={() => (
                      <FormItem>
                        <FormLabel>
                          Product Image
                          <span className="text-xs ml-2">(Optional)</span>
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="productImage"
                              type="file"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                document.getElementById("productImage")?.click()
                              }
                            >
                              <Upload className="mr-2 h-4 w-4" /> Upload Image
                            </Button>
                            {productImage && (
                              <div className="text-sm text-muted-foreground">
                                <Image
                                  src={productImage}
                                  alt="Product Image"
                                  width={50}
                                  height={50}
                                  className="rounded-md"
                                />
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    {editingProduct ? "Update Product" : "Add Product"}
                    {form.formState.isSubmitting && (
                      <RiLoader2Fill className="animate-spin ml-2 h-4 w-4" />
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Product List</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <Input
                  type="search"
                  placeholder="Search products"
                  className="sm:w-[200px]"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select
                  onValueChange={(value) => {
                    setSelectedCategory(value === "all" ? "" : value);
                  }}
                  value={selectedCategory || "all"}
                >
                  <SelectTrigger className="sm:w-[180px]">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingProducts ? (
              <div className="flex justify-center items-center py-8">
                <Loader className="h-6 w-6 text-primary animate-spin" />
              </div>
            ) : (
              <>
                <div className="grid gap-4 lg:hidden">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                <div className="hidden lg:block">
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product Name</TableHead>
                          <TableHead>Item Code</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Image</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.map((product) => (
                          <TableRow key={product._id}>
                            <TableCell className="capitalize font-medium">
                              {product.name}
                            </TableCell>
                            <TableCell>
                              {!product.itemCode ? "-" : product.itemCode}
                            </TableCell>
                            <TableCell>{product.stock}</TableCell>
                            <TableCell>
                              Rs{" "}
                              {parseFloat(product.price.toString()).toFixed(2)}
                            </TableCell>
                            <TableCell className="capitalize">
                              {product.category}
                            </TableCell>
                            <TableCell>
                              <Image
                                src={product.image || "/placeholder.jpg"}
                                alt={product.name}
                                width={50}
                                height={50}
                                className="rounded-md object-cover"
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                onClick={() => handleEdit(product)}
                                variant="ghost"
                                size="icon"
                                className="mr-2"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Are you absolutely sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will
                                      permanently delete this product.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(product._id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
