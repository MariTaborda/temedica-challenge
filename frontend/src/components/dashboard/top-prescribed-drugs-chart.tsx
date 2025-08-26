import { Box, Heading } from "@chakra-ui/react";
import { BarDatum, ResponsiveBar } from "@nivo/bar";
import { useEffect, useState } from "react";

interface DrugData extends BarDatum {
  drugCode: number;
  prescribedCount: number;
}

export const TopPrescribedDrugsChart = () => {
  const [barData, setBarData] = useState<DrugData[]>([]);

  useEffect(() => {
    const fetchTopDrugs = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/analytics/top-drugs?startDate=2023-01-01&endDate=2023-05-31", // I hardcoded the date range for simplicity
        );
        const data: DrugData[] = await response.json();

        setBarData(data);
      } catch (error) {
        console.error("Failed to fetch top drugs:", error);
      }
    };

    fetchTopDrugs();
  }, []);

  return (
    <Box height="400px" bg="gray.50" p={4} borderRadius="md" boxShadow="md">
      <Heading as="h2" size="md" mb={4}>
        Top 10 Prescribed Drugs
      </Heading>
      <ResponsiveBar
        data={barData}
        keys={["prescribedCount"]}
        indexBy="drugCode"
        margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
        padding={0.3}
        colors={{ scheme: "paired" }}
        valueScale={{
          type: "linear",
          min: 0,
          max: Math.max(...barData.map((d) => d.prescribedCount)) + 5,
        }} // Dynamic random max
        axisBottom={{
          legend: "Drug Code",
          legendPosition: "middle",
          legendOffset: 40,
        }}
        axisLeft={{
          legend: "Prescribed Count",
          legendPosition: "middle",
          legendOffset: -50,
        }}
      />
    </Box>
  );
};
