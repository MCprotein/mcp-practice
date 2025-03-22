import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface WeatherInput {
  city: string;
}

class WeatherTool extends MCPTool<WeatherInput> {
  name = "weather";
  description = "도시의 날씨 정보를 가져오기";

  schema = {
    city: {
      type: z.string(),
      description: "도시 이름 (예: 런던)",
    },
  };

  async execute({ city }: WeatherInput) {
    // 실제 API 호출
    return {
      city,
      temperature: 20,
      condition: "맑음",
      windSpeed: 10,
      humidity: 50,
    };
  }
}

export default WeatherTool;
