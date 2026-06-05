import { z } from "zod";

export type AuthMode = "login" | "signup";

export type AuthFormFields = {
  email: string;
  password: string;
};

const authFormSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(8, "Use pelo menos 8 caracteres."),
});

export function validateAuthForm(fields: AuthFormFields) {
  const parsed = authFormSchema.safeParse(fields);

  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? "Revise os dados de acesso.",
    };
  }

  return {
    ok: true as const,
    data: parsed.data,
  };
}

export function getAuthModeCopy(mode: AuthMode) {
  if (mode === "signup") {
    return {
      title: "Criar acesso privado",
      description: "Crie o login que será usado para gravar imóveis com owner_id no Supabase.",
      submitLabel: "Criar conta",
      alternateLabel: "Já tenho conta",
    };
  }

  return {
    title: "Entrar no MVP privado",
    description: "Entre no MVP privado para preparar o próximo passo: salvar imóveis reais com RLS por usuário.",
    submitLabel: "Entrar",
    alternateLabel: "Criar conta",
  };
}
