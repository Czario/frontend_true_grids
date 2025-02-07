import { ApiResponse } from "@/modules/financials/interfaces/financials";

export async function fetchStatement(
  statementType: string,
  options: RequestInit = {}
): Promise<ApiResponse> {
  const local_url = `/temp_data/${statementType}.json`;
  const url = `http://localhost:3000/stock-serve/statement/TSLA/${statementType}`;
  const response = await fetch(url, {
    ...options, 
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  return response.json();
}