import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { stockFormSchema } from "./stock-form";
import { updateStock } from "@/services/stock";
import { toast } from "sonner";
import { Edit2 } from "lucide-react";

export default function EditStockForm({ stockData }: { stockData: any }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof stockFormSchema>>({
    resolver: zodResolver(stockFormSchema),
    defaultValues: stockData
      ? { ...stockData, initialQuantity: stockData.currentQuantity }
      : {},
  });

  const onSubmit = async (values: z.infer<typeof stockFormSchema>) => {
    const formData = {
      ...values,
      currentQuantity: values.initialQuantity,
    };

    const result = await updateStock(stockData._id, formData);
    if (result.success) {
      toast.success("Stock updated successfully");
      setOpen(false);
      form.reset();
      router.refresh();
    } else {
      toast.error("Failed to update stock");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Stock</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Ingredient Name</Label>
            <Input
              {...form.register("ingredientName")}
              placeholder="Ingredient Name"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
