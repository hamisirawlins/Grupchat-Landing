const { chromium } = require("playwright-core");
const fs = require("fs"); const path = require("path");
const BASE = "http://localhost:3000";
const OUT = path.join(__dirname, "out"); fs.mkdirSync(OUT, { recursive: true });
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

async function journey(label, ctxOpts, person) {
  const browser = await chromium.launch({ channel: "chrome", headless: true, slowMo: 120 });
  const context = await browser.newContext({ ...ctxOpts, recordVideo: { dir: OUT, size: ctxOpts.viewport } });
  const page = await context.newPage();
  page.setDefaultTimeout(90000);
  const email = `test.${label}.${Date.now()}@example.com`;
  const log = (m) => console.log(`[${label}] ${m}`);

  // 1. Sign up
  await page.goto(`${BASE}/sign-up`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Create your account" }).waitFor();
  await pause(1200);
  await page.fill("#fullName", person); await pause(300);
  await page.fill("#email", email); await pause(300);
  await page.fill("#password", "DemoPass!2026"); await pause(300);
  await page.fill("#confirmPassword", "DemoPass!2026"); await pause(600);
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL(/\/home$/); log(`signed up as ${email} → /home`);
  await page.getByRole("heading", { level: 1 }).waitFor();
  await pause(2500);

  // 2. Create a plan
  await page.getByRole("link", { name: /Create a plan/ }).click();
  await page.waitForURL(/\/plans\/new$/);
  await page.getByRole("heading", { name: "Create a plan" }).waitFor();
  await pause(900);
  await page.fill("#name", "Weekend at Naivasha"); await pause(300);
  await page.selectOption("#category", "trip"); await pause(300);
  await page.fill("#description", "Two nights by the lake — boat ride, Hell's Gate cycling, nyama choma."); await pause(700);
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("heading", { name: "Collecting money?" }).waitFor(); await pause(900);
  await page.fill("#target", "15000"); await pause(700);
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("heading", { name: "Looks right?" }).waitFor(); await pause(1500);
  await page.getByRole("button", { name: "Create plan" }).click();
  await page.waitForURL(/\/plans\/[^/]+$/); log("plan created → " + page.url().split("/").pop());
  await page.getByRole("heading", { name: "Weekend at Naivasha" }).waitFor();
  await pause(2000);

  // 3. One checklist item, to show the plan taking shape
  await page.getByRole("button", { name: "Add item" }).click();
  await page.fill("#item-title", "Book the lodge"); await pause(500);
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await page.getByText("Book the lodge").waitFor(); await pause(1200);
  if (ctxOpts.isMobile) { await page.mouse.wheel(0, 400); await pause(1200); }
  await pause(1500);

  const video = page.video();
  await context.close(); await browser.close();
  const src = await video.path(); const dst = path.join(OUT, `journey-${label}.webm`);
  fs.renameSync(src, dst); log(`video → ${dst}`);
  return { email, dst };
}

(async () => {
  const m = await journey("mobile", { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, "Demo Wanjiru");
  const d = await journey("desktop", { viewport: { width: 1280, height: 800 } }, "Demo Otieno");
  fs.writeFileSync(path.join(OUT, "accounts.json"), JSON.stringify({ mobile: m.email, desktop: d.email, password: "DemoPass!2026" }, null, 2));
})().catch((e) => { console.error("RECORDING FAILED:", e.message); process.exit(1); });
