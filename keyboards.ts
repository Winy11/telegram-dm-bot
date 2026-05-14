import TelegramBot from "node-telegram-bot-api";

const CHANNEL_LINK = process.env.CHANNEL_LINK || "YOUR_CHANNEL_LINK";

export function joinKeyboard(): TelegramBot.InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: "📢 Join Channel", url: CHANNEL_LINK }],
      [{ text: "✅ Verify", callback_data: "verify" }],
    ],
  };
}

export function dashboardKeyboard(): TelegramBot.InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: "📱 Add Account", callback_data: "add_account" }],
      [{ text: "👤 Add User", callback_data: "add_user" }],
      [{ text: "📅 Schedule DM", callback_data: "schedule_dm" }],
      [{ text: "🚪 Logout Account", callback_data: "logout" }],
      [{ text: "📋 My Schedules", callback_data: "my_schedules" }],
      [
        { text: "💬 Support", callback_data: "support" },
        { text: "❓ Help", callback_data: "help" },
      ],
      [{ text: "🌐 Language", callback_data: "language" }],
    ],
  };
}

export function languageKeyboard(): TelegramBot.InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: "🇬🇧 English", callback_data: "lang_en" }],
      [{ text: "🇮🇳 Hindi (हिंदी)", callback_data: "lang_hi" }],
      [{ text: "🇨🇳 Chinese (中文)", callback_data: "lang_zh" }],
      [{ text: "◀️ Back", callback_data: "dashboard" }],
    ],
  };
}

export function backKeyboard(): TelegramBot.InlineKeyboardMarkup {
  return { inline_keyboard: [[{ text: "◀️ Back to Dashboard", callback_data: "dashboard" }]] };
}

export function cancelKeyboard(): TelegramBot.InlineKeyboardMarkup {
  return { inline_keyboard: [[{ text: "❌ Cancel", callback_data: "dashboard" }]] };
      }
