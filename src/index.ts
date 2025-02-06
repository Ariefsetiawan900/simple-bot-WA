import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

// Inisialisasi client
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
  },
});

// Generate QR Code
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log("QR Code generated. Scan with WhatsApp!");
});

// Ketika client siap
client.on("ready", () => {
  console.log("Client is ready!");
});

// Handle pesan masuk
client.on("message", async (message) => {
  if (message.body === "!ping") {
    await message.reply("pong");
  }

  // Handle pesan dengan awalan !
  if (message.body.startsWith("!hello")) {
    await message.reply("Hello! How can I help you?");
  }
});

client.on("message", async (message) => {
  // Command untuk sticker
  if (message.body === "!sticker" && message.hasMedia) {
    const media = await message.downloadMedia();
    await message.reply(media, undefined, { sendMediaAsSticker: true });
  }

  // Command untuk info
  if (message.body === "!info") {
    const chat = await message.getChat();
    await message.reply(`
            Chat Info:
            Name: ${chat.name}
            IsGroup: ${chat.isGroup}
            
        `);
  }

  // Echo command
  if (message.body.startsWith("!echo ")) {
    const text = message.body.slice(6); // Remove !echo
    await message.reply(text);
  }
});

// Inisialisasi client
client.initialize();
