"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createStock, StockFormData } from "@/services/stock";

export const stockFormSchema = z.object({
  ingredientName: z.string().min(1, "Ingredient name is required"),
  category: z.enum(
    ["dairy", "meat", "vegetables", "fruits", "grains", "spices", "other"],
    {
      required_error: "Please select a category",
    }
  ),
  unitOfMeasurement: z.enum(["kg", "l", "pcs", "g", "ml"], {
    required_error: "Please select a unit of measurement",
  }),
  initialQuantity: z.coerce
    .number()
    .min(0, "Initial quantity must be 0 or greater"),
  minimumStockLevel: z.coerce
    .number()
    .min(0, "Minimum stock level must be 0 or greater"),

  supplier: z.object({
    name: z.string().min(1, "Supplier name is required"),
    contactInfo: z.string().min(1, "Supplier contact info is required"),
  }),
});

export default function StockForm({ setReFetch }: { setReFetch: any }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof stockFormSchema>>({
    resolver: zodResolver(stockFormSchema),
    defaultValues: {
      initialQuantity: 0,
      minimumStockLevel: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof stockFormSchema>) {
    try {
      const formData: StockFormData = {
        ...values,
        currentQuantity: values.initialQuantity,
      };

      const result = await createStock(formData);
      console.log(result);
      if (result.success) {
        toast.success("Stock added successfully");
        setOpen(false);
        form.reset();
        setReFetch((prev: boolean) =>
          typeof prev === "boolean" ? !prev : prev
        );
      } else {
        toast.error("Failed to add stock");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Stock
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Stock</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ingredientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ingredient Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="dairy">Dairy</SelectItem>
                        <SelectItem value="meat">Meat</SelectItem>
                        <SelectItem value="vegetables">Vegetables</SelectItem>
                        <SelectItem value="fruits">Fruits</SelectItem>
                        <SelectItem value="grains">Grains</SelectItem>
                        <SelectItem value="spices">Spices</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unitOfMeasurement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit of Measurement</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="kg">Kilogram (kg)</SelectItem>
                        <SelectItem value="g">Gram (g)</SelectItem>
                        <SelectItem value="l">Liter (l)</SelectItem>
                        <SelectItem value="ml">Milliliter (ml)</SelectItem>
                        <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="initialQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minimumStockLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Stock Level</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supplier.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supplier.contactInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Contact Info</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Stock</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
