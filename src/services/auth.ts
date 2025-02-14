"use server";

import { connectToDatabase } from "@/lib/mongodb";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";
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
