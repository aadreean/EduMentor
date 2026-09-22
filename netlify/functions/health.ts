const healthData = {
  status: "ok",
  platform: "netlify-functions",
  hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  schoolYear: "2026-2027",
  author: "prof. Adrian Podar",
};

export default async function (req: Request | any, context?: any) {
  if (req instanceof Request || (req && typeof req.headers?.get === "function")) {
    return new Response(JSON.stringify(healthData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
  return handler();
}

export const handler = async () => {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(healthData),
  };
};

export const config = {
  path: "/api/health",
};
