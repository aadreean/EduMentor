export const handler = async () => {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      status: "ok",
      platform: "netlify-functions",
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      schoolYear: "2026-2027",
      author: "prof. Adrian Podar",
    }),
  };
};
