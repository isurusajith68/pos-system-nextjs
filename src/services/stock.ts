"use server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { init } from "next/dist/compiled/webpack/webpack";
import { z } from "zod";

const stockSchema = z.object({
  ingredientName: z.string().min(1),
  category: z.enum([
    "dairy",
    "meat",
    "vegetables",
    "fruits",
    "grains",
    "spices",
    "other",
  ]),
  unitOfMeasurement: z.enum(["kg", "l", "pcs", "g", "ml"]),
  initialQuantity: z.number().min(0),
  currentQuantity: z.number().min(0),
  minimumStockLevel: z.number().min(0),
  reorderLevel: z.number().min(0),
  supplier: z.object({
    id: z.string().optional(),
    name: z.string(),
    contactInfo: z.string(),
  }),
  purchasePricePerUnit: z.number().min(0),
  sellingPricePerUnit: z.number().min(0).optional(),
  manufacturingDate: z.date().optional(),
  expiryDate: z.date().optional(),
});
export type StockFormData = z.infer<typeof stockSchema>;

export const createStock = async (data: StockFormData) => {
  const db = await connectToDatabase();
  console.log(data);
  const stock = await db
    .collection("stocks")
    .findOne({ ingredientName: data.ingredientName });
  if (stock) {
    return { success: false, message: "Stock name already exists" };
  }

  const timestamp = new Date();

  await db.collection("stocks").insertOne({
    ...data,
    createdAt: timestamp,
    lastUpdated: timestamp,
  });

  return { success: true, message: "Stock added successfully" };
};

export const getStocks = async ({
  category,
  search,
  lowStock,
}: {
  category?: string;
  search?: string;
  lowStock?: string;
}) => {
  const db = await connectToDatabase();
  const query: any = {};

  // Filter by category if provided
  if (category && category !== "all") {
    query.category = category;
  }

  if (search) {
    query.ingredientName = { $regex: search, $options: "i" };
  }

  if (lowStock === "true") {
    query.currentQuantity = { $lte: 5 };
  }

  const stocks = await db
    .collection("stocks")
    .find(query)
    .sort({ ingredientName: 1 })
    .toArray();

  return stocks.map((stock) => ({
    ...stock,
    _id: stock._id.toString(),
    createdAt: stock.createdAt ? stock.createdAt.toISOString() : null,
    lastUpdated: stock.lastUpdated ? stock.lastUpdated.toISOString() : null,
  }));
};

export const updateStock = async (id: string, data: StockFormData) => {
  const db = await connectToDatabase();

  const stock = await db
    .collection("stocks")
    .findOne({ _id: new ObjectId(id) });
  if (!stock) {
    return { success: false, message: "Stock not found" };
  }

  await db.collection("stocks").updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...data,
        lastUpdated: new Date(),
      },
    }
  );

  return { success: true, message: "Stock updated successfully" };
};

export const deleteStock = async (id: string) => {
  const db = await connectToDatabase();
  await db.collection("stocks").deleteOne({ _id: new ObjectId(id) });
  return { success: true, message: "Stock deleted successfully" };
};

export const getAllIngredientsNames = async () => {
  const db = await connectToDatabase();
  const stocks = await db.collection("stocks").find().toArray();

  console.log(stocks, "stocks");

  return stocks.map((stock) => ({
    ingredientName: stock.ingredientName,
    units: stock.unitOfMeasurement,
    stockCurrentQuantity: stock.currentQuantity,
    _id: stock._id.toString(),
  }));
};

export const saveStockTransaction = async (data : any) => {
  console.log(data.selectedIngredientId);
  const db = await connectToDatabase();
  const timestamp = new Date();
  await db.collection("stockTransactions").insertOne({
    ...data,
  });

  const stock = await db
    .collection("stocks")
    .findOne({ _id: new ObjectId(data.selectedIngredientId) });
  if (!stock) {
    return { success: false, message: "Stock not found" };
  }
  console.log(data);
  if (data.activityType === "Added") {
    await db.collection("stocks").updateOne(
      { _id: new ObjectId(data.selectedIngredientId) },
      {
        $set: {
          currentQuantity: stock.currentQuantity + data.quantity,
          lastUpdated: timestamp,
        },
      }
    );
  }

  if (data.activityType !== "Added") {
    await db.collection("stocks").updateOne(
      { _id: new ObjectId(data.selectedIngredientId) },
      {
        $set: {
          currentQuantity: stock.currentQuantity - data.quantity,
          lastUpdated: timestamp,
        },
      }
    );
  }

  return { success: true, message: "Stock activity recorded successfully" };
};
export const getStockTransactions = async () => {
  const db = await connectToDatabase();
  const transactions = await db
    .collection("stockTransactions")
    .find()
    .toArray();
  return transactions.map((transaction) => ({
    ...transaction,
    _id: transaction._id.toString(),
    createdAt: transaction.createdAt
      ? transaction.createdAt.toISOString()
      : null,
  }));
};
export const getStockTransaction = async (id: string) => {
  const db = await connectToDatabase();
  const transaction = await db
    .collection("stockTransactions")
    .findOne({ _id: new ObjectId(id) });
  return {
    ...transaction,
    _id: transaction._id.toString(),
    createdAt: transaction.createdAt
      ? transaction.createdAt.toISOString()
      : null,
  };
};

export const deleteStockTransaction = async (id: string) => {
  const db = await connectToDatabase();
  await db.collection("stockTransactions").deleteOne({ _id: new ObjectId(id) });
  return { success: true, message: "Stock transaction deleted successfully" };
};
