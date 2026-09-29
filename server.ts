import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import * as dotenv from "dotenv";
import { db } from "./src/server/db";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Database connection (PostgreSQL via DATABASE_URL or resilient fallback)
  await db.init();

  // ==========================================
  // DATABASE STATUS & CONTROL APIS
  // ==========================================
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/api/db-status", async (req, res) => {
    try {
      const status = await db.getStatus();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/db/retry", async (req, res) => {
    try {
      const connected = await db.retryConnect();
      const status = await db.getStatus();
      res.json({ connected, status });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/db/clear", async (req, res) => {
    try {
      await db.clearAll();
      res.json({ success: true, message: "Database tables cleared." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/db/seed", async (req, res) => {
    try {
      const sample = req.body;
      const result = await db.seedSampleData(sample);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // HOSPITALS & FACILITIES
  // ==========================================
  app.get("/api/hospitals", async (req, res) => {
    try {
      const hospitals = await db.getHospitals();
      res.json(hospitals);
    } catch (error: any) {
      console.error("Hospitals fetch error:", error);
      res.status(500).json({ error: "Failed to fetch hospitals from database" });
    }
  });

  app.post("/api/hospitals", async (req, res) => {
    try {
      const saved = await db.saveHospital(req.body);
      res.status(201).json(saved);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/hospitals/:id", async (req, res) => {
    try {
      const updated = await db.updateHospital(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: "Hospital not found" });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==========================================
  // BLOOD BANKS
  // ==========================================
  app.get("/api/blood-banks", async (req, res) => {
    try {
      const bloodBanks = await db.getBloodBanks();
      res.json(bloodBanks);
    } catch (error: any) {
      console.error("Blood Banks fetch error:", error);
      res.status(500).json({ error: "Failed to fetch blood banks from database" });
    }
  });

  app.post("/api/blood-banks", async (req, res) => {
    try {
      const saved = await db.saveBloodBank(req.body);
      res.status(201).json(saved);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/blood-banks/:id/stock", async (req, res) => {
    try {
      const { group, delta } = req.body;
      const updated = await db.updateBloodStock(req.params.id, group, delta);
      if (!updated) return res.status(404).json({ error: "Blood bank not found" });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==========================================
  // DOCTORS & QUEUES
  // ==========================================
  app.get("/api/doctors", async (req, res) => {
    try {
      const doctors = await db.getDoctors();
      res.json(doctors);
    } catch (error: any) {
      console.error("Doctors fetch error:", error);
      res.status(500).json({ error: "Failed to fetch doctors from database" });
    }
  });

  app.post("/api/doctors", async (req, res) => {
    try {
      const saved = await db.saveDoctor(req.body);
      res.status(201).json(saved);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/doctor-queues/:doctorId", async (req, res) => {
    try {
      const queue = await db.getDoctorQueue(req.params.doctorId);
      res.json(queue);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/doctor-queues/:doctorId", async (req, res) => {
    try {
      const updatedQueue = await db.updateDoctorQueue(req.params.doctorId, req.body.queue || []);
      res.json(updatedQueue);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==========================================
  // PATIENT PROFILES & AUTH
  // ==========================================
  app.post("/api/patients/login", async (req, res) => {
    try {
      const { identifier } = req.body;
      if (!identifier || typeof identifier !== "string") {
        return res.status(400).json({ error: "Identifier required" });
      }

      let patient = await db.getPatient(identifier);
      if (!patient) {
        // Register new patient automatically in the database
        const cleanId = identifier.trim();
        const isEmail = cleanId.includes("@");
        const formattedAbha = isEmail ? cleanId : `${cleanId.replace(/\s+/g, "").toLowerCase()}@abdm`;
        const randomNum = Math.floor(1000 + Math.random() * 9000);

        patient = await db.savePatient({
          id: `pat-${Date.now().toString().slice(-4)}`,
          name: isEmail ? cleanId.split("@")[0].replace(/[._]/g, " ") : `Citizen (${cleanId.slice(-4)})`,
          abhaId: formattedAbha,
          abhaNumber: `91-${randomNum}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
          phone: cleanId.match(/^\d+$/) ? `+91-${cleanId}` : "+91-98765-43210",
          gender: "Citizen",
          age: 28,
          dob: "1996-01-01",
          bloodGroup: "O+",
          address: "Registered Citizen Address",
          emergencyContact: "Emergency Support Contact"
        });
      }

      res.json(patient);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/patients/:identifier", async (req, res) => {
    try {
      const patient = await db.getPatient(req.params.identifier);
      if (!patient) return res.status(404).json({ error: "Patient not found" });
      res.json(patient);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/patients", async (req, res) => {
    try {
      const saved = await db.savePatient(req.body);
      res.status(201).json(saved);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==========================================
  // CONSULTATIONS & APPOINTMENTS
  // ==========================================
  app.get("/api/consultations", async (req, res) => {
    try {
      const patientId = req.query.patientId as string | undefined;
      const list = await db.getConsultations(patientId);
      res.json(list);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/consultations", async (req, res) => {
    try {
      const saved = await db.saveConsultation(req.body);
      res.status(201).json(saved);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/consultations/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const updated = await db.updateConsultationStatus(req.params.id, status);
      if (!updated) return res.status(404).json({ error: "Consultation not found" });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==========================================
  // PRESCRIPTIONS
  // ==========================================
  app.get("/api/prescriptions", async (req, res) => {
    try {
      const patientId = req.query.patientId as string | undefined;
      const list = await db.getPrescriptions(patientId);
      res.json(list);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/prescriptions", async (req, res) => {
    try {
      const saved = await db.savePrescription(req.body);
      res.status(201).json(saved);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==========================================
  // HEALTH RECORDS
  // ==========================================
  app.get("/api/health-records", async (req, res) => {
    try {
      const patientId = req.query.patientId as string | undefined;
      const list = await db.getHealthRecords(patientId);
      res.json(list);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/health-records", async (req, res) => {
    try {
      const saved = await db.saveHealthRecord(req.body);
      res.status(201).json(saved);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/health-records/:id", async (req, res) => {
    try {
      await db.deleteHealthRecord(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==========================================
  // CONSENT REQUESTS
  // ==========================================
  app.get("/api/consent-requests", async (req, res) => {
    try {
      const patientId = req.query.patientId as string | undefined;
      const list = await db.getConsentRequests(patientId);
      res.json(list);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/consent-requests", async (req, res) => {
    try {
      const saved = await db.saveConsentRequest(req.body);
      res.status(201).json(saved);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/consent-requests/:id", async (req, res) => {
    try {
      const { status } = req.body;
      const updated = await db.updateConsentStatus(req.params.id, status);
      if (!updated) return res.status(404).json({ error: "Consent request not found" });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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
