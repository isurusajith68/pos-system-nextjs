"use server";

import { connectToDatabase } from "@/lib/mongodb";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";

export interface User {
  id: string;
  email: string;
  username: string;
  role: "admin" | "manager" | "cashier" | "user";
  password: string;
}

export const loginUser = async (email: string, password: string) => {
  try {
    const db = await connectToDatabase();
    const SECRET_KEY = process.env.SECRET_KEY;
    if (!SECRET_KEY) {
      throw new Error("SECRET_KEY is not defined");
    }
    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return { success: false, message: "Invalid email or password" };
    }

    const isPasswordValid = user.password === password;
    if (!isPasswordValid) {
      return {
        success: false,
        message: "Invalid email or password",
      };
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      SECRET_KEY,
      { expiresIn: "1d" }
    );

    (await cookies()).set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return {
      success: true,
      message: "Login successful",
    };
  } catch (error) {
    return { success: false, message: "Server error, please try again later" };
  }
};

export const getUserFromCookie = async () => {
  try {
    const token = (await cookies()).get("auth_token")?.value;
    if (!token) return null;

    const SECRET_KEY = process.env.SECRET_KEY!;
    const decoded = jwt.verify(token, SECRET_KEY) as {
      userId: string;
      email: string;
    };

    const db = await connectToDatabase();
    const user = await db
      .collection("users")
      .findOne(
        { _id: new ObjectId(decoded.userId) },
        { projection: { password: 0, _id: 0 } }
      );

    if (!user || user.email !== decoded.email) {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
};

export const logoutUser = async () => {
  (await cookies()).delete("auth_token");
  redirect("/");
};

interface UpdateUserData {
  id?: string;
  email?: string;
  username?: string;
  password?: string;
  role?: string;
  updated_at?: string;
}

export const updateUser = async (userId: string, data: UpdateUserData) => {
  try {
    const db = await connectToDatabase();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return { success: false, message: "User not found" };
    }

    data.updated_at = new Date().toISOString();

    await db
      .collection("users")
      .updateOne({ _id: new ObjectId(userId) }, { $set: data });

    return { success: true, message: "User updated successfully" };
  } catch (error) {
    return { success: false, message: "Server error, please try again later" };
  }
};

export const createUser = async (data: {
  email: string;
  username: string;
  password: string;
  role: string;
}) => {
  try {
    const db = await connectToDatabase();
    const user = await db.collection("users").findOne({ email: data.email });
    if (user) {
      return { success: false, message: "User already exists" };
    }

    const createdAt = new Date().toISOString();

    const newData = {
      ...data,
      created_at: createdAt,
      updated_at: createdAt,
    };

    await db.collection("users").insertOne(newData);

    return { success: true, message: "User created successfully" };
  } catch (error) {
    return { success: false, message: "Server error, please try again later" };
  }
};

export const deleteUser = async (userId: string) => {
  try {
    const db = await connectToDatabase();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return { success: false, message: "User not found" };
    }

    await db.collection("users").deleteOne({ _id: new ObjectId(userId) });

    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    return { success: false, message: "Server error, please try again later" };
  }
};

export const getAllUsers = async () => {
  try {
    const db = await connectToDatabase();
    const users = await db
      .collection("users")
      .find()
      .project({ password: 0 })
      .toArray();

    if (!users) {
      return { success: false, message: "Users not found" };
    }

    users.forEach((user) => {
      user.id = user._id.toString();
      delete user._id;
    });

    users.sort((a, b) => {
      return a.created_at > b.created_at ? -1 : 1;
    });

    return { success: true, users };
  } catch (error) {
    return { success: false, message: "Server error, please try again later" };
  }
};
