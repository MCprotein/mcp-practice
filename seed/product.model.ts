import { Schema, model, Document } from "mongoose";

interface IOption {
  size: string;
  stock: number;
}

export interface IProduct extends Document {
  name: string;
  brand: string;
  category: string;
  color: string;
  options: IOption[];
  total_stock: number;
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    color: { type: String, required: true },
    options: [
      {
        size: { type: String, required: true },
        stock: { type: Number, required: true },
      },
    ],
    total_stock: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    collection: "products",
  }
);

export const Product = model<IProduct>("Product", ProductSchema);
