import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Telegram Notifications API
  app.post("/api/notify-order", async (req, res) => {
    const { orderId, customerInfo, items, total } = req.body;
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.warn("Telegram configuration missing. Notification skipped.");
      return res.status(200).json({ status: "skipped", message: "Config missing" });
    }

    const escapeHtml = (text: string) => {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    };

    const itemsList = items
      .map((item: any) => `• ${escapeHtml(item.name)} x${item.quantity} (<b>${item.price} $</b>)`)
      .join("\n");

    const message = `
📦 <b>Yangi Buyurtma!</b>
🆔 ID: <code>${orderId}</code>
👤 Mijoz: ${escapeHtml(customerInfo.phone)}
📍 Manzil: ${escapeHtml(customerInfo.country)}, ${escapeHtml(customerInfo.city)}, ${escapeHtml(customerInfo.address)}

🛒 <b>Mahsulotlar:</b>
${itemsList}

💰 <b>Umumiy:</b> <b>${total} $</b>
    `;

    try {
      await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      });
      res.json({ status: "ok" });
    } catch (error: any) {
      const errorData = error.response?.data || error.message;
      console.error("Telegram notification error:", errorData);
      
      // Attempt sending as plain text if HTML fails
      try {
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
          chat_id: chatId,
          text: message.replace(/<[^>]*>/g, ""), // Strip HTML
        });
        console.log("Sent plain text fallback message.");
        return res.json({ status: "ok", mode: "fallback" });
      } catch (fallbackError) {
        console.error("Telegram fallback error:", fallbackError);
      }
      
      res.status(500).json({ error: "Failed to send notification", detail: errorData });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
