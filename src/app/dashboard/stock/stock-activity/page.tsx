"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  deleteStockTransaction,
  getAllIngredientsNames,
  getStockTransactions,
  saveStockTransaction,
} from "@/services/stock";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  ShoppingCart,
  AlertCircle,
  Trash2,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { Ingredient } from "@/store/useCategoryStore";
import PermissionGuard from "@/components/PermissionGuard/PermissionGuard";

const stockActivitySchema = z.object({
  ingredientName: z.string().min(1, "Ingredient is required"),
  activityType: z.enum(["Added", "Removed", "Used in Sale"]),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  price: z.number().min(0, "Price must be at least 0"),
  note: z.string().optional(),
  selectedIngredientId: z.string().optional(),
});

type StockActivityFormData = z.infer<typeof stockActivitySchema>;

interface ActivityWithTimestamp extends StockActivityFormData {
  timestamp: string;
  selectedIngredientId: string;
  _id?: string;
}

const StockActivity = () => {
  const [activities, setActivities] = useState<ActivityWithTimestamp[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<StockActivityFormData>({
    resolver: zodResolver(stockActivitySchema),
    defaultValues: {
      ingredientName: "",
      activityType: "Added",
      quantity: 1,
      price: 0,
      note: "",
    },
  });

  const fetchStockActivities = async () => {
    try {
      setIsLoading(true);
      const data = await getStockTransactions();
      setActivities(data);
    } catch (error) {
      toast.error("Failed to load stock activities");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        setIsLoading(true);
        const data = await getAllIngredientsNames();
        setIngredients(data);
      } catch (error) {
        toast.error("Failed to load ingredients");
      } finally {
        setIsLoading(false);
      }
    };

    fetchIngredients();
    fetchStockActivities();
  }, []);

  const handleIngredientChange = (value: string) => {
    const selectedIngredient = ingredients.find(
      (ingredient) => ingredient.ingredientName === value
    );
    if (selectedIngredient) {
      form.setValue("ingredientName", selectedIngredient.ingredientName);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "Added":
        return <ArrowUpCircle className="w-5 h-5 text-green-500" />;
      case "Removed":
        return <ArrowDownCircle className="w-5 h-5 text-red-500" />;
      case "Used in Sale":
        return <ShoppingCart className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const onSubmit = (data: StockActivityFormData) => {
    if (
      data.activityType !== "Added" &&
      data.quantity >
        ingredients.find(
          (ingredient) => ingredient.ingredientName === data.ingredientName
        )?.stockCurrentQuantity
    ) {
      toast.error("Not enough stock available!", { richColors: true });
      return;
    }

    const selectedIngredient = ingredients.find(
      (ingredient) => ingredient.ingredientName === data.ingredientName
    );

    const newActivity: ActivityWithTimestamp = {
      ...data,
      timestamp: new Date().toLocaleString(),
      selectedIngredientId: selectedIngredient._id,
    };

    saveStockTransaction(newActivity);
    toast.success("Stock activity recorded successfully!", {
      richColors: true,
    });
    fetchStockActivities();
  };

  return (
    <div className=" mx-auto sm:p-4 ">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-lg sm:text-xl font-bold">Stock Activity</h2>
        <Link href="/dashboard/stock">
          <Button variant="outline" className="w-full sm:w-auto">
            Back to Stock
          </Button>
        </Link>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <PermissionGuard module="stock_management" action="add_activity">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl font-bold">
                Log Stock Activity
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
                    name="ingredientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ingredient</FormLabel>
                        <FormControl>
                          <Select
                            disabled={isLoading}
                            onValueChange={handleIngredientChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select ingredient" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                              {ingredients.map((ingredient, index) => (
                                <SelectItem
                                  key={index}
                                  value={ingredient.ingredientName}
                                >
                                  <span className="font-medium text-gray-900">
                                    {ingredient.ingredientName}
                                  </span>
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
                    name="activityType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Activity Type</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select activity type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Added">Added</SelectItem>
                              <SelectItem value="Removed">Removed</SelectItem>
                              <SelectItem value="Used in Sale">
                                Used in Sale
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value))
                              }
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {form.watch("activityType") === "Added" && (
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseFloat(e.target.value))
                                }
                                className="w-full"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Note (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Add a note..."
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full sm:w-auto"
                    disabled={isLoading}
                  >
                    Log Activity
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </PermissionGuard>
        <PermissionGuard module="stock_management" action="view_activity">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl font-bold">
                Activity Log
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ingredient</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Timestamp
                      </TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activities.map((activity, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-xs font-bold">
                          {activity.ingredientName}
                        </TableCell>
                        <TableCell className="flex items-center text-xs gap-2">
                          {getActivityIcon(activity.activityType)}
                          <span className="hidden sm:inline">
                            {activity.activityType}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs">
                          {activity.quantity}
                        </TableCell>
                        <TableCell className="text-xs">
                          Rs {activity.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs">
                          {activity.timestamp}
                        </TableCell>
                        <TableCell>
                          <PermissionGuard
                            module="stock_management"
                            action="delete_activity"
                          >
                            <Trash2
                              className="w-4 h-4 text-red-500 cursor-pointer"
                              onClick={async () => {
                                await deleteStockTransaction(activity._id);
                                fetchStockActivities();
                              }}
                            />
                          </PermissionGuard>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </PermissionGuard>
      </div>
    </div>
  );
};

export default StockActivity;
