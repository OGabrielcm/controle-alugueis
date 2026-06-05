export const LOGIN_PATH = "/login";
export const SIGNUP_PATH = "/cadastro";
export const DASHBOARD_HOME = "/dashboard";

const authRoutes = new Set([LOGIN_PATH, SIGNUP_PATH]);
const operationalPrefixes = [DASHBOARD_HOME, "/imoveis", "/importar"];

export function isAuthRoute(pathname: string) {
  return authRoutes.has(pathname);
}

export function isOperationalRoute(pathname: string) {
  if (pathname === "/") return false;
  return operationalPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
