// server.js

const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const app = express();
const PORT = 5042;

app.use(cors());
app.use(express.json());

let eventLogs = [];

app.get("/preview", async (req, res) => {
  const { url, adTag } = req.query;

  if (!url) return res.status(400).send("Missing URL");

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      executablePath: "/usr/bin/chromium-browser", // Use system Chromium (ARM64 compatible)
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled"
      ]
    });

    const page = await browser.newPage();

    // Anti-bot tweaks
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36"
    );
    await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
    await page.setJavaScriptEnabled(true);
    await page.setBypassCSP(true);

    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
      window.chrome = { runtime: {} };
      Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3] });
      Object.defineProperty(navigator, "languages", {
        get: () => ["en-US", "en"]
      });
    });

    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    // Inject ad tag if provided
    if (adTag) {
      const decodedTag = decodeURIComponent(adTag);
      await page.evaluate((html) => {
        const container = document.createElement("div");
        container.innerHTML = html;
        container.id = "injected-ad-tag";
        document.head.appendChild(container);

        // Ensure script tags execute
        container.querySelectorAll("script").forEach((script) => {
          const newScript = document.createElement("script");
          if (script.src) newScript.src = script.src;
          else newScript.textContent = script.innerText;
          script.parentNode.replaceChild(newScript, script);
        });
      }, decodedTag);
    }

    // Make asset URLs absolute & remove CSP
    await page.evaluate(() => {
      const makeAbsolute = (path) => {
        try {
          return new URL(path, window.location.href).href;
        } catch {
          return path;
        }
      };
      document.querySelectorAll("[src]").forEach((el) => (el.src = makeAbsolute(el.src)));
      document.querySelectorAll("[href]").forEach((el) => (el.href = makeAbsolute(el.href)));
      document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]').forEach(el => el.remove());
    });

    const finalContent = await page.content();
    await browser.close();

    res.setHeader("Content-Type", "text/html");
    res.send(finalContent);

  } catch (err) {
    console.error("Puppeteer error:", err);
    res.status(500).send("Preview generation failed.");
  }
});

app.post("/log", (req, res) => {
  eventLogs.push(req.body);
  console.log("[Event Log]", req.body);
  res.sendStatus(200);
});

app.get("/report", (req, res) => {
  const report = eventLogs.map(event => {
    return `Type: ${event.type}, X: ${event.x}, Y: ${event.y}, Time: ${new Date(event.timestamp).toLocaleString()}`;
  }).join("\n");

  res.setHeader("Content-Disposition", "attachment; filename=event-log.txt");
  res.setHeader("Content-Type", "text/plain");
  res.send(report);
});

app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});
