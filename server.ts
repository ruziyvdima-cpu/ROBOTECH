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
    await sendTelegramNotification(req, res, { orderId, customerInfo, items, total });
  });

  // Alias for the user's specific request format
  app.post("/order", async (req, res) => {
    const { id, phone, country, city, address } = req.body;
    // Map user's flat structure to our notification structure
    await sendTelegramNotification(req, res, {
      orderId: id || "EXTERNAL",
      customerInfo: { phone, country, city, address },
      items: [], // External orders might not have items list in this format
      total: "N/A"
    });
  });

  async function sendTelegramNotification(req: any, res: any, data: any) {
    const { orderId, customerInfo, items, total } = data;
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.warn("Telegram configuration missing. Notification skipped.");
      return res.status(200).json({ status: "skipped", message: "Config missing" });
    }

    const escapeHtml = (text: any) => {
      const str = String(text || "");
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    };

    const safeCustomerInfo = customerInfo || {};
    const safeItems = Array.isArray(items) ? items : [];

    const itemsList = safeItems.length > 0 
      ? safeItems.map((item: any) => `• ${escapeHtml(item?.name)} x${item?.quantity} (<b>${item?.price} $</b>)`).join("\n")
      : "<i>Ma'lumot mavjud emas</i>";

    const message = `
📦 <b>Yangi Buyurtma!</b>
🆔 ID: <code>${orderId}</code>
👤 Mijoz: ${escapeHtml(safeCustomerInfo.phone)}
✈️ Telegram: ${escapeHtml(safeCustomerInfo.telegram || "Noma'lum")}
📍 Manzil: ${escapeHtml(safeCustomerInfo.country)}, ${escapeHtml(safeCustomerInfo.city)}, ${escapeHtml(safeCustomerInfo.address)}

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
      const errorData = error.response?.data;
      const description = errorData?.description || error.message;
      
      const isBotToBotError = description.includes("can't send messages to the bot") || chatId === token?.split(":")[0];
      
      if (isBotToBotError) {
        console.error("❌ TELEGRAM CONFIG ERROR: Siz BOT ID ni kiritdingiz!");
        console.error("👉 TO'G'RILASH: Telegramda @userinfobot orqali O'ZINGIZNING shaxsiy ID raqamingizni oling (masalan: 123456789) va TELEGRAM_CHAT_ID o'rniga o'shani qo'ying.");
      } else {
        console.error("Telegram Error:", description);
      }
      
      // Attempt sending as plain text if HTML fails (unless it's a forbidden error)
      if (!isBotToBotError && token && chatId) {
        try {
          await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatId,
            text: message.replace(/<[^>]*>/g, ""),
          });
          return res.json({ status: "ok", mode: "fallback" });
        } catch (fallbackError: any) {
          console.error("Telegram Fallback Error:", fallbackError.message);
        }
      }
      
      res.status(500).json({ 
        error: "Telegram xatoligi", 
        detail: isBotToBotError ? "Siz bot ID ni kiritgansiz. O'zingizning shaxsiy ID raqamingizni kiriting." : description,
        help: "Qanday qilib ID olish: https://t.me/userinfobot"
      });
    }
  }

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
