import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import axios from "axios";

// Inisialisasi client
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
  },
});

async function getPrayerTimes(city: string) {
  try {
    // Gunakan koordinat kota (contoh: Jakarta)
    const response = await axios.get(
      `http://api.aladhan.com/v1/timingsByCity`,
      {
        params: {
          city: city || "Jakarta",
          country: "Indonesia",
          method: 11, // Method 11 untuk Indonesia
        },
      }
    );

    const data = response.data.data;
    const timings = data.timings;

    return `Jadwal Sholat untuk ${city}:
📆 ${data.date.readable}

Subuh: ${timings.Fajr}
Dzuhur: ${timings.Dhuhr}
Ashar: ${timings.Asr}
Maghrib: ${timings.Maghrib}
Isya: ${timings.Isha}`;
  } catch (error) {
    return "Maaf, terjadi kesalahan saat mengambil jadwal sholat.";
  }
}

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

client.on("message", async (msg) => {
  const command = msg.body.toLowerCase();

  // Command untuk jadwal sholat: !sholat <nama_kota>
  if (command.startsWith("!sholat ")) {
    const city = command.slice(8); // Mengambil nama kota setelah "!sholat "
    const prayerTimes = await getPrayerTimes(city);
    msg.reply(prayerTimes);
  }
});

// Inisialisasi client
client.initialize();
