import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import * as dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ==========================================
  // API PROXY ROUTES
  // ==========================================
  
  // Health check endpoint (for cron jobs to keep the server awake on Render)
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // These routes act as a secure proxy. The browser calls /api/..., 
  // and this server attaches the secret API keys before calling the government APIs.
  
  // 1. ABDM Health Facility Registry (HFR) Proxy
  app.get("/api/hospitals", async (req, res) => {
    try {
      const lat = req.query.lat;
      const lng = req.query.lng;
      const abdmClientId = process.env.ABDM_CLIENT_ID;
      const abdmClientSecret = process.env.ABDM_CLIENT_SECRET;

      // TODO: Once you have your ABDM Sandbox keys, you will:
      // 1. Call ABDM Gateway to get an access token using Client ID & Secret
      // 2. Call the HFR API with that token to search by location/pin code
      // 3. Return the response to the frontend

      if (!abdmClientId || !abdmClientSecret) {
        return res.status(503).json({ 
          error: "API credentials not configured", 
          message: "Please configure ABDM_CLIENT_ID and ABDM_CLIENT_SECRET in .env" 
        });
      }

      // Placeholder for actual API call
      res.json({ status: "success", data: [] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // 2. eRaktKosh Blood Bank Proxy
  app.get("/api/blood-banks", async (req, res) => {
    try {
      const state = req.query.state || '35'; // Default to Delhi State Code (or whichever your default is)
      const district = req.query.district || '183'; // Default to a district
      
      const apiKey = process.env.API_SETU_ERAKTKOSH_KEY;
      const clientId = process.env.API_SETU_CLIENT_ID;

      // For prototype presentation: Immediately return mock data to avoid any external API failures
      return res.json({ 
        status: "mock", 
        message: "Running in prototype mode without external APIs."
      });

    } catch (error) {
      console.error("eRaktKosh Proxy Error:", error);
      // Fall back gracefully instead of crashing the frontend request
      res.json({ status: "mock", message: "Internal server error during fetch" });
    }
  });

  // ==========================================
  // VITE MIDDLEWARE & STATIC SERVING
  // ==========================================
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
