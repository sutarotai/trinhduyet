const express = require("express");
const chromium = require("chrome-aws-lambda");
const app = express();

app.get("/", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("Thiếu ?url=");

  let browser = null;

  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    const content = await page.content();
    res.setHeader("Content-Type", "text/html; charset=UTF-8");
    res.send(content);
  } catch (e) {
    console.error(e);
    res.status(500).send("Lỗi khi render: " + e.message);
  } finally {
    if (browser) await browser.close();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("⚡ Server chạy tại port " + PORT));
