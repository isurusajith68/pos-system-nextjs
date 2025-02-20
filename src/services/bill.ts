"use server";

import { connectToDatabase } from "@/lib/mongodb";
import { endOfDay, startOfDay, sub } from "date-fns";
import { ObjectId } from "mongodb";

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
    const billNo = `${billNumber}`;

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
      refunded: bill.refunded,
      refundedAt: bill.refundedAt?.toISOString(),
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
      refunded: { $ne: true },
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
            refunded: { $ne: true },
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
            refunded: { $ne: true },
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

export const refundBillAction = async (billId: string) => {
  console.log("Refunding bill:", billId);
  try {
    const db = await connectToDatabase();
    const billsCollection = db.collection("bills");

    const billData = await billsCollection.findOne({
      _id: new ObjectId(billId),
    });

    console.log("Bill data:", billData);

    if (!billData) {
      return { success: false, error: "Bill not found" };
    }

    const refundedBill = {
      ...billData,
      refunded: true,
      refundedAt: new Date(),
    };

    await billsCollection.updateOne(
      { _id: billData._id },
      { $set: refundedBill }
    );

    return { success: true, message: "Bill refunded successfully" };
  } catch (error) {
    console.error("Error refunding bill:", error);
    return { success: false, error: "Failed to refund bill" };
  }
};

export const removeBill = async (billId: string) => {
  try {
    const db = await connectToDatabase();
    const billsCollection = db.collection("bills");

    const result = await billsCollection.deleteOne({
      _id: new ObjectId(billId),
    });

    if (result.deletedCount === 0) {
      return { success: false, error: "Bill not found" };
    }

    return { success: true, message: "Bill deleted successfully" };
  } catch (error) {
    console.error("Error deleting bill:", error);
    return { success: false, error: "Failed to delete bill" };
  }
};

export const salesDataMonthly = async () => {
  try {
    const db = await connectToDatabase();
    const billsCollection = db.collection("bills");

    const today = new Date();
    const startOfMonth = new Date(today.setDate(1));
    const endOfMonth = new Date(today.setDate(1));

    const monthlySales = await billsCollection
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startOfMonth, $lt: endOfMonth },
            refunded: { $ne: true },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            total: { $sum: "$totalBill" },
            billCount: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ])
      .toArray();

    return monthlySales;
  } catch (error) {
    console.error("Error fetching monthly sales:", error);
    return [];
  }
};

export const salesDataWeekly = async () => {
  try {
    const db = await connectToDatabase();
    const billsCollection = db.collection("bills");

    const today = new Date();
    const startOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay())
    );
    const endOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay() + 6)
    );
    console.log(startOfWeek, endOfWeek);
    const weeklySales = await billsCollection
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startOfWeek, $lt: endOfWeek },
            refunded: { $ne: true },
          },
        },
        {
          $project: {
            dayName: {
              $switch: {
                branches: [
                  {
                    case: { $eq: [{ $dayOfWeek: "$createdAt" }, 1] },
                    then: "Sunday",
                  },
                  {
                    case: { $eq: [{ $dayOfWeek: "$createdAt" }, 2] },
                    then: "Monday",
                  },
                  {
                    case: { $eq: [{ $dayOfWeek: "$createdAt" }, 3] },
                    then: "Tuesday",
                  },
                  {
                    case: { $eq: [{ $dayOfWeek: "$createdAt" }, 4] },
                    then: "Wednesday",
                  },
                  {
                    case: { $eq: [{ $dayOfWeek: "$createdAt" }, 5] },
                    then: "Thursday",
                  },
                  {
                    case: { $eq: [{ $dayOfWeek: "$createdAt" }, 6] },
                    then: "Friday",
                  },
                  {
                    case: { $eq: [{ $dayOfWeek: "$createdAt" }, 7] },
                    then: "Saturday",
                  },
                ],
                default: "Unknown",
              },
            },
            totalBill: 1,
          },
        },
        {
          $group: {
            _id: "$dayName",
            total: { $sum: "$totalBill" },
            billCount: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    return weeklySales;
  } catch (error) {
    console.error("Error fetching weekly sales:", error);
    return [];
  }
};
