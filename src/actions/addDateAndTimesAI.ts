"use server";

import { User } from "@/app/types/user";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export async function lastOptimization(userId: string) {
  try {
    const date = new Date();
    const result = await db
      .update(users)
      .set({ lastOptimizationReset: date })
      .where(eq(users.id, userId))
      .returning();

    if (result.length === 0) {
      return {
        success: false,
        message: "No rows were updated. User not found.",
      };
    }

    return {
      success: true,
      message: "Last optimization date updated successfully",
      data: result,
    };
  } catch (error) {
    console.error("Error updating last optimization date:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update last optimization date",
    };
  }
}

export async function optimizationQuantity(userId: string, quantity: number) {
  try {
    // Fetch the current user record
    const [userRecord]: { totalOptimizations: number | null }[] = await db
      .select({ totalOptimizations: users.totalOptimizations })
      .from(users)
      .where(eq(users.id, userId));

    if (!userRecord) {
      return {
        success: false,
        message: "User not found.",
      };
    }

    // Update the totalOptimizations
    const newTotalOptimizations =
      (userRecord.totalOptimizations ?? 0) + quantity;
    const result = await db
      .update(users)
      .set({
        totalOptimizations: newTotalOptimizations,
      })
      .where(eq(users.id, userId))
      .returning();

    if (result.length === 0) {
      return {
        success: false,
        message: "No rows were updated. User not found.",
      };
    }

    return {
      success: true,
      message: "Total optimizations updated successfully.",
      data: result,
    };
  } catch (error) {
    console.error("Error updating optimization quantity:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update optimization quantity",
    };
  }
}

export async function setResetOptimization(userId: string) {
  try {
    return await db
      .update(users)
      .set({ totalOptimizations: 0 })
      .where(eq(users.id, userId));
  } catch (error) {
    console.error("Error reseting last optimizations:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "error setting to 0 the optimizations quantity",
    };
  }
}
