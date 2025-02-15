"use server";

import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const getCategories = async () => {
  const db = await connectToDatabase();
  const categories = await db.collection("categories").find().toArray();

  return categories.map((category) => ({
    ...category,
    _id: category._id.toString(),
  }));
};

export const addCategory = async (
  categoryName: string,
  categoryImage: string | undefined
) => {
  const db = await connectToDatabase();

  const category = await db
    .collection("categories")
    .findOne({ name: categoryName });
  if (category) {
    return { status: false, message: "Category already exists" };
  }

  await db.collection("categories").insertOne({
    name: categoryName,
    image: categoryImage,
  });
  return { status: true, message: "Category added successfully" };
};

export const updateCategory = async (
  id: string,
  name: string,
  image?: string
) => {
  const db = await connectToDatabase();
  await db
    .collection("categories")
    .updateOne({ _id: new ObjectId(id) }, { $set: { name, image } });
};

export const deleteCategory = async (id: string) => {
  const db = await connectToDatabase();
  await db.collection("categories").deleteOne({ _id: new ObjectId(id) });
};
