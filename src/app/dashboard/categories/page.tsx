"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Edit, Loader, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  addCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../../../services/category";
import { RiLoader2Fill, RiResetRightLine } from "react-icons/ri";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { useToast } from "@/hooks/use-toast";
import { useCategoryStore } from "@/store/useCategoryStore";
import { scrollToTop } from "@/components/scrollToTop";
import PermissionGuard from "@/components/PermissionGuard/PermissionGuard";

const formSchema = z.object({
  categoryName: z.string().min(2, {
    message: "Category name must be at least 2 characters.",
  }),
  categoryImage: z.string().optional(),
});

export default function CategoryManagement() {
  const [categoryImage, setCategoryImage] = useState<string | undefined>(
    undefined
  );
  const { categories, setCategories, loading, setLoading } = useCategoryStore();

  const [editingCategory, setEditingCategory] = useState<{
    id: string;
    name: string;
    image?: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [spinning, setSpinning] = useState(false);
  const { toast } = useToast();
  const handleReset = () => {
    setSpinning(true);

    form.reset();
    setEditingCategory(null);
    setCategoryImage(null);
    setTimeout(() => {
      setSpinning(false);
    }, 1000);
  };
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryName: "",
    },
  });

  useEffect(() => {
    if (categories.length === 0 && !loading) {
      loadCategories();
    }
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
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (editingCategory) {
      let url: string | undefined;
      if (categoryImage) {
        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: categoryImage }),
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

      await updateCategory(editingCategory.id, values.categoryName, url);
      setEditingCategory(null);
      toast({
        title: "Category updated successfully",
        description: "Category has been updated successfully.",
        className: "bg-green-500 text-white",
      });
    } else {
      let url: string | undefined;
      if (categoryImage) {
        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: categoryImage }),
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

      const result = await addCategory(values.categoryName, url);

      if (!result.status) {
        return toast({
          title: "Error adding category",
          description: result.message,
          className: "bg-red-500 text-white",
        });
      }

      toast({
        title: "Category added successfully",
        description: "Category has been added successfully.",
        className: "bg-green-500 text-white",
      });
    }

    form.reset();
    setCategoryImage(null);
    loadCategories();
  };

  const handleDelete = async (id: string) => {
    await deleteCategory(id);
    loadCategories();

    toast({
      title: "Category deleted successfully",
      description: "Category has been deleted successfully.",
      className: "bg-green-500 text-white",
    });
  };

  const handleEdit = (id: string, name: string, image?: string) => {
    setEditingCategory({ id, name, image });
    form.setValue("categoryName", name);
    setCategoryImage(image || undefined);

    scrollToTop(document.getElementById("scroll-area-c"), true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCategoryImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredCategories = categories.filter((category) => {
    return (
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category._id.includes(searchTerm)
    );
  });

  return (
    <div
      className="container mx-auto sm:p-4 space-y-4 scroll-area-c max-w-full"
      id="scroll-area-c"
    >
      <h1 className="text-xl font-bold text-primary mb-6">Category</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PermissionGuard module="category_management" action="add_category">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex justify-between items-center ">
                {editingCategory ? "Edit Category" : "Add Category"}

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
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="categoryName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Category Name{" "}
                          <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter category name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="categoryImage"
                    render={() => (
                      <FormItem>
                        <FormLabel>
                          Category Image{" "}
                          <span className="text-xs ml-2">(Optional)</span>
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="categoryImage"
                              type="file"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                document
                                  .getElementById("categoryImage")
                                  ?.click()
                              }
                            >
                              <Upload className="mr-2 h-4 w-4" /> Upload Image
                            </Button>
                            {categoryImage && (
                              <div className="text-sm text-muted-foreground">
                                <Image
                                  src={categoryImage || "/placeholder.jpg"}
                                  alt="Category Image"
                                  width={50}
                                  height={50}
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
                    {editingCategory ? "Update Category" : "Add Category"}
                    {form.formState.isSubmitting && (
                      <RiLoader2Fill className="animate-spin ml-2 h-4 w-4" />
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </PermissionGuard>
        <PermissionGuard module="category_management" action="view_categories">
          <Card className="md:col-span-1">
            <CardHeader>
              <div className="flex justify-between items-center w-full max-sm:flex-col max-sm:gap-2">
                <CardTitle>Categories</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground mr-2 text-xs">
                    Filter:
                  </span>
                  <Input
                    type="search"
                    placeholder="Search categories"
                    className=""
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-5">
                  <Loader className="h-6 w-6 text-primary animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">
                        Category Name
                      </TableHead>
                      <TableHead className="font-semibold">Image</TableHead>
                      <TableHead className=""></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories.map((category) => (
                      <TableRow key={category._id}>
                        <TableCell className="capitalize">
                          {category.name}
                        </TableCell>
                        <TableCell className="">
                          <Image
                            src={category.image || "/placeholder.jpg"}
                            alt={category.name}
                            width={40}
                            height={40}
                            className="rounded-md object-cover"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <PermissionGuard
                            module="category_management"
                            action="edit_category"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="mr-2"
                              onClick={() =>
                                handleEdit(
                                  category._id,
                                  category.name,
                                  category.image
                                )
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </PermissionGuard>
                          <PermissionGuard
                            module="category_management"
                            action="delete_category"
                          >
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive">
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
                                    permanently delete this category.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction asChild>
                                    <Button
                                      variant="ghost"
                                      onClick={() => handleDelete(category._id)}
                                    >
                                      Continue
                                    </Button>
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </PermissionGuard>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </PermissionGuard>
      </div>
    </div>
  );
}
