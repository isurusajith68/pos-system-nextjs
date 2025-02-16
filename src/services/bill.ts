"use server";

import { connectToDatabase } from "@/lib/mongodb";
import { endOfDay, startOfDay, sub } from "date-fns";

export const addBill = async (bill: {
  totalBill: number;
  subTotal: number;
  discount: number;
  changeAmount: number;
  cashAmount: number;
  date: string;
  time: string;
  cart: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
}) => {
  try {
    const db = await connectToDatabase();
    const billsCollection = db.collection("bills");
    const counterCollection = db.collection("billCounter");

    const counterDoc = await counterCollection.findOne({ _id: "billNumber" });

    if (!counterDoc) {
      await counterCollection.insertOne({ _id: "billNumber", number: 100 });
    }

    const billNumber = counterDoc?.number || 100;
    const billNo = `BILL_${billNumber}`;

    await counterCollection.updateOne(
      { _id: "billNumber" },
      { $inc: { number: 1 } }
    );

    const billData = {
      billNo,
      totalBill: bill.totalBill,
      subTotal: bill.subTotal,
      discount: bill.discount,
      changeAmount: bill.changeAmount,
      cashAmount: bill.cashAmount,
      date: bill.date,
      time: bill.time,
      cart: bill.cart,
      createdAt: new Date(),
    };

    const result = await billsCollection.insertOne(billData);

    return { success: true, billNo };
  } catch (error) {
    console.error("Error adding bill:", error);
    return { success: false, error: "Failed to add bill" };
  }
};

export const getBills = async () => {
  try {
    const db = await connectToDatabase();
    const billsCollection = db.collection("bills");

    const bills = await billsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const serializableBills = bills.map((bill) => ({
      id: bill._id.toString(),
      billNumber: bill.billNo,
      date: bill.date,
      time: bill.time,
      total: bill.totalBill,
      subTotal: bill.subTotal,
      cash: bill.cashAmount,
      change: bill.changeAmount,
      discount: bill.discount,
      cart: bill.cart,
      createdAt: bill.createdAt.toISOString(),
    }));

    return { success: true, bills: serializableBills };
  } catch (error) {
    console.error("Error fetching bills:", error);
    return { success: false, error: "Failed to fetch bills" };
  }
};

export const getBillStats = async () => {
  try {
    const db = await connectToDatabase();
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));

    const billsCollection = db.collection("bills");
    const totalSales = await billsCollection.countDocuments({
      createdAt: { $gte: startOfToday, $lt: endOfToday },
    });
    const usersCollection = db.collection("users");
    const totalUsers = await usersCollection.countDocuments();

    const productsCollection = db.collection("products");
    const totalProducts = await productsCollection.countDocuments();

    const categoriesCollection = db.collection("categories");
    const totalCategories = await categoriesCollection.countDocuments();

    const totalRevenue = await billsCollection
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startOfToday, $lt: endOfToday },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalBill" },
          },
        },
      ])
      .toArray();

    return {
      success: true,
      totalSales,
      totalUsers,
      totalProducts,
      totalCategories,
      totalRevenue: totalRevenue[0]?.total || 0,
    };
  } catch (error) {
    console.error("Error fetching bill stats:", error);
    return { success: false, error: "Failed to fetch bill stats" };
  }
};

export const getDailySales = async () => {
  try {
    const db = await connectToDatabase();
    const billsCollection = db.collection("bills");

    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));

    const dailySales = await billsCollection
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startOfToday, $lt: endOfToday },
          },
        },
      ])
      .toArray();
    console.log(dailySales);
    return dailySales.map((bill) => ({
      ...bill,
      _id: bill._id.toString(),
    }));
  } catch (error) {
    console.error("Error fetching daily sales:", error);
    return [];
  }
};
