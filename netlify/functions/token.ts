import { generateAccessToken, getCorsHeaders } from "./_security.js";

export default async function (req: Request | any, context?: any) {
  const origin = req.headers?.get ? req.headers.get("origin") : req.headers?.origin;
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { token, expiresIn } = generateAccessToken();

  return new Response(
    JSON.stringify({
      success: true,
      token,
      expiresIn,
      type: "Bearer",
    }),
    {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
