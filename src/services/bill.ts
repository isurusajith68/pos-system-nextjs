"use server";

import { connectToDatabase } from "@/lib/mongodb";

export const addBill = async (bill: {
  totalBill: number;
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
      discount: bill.discountAmount,
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

    const bills = await billsCollection.find({}).toArray();

    const serializableBills = bills.map((bill) => ({
      id: bill._id.toString(),
      billNumber: bill.billNo,
      date: bill.date,
      time: bill.time,
      total: bill.totalBill,
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
    const billsCollection = db.collection("bills");
    const totalBills = await billsCollection.countDocuments();

    const usersCollection = db.collection("users");
    const totalUsers = await usersCollection.countDocuments();

    const productsCollection = db.collection("products");
    const totalProducts = await productsCollection.countDocuments();

    const categoriesCollection = db.collection("categories");
    const totalCategories = await categoriesCollection.countDocuments();

    return {
      success: true,
      totalBills,
      totalUsers,
      totalProducts,
      totalCategories,
    };
  } catch (error) {
    console.error("Error fetching bill stats:", error);
    return { success: false, error: "Failed to fetch bill stats" };
  }
};
