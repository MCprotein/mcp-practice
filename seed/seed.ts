import mongoose from "mongoose";
import { Product, IProduct } from "./product.model";
import dotenv from "dotenv";
dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined");
}

class ProductSeeder {
  private readonly brands = [
    "Nike",
    "Adidas",
    "Puma",
    "New Balance",
    "Under Armour",
    "FILA",
    "Reebok",
    "Vans",
    "Converse",
  ];
  private readonly categories = [
    "운동화",
    "샌들",
    "부츠",
    "로퍼",
    "구두",
    "슬리퍼",
  ];
  private readonly colors = [
    "빨강",
    "파랑",
    "검정",
    "회색",
    "흰색",
    "녹색",
    "노랑",
    "분홍",
    "주황",
    "보라",
  ];
  private readonly sizes = [
    "220",
    "230",
    "240",
    "250",
    "260",
    "270",
    "280",
    "290",
    "300",
  ];

  private getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private generateOptions(): {
    options: { size: string; stock: number }[];
    total_stock: number;
  } {
    const sizeCount = this.getRandomInt(4, 6);
    const selectedSizes = new Set<string>();
    const options: { size: string; stock: number }[] = [];
    let total_stock = 0;

    while (selectedSizes.size < sizeCount) {
      selectedSizes.add(this.getRandomElement(this.sizes));
    }

    selectedSizes.forEach((size) => {
      const stock = this.getRandomInt(1, 50);
      options.push({ size, stock });
      total_stock += stock;
    });

    return { options, total_stock };
  }

  public async generateProducts(count: number = 1000): Promise<void> {
    await mongoose.connect(MONGODB_URI, {
      dbName: "mcp",
    });
    console.log("MongoDB 연결 성공");

    const productsCount = await Product.countDocuments();
    if (productsCount > 0) {
      console.log("기존 상품 데이터가 존재합니다. 삭제합니다.");
      await Product.collection.drop();
    }

    const products: Partial<IProduct>[] = Array.from(
      { length: count },
      (_, i) => {
        const brand = this.getRandomElement(this.brands);
        const category = this.getRandomElement(this.categories);
        const color = this.getRandomElement(this.colors);
        const { options, total_stock } = this.generateOptions();

        return {
          name: `${brand} ${category} ${color} ${i + 1}`,
          brand,
          category,
          color,
          options,
          total_stock,
          createdAt: new Date(),
        };
      }
    );

    await Product.insertMany(products);
    console.log(
      `MongoDB 초기화 완료: products 컬렉션에 ${count}개의 상품 데이터가 추가되었습니다.`
    );
  }
}

// 시드 데이터 생성 실행

async function main() {
  try {
    const seeder = new ProductSeeder();
    await seeder.generateProducts();
  } catch (err) {
    console.error("시드 데이터 생성 중 오류 발생:", err);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB 연결 종료");
  }
}

main();
