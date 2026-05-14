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

// isAdmin=true hone par extra "👑 Admin Panel" button dikhega
export function dashboardKeyboard(isAdmin = false): TelegramBot.InlineKeyboardMarkup {
  const rows: TelegramBot.InlineKeyboardButton[][] = [
    [{ text: "📱 Add Account", callback_data: "add_account" }],
    [{ text: "👤 Add User", callback_data: "add_user" }],
    [{ text: "📅 Schedule DM", callback_data: "schedule_dm" }],
    [{ text: "🚪 Logout Account", callback_data: "logout" }],
    [{ text: "📋 My Schedules", callback_data: "my_schedules" }],
  ];
  if (isAdmin) {
    rows.push([{ text: "👑 Admin Panel", callback_data: "admin_panel" }]);
  }
  rows.push([
    { text: "💬 Support", callback_data: "support" },
    { text: "❓ Help", callback_data: "help" },
  ]);
  rows.push([{ text: "🌐 Language", callback_data: "language" }]);
  return { inline_keyboard: rows };
}

export function adminPanelKeyboard(): TelegramBot.InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: "➕ Add New Account", callback_data: "admin_add_account" }],
      [{ text: "📋 All Accounts", callback_data: "admin_all_accounts" }],
      [{ text: "👥 All Bot Users", callback_data: "admin_all_users" }],
      [{ text: "◀️ Back to Dashboard", callback_data: "dashboard" }],
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
