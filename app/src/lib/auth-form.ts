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

export function validatePasswordResetEmail(email: string) {
  const parsed = authFormSchema.pick({ email: true }).safeParse({ email });

  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? "Informe um e-mail válido.",
    };
  }

  return {
    ok: true as const,
    email: parsed.data.email,
  };
}

export function getSignupSuccessMessage() {
  return "Cadastro solicitado. Se essa conta já existia, nenhum novo e-mail será enviado; tente entrar pela página de login ou use recuperação de senha. Se for uma conta nova, confirme o e-mail de autorização antes de entrar.";
}

export function getPasswordResetSuccessMessage() {
  return "Se existir uma conta para esse e-mail, enviaremos um link de recuperação. Confira a caixa de entrada e o spam.";
}

export function getPasswordRecoveryPageCopy() {
  return {
    title: "Recuperar senha",
    description: "Informe o e-mail cadastrado para receber um link seguro de redefinição de senha.",
    submitLabel: "Enviar link de recuperação",
    successMessage: getPasswordResetSuccessMessage(),
  };
}

export function getAuthModeCopy(mode: AuthMode) {
  if (mode === "signup") {
    return {
      title: "Criar acesso privado",
      description: "Crie a conta e confirme o e-mail antes de entrar no MVP privado.",
      submitLabel: "Criar conta",
      alternateLabel: "Já tenho conta: ir para login",
    };
  }

  return {
    title: "Entrar no MVP privado",
    description: "Entre somente depois de confirmar o e-mail de autorização do Supabase.",
    submitLabel: "Entrar",
    alternateLabel: "Criar conta separada",
  };
}
