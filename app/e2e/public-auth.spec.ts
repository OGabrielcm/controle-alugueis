import { expect, test } from "@playwright/test";

test.describe("entradas públicas de autenticação", () => {
  test("redireciona a raiz para o login", async ({ page, request }) => {
    const response = await request.get("/", { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    expect(response.headers().location).toBe("/login");

    await page.goto("/login");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { level: 1, name: "Entrar no MVP privado" })).toBeVisible();
    await expect(page.getByLabel("E-mail")).toBeVisible();
    await expect(page.getByLabel("Senha")).toBeVisible();

    const signupLink = page.locator("header").getByRole("link", { name: "Criar conta separada" });
    await expect(signupLink).toHaveAttribute("href", "/cadastro");
  });

  test("expõe o cadastro separado do dashboard", async ({ page }) => {
    await page.goto("/cadastro");

    await expect(page).toHaveURL(/\/cadastro$/);
    await expect(page.getByRole("heading", { level: 1, name: "Criar conta do proprietário" })).toBeVisible();
    await expect(page.getByLabel("Confirmar e-mail")).toBeVisible();
  });

  test("expõe a recuperação de senha", async ({ page }) => {
    await page.goto("/recuperar-senha");

    await expect(page).toHaveURL(/\/recuperar-senha$/);
    await expect(page.getByRole("heading", { level: 1, name: "Recuperar senha" })).toBeVisible();
  });

  test("expõe o estado da configuração sem revelar credenciais", async ({ page }) => {
    await page.goto("/login");

    const status = page.getByText(/Supabase (Auth pronto|sem env)/);
    await expect(status).toBeVisible();

    const submit = page.getByRole("button", { name: "Entrar" });
    await expect(submit).toBeVisible();

    if ((await status.textContent()) === "Supabase sem env") {
      await expect(submit).toBeDisabled();
    } else {
      await expect(submit).toBeEnabled();
    }
  });
});
