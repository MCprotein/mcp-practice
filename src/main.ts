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
    const { name, brand, category, color, size, total_stock, page, limit } =
      JSON.parse(JSON.stringify(params));

    const connection = mongoose.createConnection(
      "mongodb://devsys:devsys@localhost:27017/test?authSource=admin",
      {
        dbName: "test",
        user: "devsys",
        pass: "devsys",
      }
    );
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
