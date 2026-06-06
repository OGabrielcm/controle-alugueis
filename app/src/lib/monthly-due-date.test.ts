import test from "node:test";
import assert from "node:assert/strict";
import { buildMonthlyDueDate, formatMonthlyDueDay, getMonthlyDueDay } from "./monthly-due-date";

test("extrai o dia mensal de uma data ISO existente", () => {
  assert.equal(getMonthlyDueDay("2026-10-02"), "2");
});

test("monta uma data técnica usando o mês do início do contrato", () => {
  assert.equal(buildMonthlyDueDate("31", "2026-02-10"), "2026-02-28");
  assert.equal(buildMonthlyDueDate("10", "2026-06-01"), "2026-06-10");
});

test("rejeita dia mensal inválido", () => {
  assert.equal(buildMonthlyDueDate("0", "2026-06-01"), "");
  assert.equal(buildMonthlyDueDate("32", "2026-06-01"), "");
  assert.equal(buildMonthlyDueDate("abc", "2026-06-01"), "");
});

test("formata vencimento mensal para a UI", () => {
  assert.equal(formatMonthlyDueDay("2026-10-02"), "Todo dia 2");
  assert.equal(formatMonthlyDueDay(undefined), "—");
});
