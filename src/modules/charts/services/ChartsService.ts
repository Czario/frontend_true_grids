import MSFT from "./../../../../public/temp_data/MicroSoftSankey.json";
import TSLA from "./../../../../public/temp_data/TSLASankey.json";

type ApiResponse = any;

// Available datasets
const datasets: Record<string, any[]> = {
    MSFT,
    TSLA,
};

export async function fetchSankeyData(symbol: string, quarter: string, year: number): Promise<ApiResponse> {
    if (!datasets[symbol]) {
        throw new Error("Invalid sankeyType");
    }

    const targetDate = `${year} ${quarter}`;
    const filteredData = datasets[symbol].filter((entry: { date: string }) => {
        return entry.date === targetDate
    });
    if (filteredData.length === 0) {
        throw new Error("Invalid sankeyType");
    }
    return Promise.resolve(filteredData[0]);
}
