import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite runs the React app on http://localhost:5173
export default defineConfig({
  plugins: [react()],
});
