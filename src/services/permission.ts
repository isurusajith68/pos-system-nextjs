"use server";

import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";

export const savePermissions = async () => {
  const db = await connectToDatabase();
  const permissionsData = {
    permissions: [
      "dashboard",
      "product_management",
      "category_management",
      "billing",
      "cash_drawer",
      "stock_management",
      "settings",
      "menu",
    ],
    actions: {
      dashboard: [
        { id: 1, name: "view_total_categories" },
        { id: 2, name: "view_total_products" },
        { id: 3, name: "view_daily_sales" },
        { id: 4, name: "view_daily_total_revenue" },
        { id: 5, name: "view_cash_drawer" },
        { id: 6, name: "view_low_stock_alerts" },
        { id: 7, name: "view_weekly_sales" },
      ],
      product_management: [
        { id: 8, name: "add_product" },
        { id: 9, name: "edit_product" },
        { id: 10, name: "delete_product" },
        { id: 11, name: "view_products" },
      ],
      category_management: [
        { id: 12, name: "add_category" },
        { id: 13, name: "edit_category" },
        { id: 14, name: "delete_category" },
        { id: 15, name: "view_categories" },
      ],
      billing: [
        { id: 16, name: "view_all_bills" },
        { id: 17, name: "view_daily_bills" },
        { id: 18, name: "view_bill_detail" },
        { id: 19, name: "refund_bill" },
        { id: 20, name: "delete_bill" },
        { id: 21, name: "total_amounts" },
        { id: 22, name: "view_item_sales_list" },
      ],
      cash_drawer: [{ id: 23, name: "view_cash_drawer" }],
      stock_management: [
        { id: 24, name: "view_stock" },
        { id: 25, name: "edit_stock" },
        { id: 26, name: "add_stock" },
        { id: 27, name: "delete_stock" },
        { id: 28, name: "view_activity" },
        { id: 29, name: "add_activity" },
        { id: 30, name: "delete_activity" },
      ],
      settings: [
        { id: 31, name: "view_users_list" },
        { id: 32, name: "manage_permissions" },
        { id: 33, name: "update_profile_settings" },
        { id: 34, name: "view_settings" },
      ],
      menu: [
        { id: 35, name: "view_menu" },
        { id: 36, name: "print_bill" },
      ],
    },
  };

  const result = await db.collection("permissions").insertOne(permissionsData);
  return result.insertedId;
};

export const getPermissions = async () => {
  const db = await connectToDatabase();
  const permissions = await db.collection("permissions").findOne({});

  delete permissions._id;
  return permissions;
};

export const addRolePermissions = async (data) => {
  try {
    const db = await connectToDatabase();

    const { role, permissions } = data;

    await db
      .collection("rolesPermissions")
      .findOneAndUpdate({ role }, { $set: { permissions } }, { upsert: true });

    return { success: true, message: "Role permissions added successfully" };
  } catch (error) {
    return { success: false, message: "Something went wrong" };
  }
};

export const getRolePermissions = async (role) => {
  const db = await connectToDatabase();
  const permissions = await db.collection("rolesPermissions").findOne({ role });

  if (!permissions) {
    return null;
  }

  delete permissions._id;
  return permissions;
};
