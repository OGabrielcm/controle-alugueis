export const LOGIN_PATH = "/login";
export const SIGNUP_PATH = "/cadastro";
export const PASSWORD_RECOVERY_PATH = "/recuperar-senha";
export const PASSWORD_RESET_PATH = "/redefinir-senha";
export const SIGNUP_CONFIRMATION_PATH = "/cadastro/confirmar-email";
export const DASHBOARD_HOME = "/dashboard";

const authRoutes = new Set([LOGIN_PATH, SIGNUP_PATH, PASSWORD_RECOVERY_PATH, PASSWORD_RESET_PATH, SIGNUP_CONFIRMATION_PATH]);
const operationalPrefixes = [DASHBOARD_HOME, "/imoveis", "/importar"];

export function isAuthRoute(pathname: string) {
  return authRoutes.has(pathname);
}

export function isOperationalRoute(pathname: string) {
  if (pathname === "/") return false;
  return operationalPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
