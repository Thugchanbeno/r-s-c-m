import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const createErrorResponse = (message, status) => {
  console.error("API Error:", message);
  return NextResponse.json({ success: false, error: message }, { status });
};

export const validateObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const convertToObjectId = (id) => new mongoose.Types.ObjectId(id);
