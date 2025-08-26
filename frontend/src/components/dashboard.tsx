import React from "react";
import { Box, Flex, Heading, SimpleGrid } from "@chakra-ui/react";
import { TopPrescribedDrugsChart } from "./dashboard/top-prescribed-drugs-chart";
import { TotalClaimCostChart } from "./dashboard/total-claim-cost-chart";

export const Dashboard = () => (
  <Box minH="100vh" bg="gray.50">
    <Box bg="blue.600" color="white" px={8} py={4} shadow="md">
      <Flex align="center" justify="space-between">
        <Heading as="h1" size="lg">
          Dashboard
        </Heading>
      </Flex>
    </Box>
    <Box p={8}>
      <Heading as="h2" size="md" mb={4} color="gray.700">
        Overview
      </Heading>
      <Box
        bg="white"
        p={6}
        rounded="md"
        shadow="sm"
        border="1px"
        borderColor="gray.200"
      >
        <SimpleGrid columns={2} gap={10}>
          <TopPrescribedDrugsChart />
          <TotalClaimCostChart />
        </SimpleGrid>
      </Box>
    </Box>
  </Box>
);
