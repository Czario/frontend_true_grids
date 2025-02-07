import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const url = "https://www.sec.gov/Archives/edgar/data/1318605/000162828024043486/tsla-20240930.htm";

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "ransom app App/1.0 (your.email@domain.com)",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.text();
    res.status(200).send(data);
  } catch (error) {
    const err = error as Error;
    console.error("Error fetching data from SEC:", err.message);
    if ((error as any).response) {
      console.error("Response data:", (error as any).response.data);
      console.error("Response status:", (error as any).response.status);
      console.error("Response headers:", (error as any).response.headers);
    }
    res.status(500).send({ message: "Error Occurred", error: (error as Error).message });
  }
}