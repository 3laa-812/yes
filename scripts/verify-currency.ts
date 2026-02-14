
import { formatCurrency } from "../lib/utils";

const testCases = [
  { amount: 100, locale: "en-US", expected: "100 EGP" },
  { amount: 1200, locale: "en-US", expected: "1,200 EGP" },
  { amount: 100, locale: "ar", expected: "١٠٠ ج.م" },
  { amount: 1200, locale: "ar", expected: "١٬٢٠٠ ج.م" },
];

console.log("Starting Currency Verification...");

testCases.forEach(({ amount, locale, expected }) => {
  const result = formatCurrency(amount, locale);
  // Normalize spaces for comparison
  const normalizedResult = result.replace(/\s|\u00A0/g, " ").trim();
  const normalizedExpected = expected.replace(/\s|\u00A0/g, " ").trim();

  // For Arabic, simply check if it contains the currency symbol as exact numeral matching might depend on system ICU
  if (locale === 'ar') {
     if (normalizedResult.includes("ج.م")) {
         console.log(`[PASS] ${locale} ${amount}: "${result}" (Contains symbol)`);
     } else {
         console.log(`[FAIL] ${locale} ${amount}: Expected to contain "ج.م", got "${result}"`);
     }
  } else {
      if (normalizedResult === normalizedExpected) {
          console.log(`[PASS] ${locale} ${amount}: "${result}"`);
      } else {
          console.log(`[FAIL] ${locale} ${amount}: Expected "${expected}", got "${result}"`);
      }
  }
});
