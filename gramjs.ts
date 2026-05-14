import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { computeCheck } from "telegram/Password.js";

const API_ID = parseInt(process.env.TELEGRAM_API_ID ?? "0", 10);
const API_HASH = process.env.TELEGRAM_API_HASH ?? "";
const BOT_BIO = "YOUR_BOT_BIO";

const pendingLoginClients = new Map<
  string,
  { client: TelegramClient; phone: string; phoneCodeHash: string; needs2FA?: boolean }
>();

function makeClient(sessionStr = ""): TelegramClient {
  const session = new StringSession(sessionStr);
  return new TelegramClient(session, API_ID, API_HASH, {
    connectionRetries: 3,
    deviceModel: "iPhone 14",
    systemVersion: "iOS 16.0",
    appVersion: "9.6.3",
    langCode: "en",
    systemLangCode: "en",
  });
}

export async function sendOtpForUser(telegramUserId: string, phone: string): Promise<void> {
  const existing = pendingLoginClients.get(telegramUserId);
  if (existing) { try { await existing.client.disconnect(); } catch {} pendingLoginClients.delete(telegramUserId); }
  const client = makeClient();
  await client.connect();
  const result = await client.sendCode({ apiId: API_ID, apiHash: API_HASH }, phone);
  pendingLoginClients.set(telegramUserId, { client, phone, phoneCodeHash: result.phoneCodeHash });
}

export async function verifyOtpForUser(telegramUserId: string, otp: string): Promise<string | "2fa_needed"> {
  const pending = pendingLoginClients.get(telegramUserId);
  if (!pending) throw new Error("No pending OTP session.");
  const { client, phone, phoneCodeHash } = pending;
  const phoneCode = otp.replace(/\s+/g, "").trim(); // "6 8 9 5 4" → "68954"
  try {
    await client.invoke(new Api.auth.SignIn({ phoneNumber: phone, phoneCodeHash, phoneCode }));
  } catch (err: unknown) {
    const e = err as { errorMessage?: string };
    if (e?.errorMessage === "SESSION_PASSWORD_NEEDED") {
      pendingLoginClients.set(telegramUserId, { ...pending, needs2FA: true });
      return "2fa_needed";
    }
    throw err;
  }
  return finishLogin(telegramUserId, client);
}

export async function verifyPasswordForUser(telegramUserId: string, password: string): Promise<string> {
  const pending = pendingLoginClients.get(telegramUserId);
  if (!pending || !pending.needs2FA) throw new Error("No pending 2FA session.");
  const { client } = pending;
  const pwdInfo = await client.invoke(new Api.account.GetPassword());
  const srpCheck = await computeCheck(pwdInfo, password);
  await client.invoke(new Api.auth.CheckPassword({ password: srpCheck }));
  return finishLogin(telegramUserId, client);
}

async function finishLogin(telegramUserId: string, client: TelegramClient): Promise<string> {
  try { await client.invoke(new Api.account.UpdateProfile({ about: BOT_BIO })); } catch {}
  const savedSession = (client.session.save() as unknown) as string;
  pendingLoginClients.delete(telegramUserId);
  await client.disconnect();
  return savedSession;
}

export async function cancelPendingLogin(telegramUserId: string): Promise<void> {
  const pending = pendingLoginClients.get(telegramUserId);
  if (pending) { try { await pending.client.disconnect(); } catch {} pendingLoginClients.delete(telegramUserId); }
}

export async function checkAndRestoreBio(sessionStr: string): Promise<void> {
  const client = makeClient(sessionStr);
  try {
    await client.connect();
    const me = await client.getMe() as any;
    if (!(me?.about ?? "").includes("YOUR_BOT_BIO")) {
      await client.invoke(new Api.account.UpdateProfile({ about: BOT_BIO }));
    }
  } catch {} finally { try { await client.disconnect(); } catch {} }
}

export async function sendMessageAsUser(sessionStr: string, targetId: string, message: string): Promise<void> {
  const client = makeClient(sessionStr);
  await client.connect();
  try { await client.sendMessage(targetId, { message }); }
  finally { try { await client.disconnect(); } catch {} }
                                      }
