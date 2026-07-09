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
  total: number;
}

export function computeBillTotals(
  subtotal: number,
  taxRatePercent: number,
  serviceChargePercent: number
): BillTotals {
  const safeSubtotal = Number.isFinite(subtotal) ? subtotal : 0;
  const safeTaxRate = Number.isFinite(taxRatePercent) ? taxRatePercent : 0;
  const safeServiceChargeRate = Number.isFinite(serviceChargePercent) ? serviceChargePercent : 0;

  const tax = (safeSubtotal * safeTaxRate) / 100;
  const cgst = tax / 2;
  const sgst = tax / 2;
  const serviceCharge = (safeSubtotal * safeServiceChargeRate) / 100;
  const total = safeSubtotal + tax + serviceCharge;

  return { subtotal: safeSubtotal, tax, cgst, sgst, serviceCharge, total };
}
