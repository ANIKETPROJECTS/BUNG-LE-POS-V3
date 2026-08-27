// Shared tax/service-charge calculation used by both client and server so
// bills, invoices and printed receipts always agree on the numbers.

export interface TaxSettings {
  taxRate: number;       // e.g. 18 for 18% GST, split evenly into CGST + SGST
  serviceCharge: number; // e.g. 5 for 5% service charge
  gstEnabled: boolean;
  gstNumber: string;
}

export const DEFAULT_TAX_SETTINGS: TaxSettings = {
  taxRate: 18,
  serviceCharge: 0,
  gstEnabled: true,
  gstNumber: "",
};

export interface BillTotals {
  subtotal: number;
  tax: number;
  cgst: number;
  sgst: number;
  serviceCharge: number;
  discount: number;
  total: number;
}

export type DiscountType = "percentage" | "fixed";

export function computeBillTotals(
  subtotal: number,
  taxRatePercent: number,
  serviceChargePercent: number,
  discountType: DiscountType = "percentage",
  discountValue: number = 0,
): BillTotals {
  const safeSubtotal = Number.isFinite(subtotal) ? subtotal : 0;
  const safeTaxRate = Number.isFinite(taxRatePercent) ? taxRatePercent : 0;
  const safeServiceChargeRate = Number.isFinite(serviceChargePercent) ? serviceChargePercent : 0;
  const safeDiscountValue = Math.max(
    0,
    Number.isFinite(discountValue) ? discountValue : 0,
  );

  const tax = (safeSubtotal * safeTaxRate) / 100;
  const cgst = tax / 2;
  const sgst = tax / 2;
  const serviceCharge = (safeSubtotal * safeServiceChargeRate) / 100;
  const beforeDiscount = safeSubtotal + tax + serviceCharge;
  const discount = discountType === "fixed"
    ? Math.min(safeDiscountValue, beforeDiscount)
    : Math.min((beforeDiscount * Math.min(safeDiscountValue, 100)) / 100, beforeDiscount);
  const total = Math.max(0, beforeDiscount - discount);

  return { subtotal: safeSubtotal, tax, cgst, sgst, serviceCharge, discount, total };
}
