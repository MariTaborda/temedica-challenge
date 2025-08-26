import { Box, Heading } from "@chakra-ui/react";
import { LineSeries, ResponsiveLine } from "@nivo/line";
import { useEffect, useState } from "react";

interface PatientClaimCost {
  patientId: number;
  totalCost: number;
}

export const TotalClaimCostChart = () => {
  const [lineData, setLineData] = useState<LineSeries[]>([]);

  useEffect(() => {
    const fetchClaimCosts = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/claims/total-cost-per-patient",
        );
        const data: PatientClaimCost[] = await response.json();

        // Format data
        const formattedData = [
          {
            id: "Total Cost",
            data: data.map((item) => ({
              x: `Patient ${item.patientId}`,
              y: item.totalCost,
            })),
          },
        ];

        setLineData(formattedData);
      } catch (error) {
        console.error("Failed to fetch claim costs per patient:", error);
      }
    };

    fetchClaimCosts();
  }, []);

  return (
    <Box height="400px" bg="gray.50" p={4} borderRadius="md" boxShadow="md">
      <Heading as="h2" size="md" mb={4}>
        Claim Costs Per Patient
      </Heading>
      <ResponsiveLine
        data={lineData}
        margin={{ top: 20, right: 30, bottom: 50, left: 60 }}
        xScale={{ type: "point" }}
        yScale={{ type: "linear", min: 0 }}
        colors={{ scheme: "dark2" }}
        pointSize={8}
        pointColor={{ theme: "background" }}
        pointBorderWidth={2}
        pointBorderColor={{ from: "seriesColor" }}
        pointLabelYOffset={-12}
        useMesh={true}
        axisBottom={{
          legend: "Patient",
          legendPosition: "middle",
          legendOffset: 40,
        }}
        axisLeft={{
          legend: "Total Cost",
          legendPosition: "middle",
          legendOffset: -50,
        }}
      />
    </Box>
  );
};
