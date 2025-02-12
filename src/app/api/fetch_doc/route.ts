import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = "https://www.sec.gov/Archives/edgar/data/1318605/000162828024043486/tsla-20240930.htm";

  try {
    console.log("Fetching data from URL:", url);
    const response = await fetch(url, {
      headers: {
        "User-Agent": "ransom app App/1.0 (your.email@domain.com)",
      },
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      return NextResponse.json({ message: `HTTP error! status: ${response.status}` }, { status: response.status });
    }

    const data = await response.text();
    console.log("Data fetched successfully");

    // Set CORS headers in the response
    const nextResponse = new NextResponse(data, { status: 200 });
    nextResponse.headers.set("Access-Control-Allow-Origin", "*");
    nextResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    nextResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return nextResponse;
  } catch (error) {
    console.error("Error fetching data from SEC:", error);
    return NextResponse.json({ message: "Error Occurred", error: (error as Error).message }, { status: 500 });
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}