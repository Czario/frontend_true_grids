import { ApiResponse } from '@/modules/financials/interfaces/financials';


export async function fetchStatement(statementType: string): Promise<ApiResponse> {
  const response = await fetch(`/temp_data/${statementType}.json`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}

export async function fetchFinancialsDoc(): Promise<ApiResponse> {
  const response = await fetch(`/temp_data/TeslaPdf.html`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response;
}