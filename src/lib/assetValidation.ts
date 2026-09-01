import type { AssetForm } from "@/types/asset";

export type ValidationErrors = Partial<Record<keyof AssetForm, string | undefined>>;

export function validateAssetForm(form: AssetForm): ValidationErrors {
  const errors: ValidationErrors = {};

  // Title validation
  if (!form.title || !form.title.trim()) {
    errors.title = "Title is required";
  } else if (form.title.length < 5) {
    errors.title = "Title must be at least 5 characters";
  } else if (form.title.length > 150) {
    errors.title = "Title must not exceed 150 characters";
  }

  // Description validation
  if (!form.descriptionShort || !form.descriptionShort.trim()) {
    errors.descriptionShort = "Description is required";
  } else if (form.descriptionShort.length < 10) {
    errors.descriptionShort = "Description must be at least 10 characters";
  } else if (form.descriptionShort.length > 500) {
    errors.descriptionShort = "Description must not exceed 500 characters";
  }

  // Country validation
  if (!form.country || !form.country.trim()) {
    errors.country = "Country is required";
  }

  // Asking price validation
  if (!form.askingPrice) {
    errors.askingPrice = "Price is required";
  } else {
    const price = Number(form.askingPrice);
    if (isNaN(price)) {
      errors.askingPrice = "Price must be a valid number";
    } else if (price <= 0) {
      errors.askingPrice = "Price must be greater than 0";
    } else if (price > 1000000000) {
      errors.askingPrice = "Price exceeds maximum limit";
    }
  }

  // Currency validation
  if (!form.currency) {
    errors.currency = "Currency is required";
  }

  // Business type validation
  if (!form.typeOfBusiness) {
    errors.typeOfBusiness = "Business type is required";
  }

  // Business status validation
  if (!form.businessStatus) {
    errors.businessStatus = "Business status is required";
  }

  // Asset type validation
  if (!form.assetType) {
    errors.assetType = "Asset type is required";
  }

  // License type validation (optional)
  if (form.typeOfLicense && form.typeOfLicense.length > 100) {
    errors.typeOfLicense = "License type must not exceed 100 characters";
  }

  // Regulatory validation (optional)
  if (form.regulatory && form.regulatory.length > 200) {
    errors.regulatory = "Regulatory info must not exceed 200 characters";
  }

  // Employees validation (optional but if provided must be valid)
  if (form.employees) {
    const employees = Number(form.employees);
    if (isNaN(employees)) {
      errors.employees = "Employees must be a valid number";
    } else if (employees < 0) {
      errors.employees = "Employees cannot be negative";
    } else if (employees > 1000000) {
      errors.employees = "Employees exceeds maximum limit";
    }
  }

  // Year of issue validation (optional but if provided must be valid)
  if (form.yearOfIssue) {
    const year = Number(form.yearOfIssue);
    const currentYear = new Date().getFullYear();
    if (isNaN(year)) {
      errors.yearOfIssue = "Year must be a valid number";
    } else if (year < 1900) {
      errors.yearOfIssue = "Year cannot be before 1900";
    } else if (year > currentYear) {
      errors.yearOfIssue = `Year cannot be in the future (max ${currentYear})`;
    }
  }

  return errors;
}

export function isFormValid(errors: ValidationErrors): boolean {
  return Object.keys(errors).length === 0;
}
