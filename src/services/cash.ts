"use server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const starterCash = async ({
  date,
  cash,
}: {
  date: string;
  cash: number;
}) => {
  const db = await connectToDatabase();
  const formattedDate = new Date(date).toLocaleDateString().split("T")[0];

  const result = await db.collection("cash").findOne({ date: formattedDate });

  if (result) {
    return { success: false, message: "Cash already exists" };
  }

  await db.collection("cash").insertOne({
    date: formattedDate,
    cash,
    isDayStarted: true,
    isDrawerOpen: true,
  });

  return { success: true, message: "Cash added successfully" };
};

export const getCash = async ({ date }: { date: string }) => {
  const db = await connectToDatabase();

  const formattedDate = new Date(date).toLocaleDateString().split("T")[0];
  const cash = await db.collection("cash").findOne({ date: formattedDate });
  if (!cash) {
    return {
      success: false,
      message: "Cash not found",
    };
  }

  const { _id, ...cashData } = cash;

  return { success: true, cash: cashData };
};

export const updateCash = async ({
  cash,
  date,
  declaredCash,
  dailyRevenue,
  expectedCash,
  variance,
}: {
  cash: number;
  date: string;
  declaredCash: number;
  dailyRevenue: number;
  expectedCash: number;
  variance: number;
}) => {
  const db = await connectToDatabase();
  const formattedDate = new Date(date).toLocaleDateString().split("T")[0];
  const cashData = await db.collection("cash").findOne({ date: formattedDate });

  if (!cashData) {
    return { success: false, message: "Cash not found" };
  }

  await db.collection("cash").updateOne(
    { date: formattedDate },
    {
      $set: {
        cash,
        declaredCash,
        dailyRevenue,
        expectedCash,
        variance,
        isDayEnded: true,
        isDrawerOpen: false,
      },
    }
  );

  return { success: true, message: "Cash updated successfully" };
};

export const getAllCash = async () => {
  const db = await connectToDatabase();
  const cash = await db.collection("cash").find().sort({ date: -1 }).toArray();

  if (!cash) {
    return { success: false, message: "Cash not found" };
  }
  const cashData = cash.map(({ _id, ...rest }) => rest);
  return { success: true, cashData };
};

export const deleteCash = async ({ date }: { date: string }) => {
  const db = await connectToDatabase();
  await db.collection("cash").deleteOne({ date });
  return { success: true, message: "Cash deleted successfully" };
};
