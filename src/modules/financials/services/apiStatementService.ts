import { ApiResponse } from "@/modules/financials/interfaces/financials";

export async function fetchStatement(
  statementType: string,
  options: RequestInit = {},
  setUserlogin: (status: boolean) => void,
): Promise<ApiResponse> {
  const local_url = `/temp_data/${statementType}.json`;
  const url = `http://localhost:3000/stock-serve/statement/TSLA/${statementType}`;
  const response = await fetch(url, {
    ...options,
  });

  if (!response.ok) {
    if (response.status === 401) {
      setUserlogin(false);
    }
    throw new Error("Network response was not ok");
  }

  return response.json();
}