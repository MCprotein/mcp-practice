#!/usr/bin/env node
import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import mongoose from "mongoose";

// Create an MCP server
const server = new McpServer({
  name: "Demo",
  version: "1.0.0",
});

// Add an addition tool
server.tool(
  "add",
  "더하기",
  { a: z.number(), b: z.number() },
  async ({ a, b }) => ({
    content: [{ type: "text", text: String(a + b) }],
  })
);

server.tool("findEnv", "이 MCP server의 환경변수를 찾아줘", async () => {
  return {
    content: [{ type: "text", text: `${JSON.stringify(process.env)}` }],
  };
});

class ProductDto {
  name?: string | string[];
  brand?: string | string[];
  category?: string | string[];
  color?: string | string[];
  size?: string | string[];
  total_stock?: string | string[];
  page?: number;
  limit?: number;

  constructor(params: Record<string, string>) {
    for (const [key, value] of Object.entries(params)) {
      if (!value || !ProductDto.isProductDtoKey(key)) continue;

      if (key === "page" || key === "limit") {
        this[key] = Number(value);
        continue;
      }

      if (ProductDto.isProductDtoKey(key) && value.includes(",")) {
        this[key] = value.split(",");
      }

      this[key] = value;
    }
  }

  static isProductDtoKey(key: string): key is keyof ProductDto {
    return [
      "name",
      "brand",
      "category",
      "color",
      "size",
      "total_stock",
      "page",
      "limit",
    ].includes(key);
  }
}

server.tool(
  "getProducts",
  "mongodb 데이터베이스에서 상품 목록을 조회해줘",
  {
    name: z.string().optional(),
    brand: z.string().optional(),
    category: z.string().optional(),
    color: z.string().optional(),
    size: z.string().optional(),
    total_stock: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  },
  async (params) => {
    const dto = new ProductDto(params);

    const { name, brand, category, color, size, total_stock, page, limit } =
      dto;

    try {
      if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is not defined");
      }

      const connection = mongoose.createConnection(process.env.MONGODB_URI);
      const Product = connection.model(
        "Product",
        new mongoose.Schema({
          name: String,
          brand: String,
          category: String,
          color: String,
          size: String,
        })
      );
      const products = await Product.find({
        ...(name?.length ? { name: { $in: [name].flat() } } : {}),
        ...(brand?.length ? { brand: { $in: [brand].flat() } } : {}),
        ...(category?.length ? { category: { $in: [category].flat() } } : {}),
        ...(color?.length ? { color: { $in: [color].flat() } } : {}),
        ...(size?.length ? { size: { $in: [size].flat() } } : {}),
        ...(total_stock?.length
          ? { total_stock: { $in: [total_stock].flat() } }
          : {}),
      })
        .skip((page ?? 0) * (limit ?? 100))
        .limit(limit ?? 100)
        .lean()
        .exec();
      return {
        content: [{ type: "text", text: JSON.stringify(products) }],
      };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: "text", text: `데이터베이스 연결 실패 ${err}` }],
      };
    }
  }
);

// Add a dynamic greeting resource
server.resource(
  "greeting",
  new ResourceTemplate("greeting://{name}", { list: undefined }),
  async (uri, { name }) => ({
    contents: [
      {
        uri: uri.href,
        text: `Hello, ${name}!`,
      },
    ],
  })
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
