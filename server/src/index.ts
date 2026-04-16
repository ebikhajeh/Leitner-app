import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { requireAuth } from "./middleware/requireAuth";

const app = express();
const PORT = process.env.PORT ?? 3000;

// BetterAuth handler must be registered before express.json()
app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/me", requireAuth, (_req, res) => {
  res.json({ user: res.locals.user, session: res.locals.session });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
