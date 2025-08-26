import React from "react";
import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  defineConfig,
} from "@chakra-ui/react";
import { Dashboard } from "./components/dashboard";
import "./App.css";

const config = defineConfig({
  theme: {
    tokens: {
      colors: {},
    },
  },
});

const system = createSystem(defaultConfig, config);

function App() {
  return (
    <ChakraProvider value={system}>
      <Dashboard />
    </ChakraProvider>
  );
}

export default App;
