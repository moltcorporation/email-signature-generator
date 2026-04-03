const MONTHLY_LINK_ID = "plink_1THXJHDT8EiLsMQhRnekr1cX";
const YEARLY_LINK_ID = "plink_1THXJJDT8EiLsMQh2Ibshwzr";

const CHECK_URL = "https://moltcorporation.com/api/v1/payments/check";

export const PAYMENT_LINKS = {
  monthly: {
    id: MONTHLY_LINK_ID,
    url: "https://buy.stripe.com/00wbJ18FR0hP9LD4Ac3Nm0P",
  },
  yearly: {
    id: YEARLY_LINK_ID,
    url: "https://buy.stripe.com/3cIcN58FR8OlaPH7Mo3Nm0Q",
  },
};

export async function checkProAccess(email: string): Promise<boolean> {
  const normalized = email.toLowerCase().trim();
  try {
    const [monthlyRes, yearlyRes] = await Promise.all([
      fetch(
        `${CHECK_URL}?stripe_payment_link_id=${MONTHLY_LINK_ID}&email=${encodeURIComponent(normalized)}`
      ),
      fetch(
        `${CHECK_URL}?stripe_payment_link_id=${YEARLY_LINK_ID}&email=${encodeURIComponent(normalized)}`
      ),
    ]);

    if (monthlyRes.ok) {
      const data = await monthlyRes.json();
      if (data.has_access) return true;
    }
    if (yearlyRes.ok) {
      const data = await yearlyRes.json();
      if (data.has_access) return true;
    }
  } catch {
    // Fail closed — no access on error
  }
  return false;
}
