import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { requireAuth } from "./middleware/requireAuth";
import wordsRouter from "./routes/words";
import generateRouter from "./routes/generate";
import dashboardRouter from "./routes/dashboard";
import settingsRouter from "./routes/settings";
import statsRouter from "./routes/stats";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

if (process.env.NODE_ENV === "production") {
  app.use(
    "/api/auth",
    rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false })
  );
}

// BetterAuth handler must be registered before express.json()
app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/me", requireAuth, (_req, res) => {
  const { id, name, email, image } = res.locals.user;
  res.json({ user: { id, name, email, image } });
});

app.use("/api/words", wordsRouter);
app.use("/api/generate-word", generateRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/stats", statsRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
