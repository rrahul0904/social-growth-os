export type RedactionKind =
  | "email"
  | "api_token"
  | "private_key"
  | "database_url"
  | "financial_amount";

export interface RedactionPolicy {
  redactEmails?: boolean;
  redactFinancialAmounts?: boolean;
}

export interface RedactionResult {
  text: string;
  kinds: RedactionKind[];
  changed: boolean;
}

const TOKEN_PATTERNS = [
  /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g,
  /\bsk-[A-Za-z0-9_-]{20,}\b/g,
  /\b(?:xox[baprs]-)[A-Za-z0-9-]{10,}\b/g,
  /\b[A-Za-z0-9_-]{24,}\.[A-Za-z0-9_-]{6,}\.[A-Za-z0-9_-]{20,}\b/g,
];

const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PRIVATE_KEY_PATTERN = /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g;
const DATABASE_URL_PATTERN = /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/[^\s]+/gi;
const FINANCIAL_AMOUNT_PATTERN = /(?<![A-Za-z0-9])(?:[$€£]\s?\d[\d,]*(?:\.\d{1,2})?|\d[\d,]*(?:\.\d{1,2})?\s?(?:USD|EUR|GBP))(?![A-Za-z0-9])/gi;

function replaceAndRecord(
  input: string,
  pattern: RegExp,
  replacement: string,
  kind: RedactionKind,
  kinds: Set<RedactionKind>,
): string {
  pattern.lastIndex = 0;
  if (!pattern.test(input)) return input;
  pattern.lastIndex = 0;
  kinds.add(kind);
  return input.replace(pattern, replacement);
}

export function redactForPublication(
  input: string,
  policy: RedactionPolicy = {},
): RedactionResult {
  const kinds = new Set<RedactionKind>();
  let text = input;

  for (const pattern of TOKEN_PATTERNS) {
    text = replaceAndRecord(text, pattern, "[REDACTED_TOKEN]", "api_token", kinds);
  }

  text = replaceAndRecord(
    text,
    PRIVATE_KEY_PATTERN,
    "[REDACTED_PRIVATE_KEY]",
    "private_key",
    kinds,
  );

  text = replaceAndRecord(
    text,
    DATABASE_URL_PATTERN,
    "[REDACTED_DATABASE_URL]",
    "database_url",
    kinds,
  );

  if (policy.redactEmails !== false) {
    text = replaceAndRecord(text, EMAIL_PATTERN, "[REDACTED_EMAIL]", "email", kinds);
  }

  if (policy.redactFinancialAmounts) {
    text = replaceAndRecord(
      text,
      FINANCIAL_AMOUNT_PATTERN,
      "[REDACTED_AMOUNT]",
      "financial_amount",
      kinds,
    );
  }

  return {
    text,
    kinds: [...kinds],
    changed: text !== input,
  };
}
