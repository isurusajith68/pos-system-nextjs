"use server";

import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { ObjectId as MongoObjectId } from "mongodb";

export const getProducts = async () => {
  const db = await connectToDatabase();
  const products = await db
    .collection("products")
    .find()
    .sort({ name: 1 })
    .toArray();

  return products.map((product) => ({
    ...product,
    _id: product._id.toString(),
  }));
};

export const addProduct = async (
  name: string,
  itemCode: string,
  price: string,
  category: string,
  stock: number,
  image?: string,
  p0?: { url: string }
) => {
  const db = await connectToDatabase();

  const product = await db.collection("products").findOne({ name });
  if (product) {
    return { status: false, message: "Product name already exists" };
  }

  await db.collection("products").insertOne({
    name,
    itemCode,
    price,
    category,
    stock,
    image,
    createdAt: new Date().toISOString(),
  });

  return { status: true, message: "Product added successfully" };
};

export const updateProduct = async (
  id: string,
  name: string,
  itemCode: string,
  price: string,
  category: string,
  stock: number,
  image?: string
) => {
  const db = await connectToDatabase();
  await db.collection("products").updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        name,
        itemCode,
        price,
        category,
        stock: Number(stock),
        image,
      },
    }
  );

  return { status: true, message: "Product updated successfully" };
};

export const updateStock = async (id: string, stock: number) => {
  const db = await connectToDatabase();
  await db.collection("products").updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        stock: Number(stock),
      },
    }
  );

  return { status: true, message: "Product stock updated successfully" };
};

export const deleteProduct = async (id: string) => {
  const db = await connectToDatabase();
  await db.collection("products").deleteOne({ _id: new MongoObjectId(id) });

  return { status: true, message: "Product deleted successfully" };
};
