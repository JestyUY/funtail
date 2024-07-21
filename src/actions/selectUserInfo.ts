"use server";

import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm"; // Replace "some-module" with the actual module where 'eq' is defined

export async function selecUserInfo(userId: string) {
  try {
    return await db.select().from(users).where(eq(users.id, userId));
  } catch (error) {
    console.error("Error selecting albums:", error);
    throw error;
  }
}
