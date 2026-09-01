type BuyerProfile = {
  contactName: string;
  companyName: string | null;
  investmentInterests: string | null;
};

export type BuyerValidationErrors = Partial<Record<keyof BuyerProfile, string | undefined>>;

export function validateBuyerProfile(profile: BuyerProfile): BuyerValidationErrors {
  const errors: BuyerValidationErrors = {};

  // Contact name validation
  if (!profile.contactName || !profile.contactName.trim()) {
    errors.contactName = "Contact name is required";
  } else if (profile.contactName.length < 2) {
    errors.contactName = "Contact name must be at least 2 characters";
  } else if (profile.contactName.length > 100) {
    errors.contactName = "Contact name must not exceed 100 characters";
  }

  // Company name validation (optional)
  if (profile.companyName && profile.companyName.length > 150) {
    errors.companyName = "Company name must not exceed 150 characters";
  }

  // Investment interests validation (optional)
  if (profile.investmentInterests && profile.investmentInterests.trim()) {
    if (profile.investmentInterests.length < 10) {
      errors.investmentInterests = "Investment interests must be at least 10 characters";
    } else if (profile.investmentInterests.length > 1000) {
      errors.investmentInterests = "Investment interests must not exceed 1000 characters";
    }
  }

  return errors;
}

export function isProfileValid(errors: BuyerValidationErrors): boolean {
  return Object.keys(errors).length === 0;
}
