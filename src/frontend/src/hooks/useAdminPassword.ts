import { Ed25519KeyIdentity } from "@dfinity/identity";

const SESSION_KEY = "_adminPwd";

export async function deriveIdentityFromPassword(
  password: string,
): Promise<Ed25519KeyIdentity> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`theduskylotus-admin-v1:${password}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const seed = new Uint8Array(hashBuffer);
  return Ed25519KeyIdentity.generate(seed);
}

export function useAdminPassword() {
  const getPassword = () => sessionStorage.getItem(SESSION_KEY);

  const login = (pwd: string) => {
    sessionStorage.setItem(SESSION_KEY, pwd);
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
  };

  return {
    getPassword,
    login,
    logout,
    isAuthenticated: !!sessionStorage.getItem(SESSION_KEY),
  };
}
