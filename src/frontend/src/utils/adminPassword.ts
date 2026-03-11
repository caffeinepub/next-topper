const STORAGE_KEY = "next_topper_admin_pw";
const VERSION_KEY = "next_topper_admin_pw_v";
const CURRENT_VERSION = "2";
const DEFAULT_PASSWORD = "julfiquar";

// On each version bump, reset to the new default password
function initPassword(): void {
  try {
    const version = localStorage.getItem(VERSION_KEY);
    if (version !== CURRENT_VERSION) {
      localStorage.setItem(STORAGE_KEY, DEFAULT_PASSWORD);
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    }
  } catch {
    // ignore
  }
}

initPassword();

export function getStoredPassword(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_PASSWORD;
  } catch {
    return DEFAULT_PASSWORD;
  }
}

export function checkAdminPassword(password: string): boolean {
  return password === getStoredPassword();
}

export function saveAdminPassword(newPassword: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, newPassword);
  } catch {
    // ignore
  }
}
