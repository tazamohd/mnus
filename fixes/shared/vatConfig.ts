/**
 * SALIS AUTO - VAT Configuration Service
 * 
 * FIXES APPLIED:
 * - [C6] VAT rate stored in database config table instead of hardcoded
 * - Supports rate changes without code deployment
 * - Includes audit trail for rate changes
 */

import { pgTable, text, real, timestamp, boolean, serial } from 'drizzle-orm/pg-core';

// ============================================================
// Database Schema: vat_config table
// ============================================================
export const vatConfig = pgTable('vat_config', {
  id: serial('id').primaryKey(),
  countryCode: text('country_code').notNull().default('SA'),
  vatRate: real('vat_rate').notNull().default(0.15),
  vatRegistrationNumber: text('vat_registration_number'),
  companyNameAr: text('company_name_ar'),
  companyNameEn: text('company_name_en'),
  isActive: boolean('is_active').notNull().default(true),
  effectiveFrom: timestamp('effective_from').notNull().defaultNow(),
  effectiveTo: timestamp('effective_to'),
  changedBy: text('changed_by'),
  changeReason: text('change_reason'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================================
// VAT Calculation Utilities (using configurable rate)
// ============================================================
export interface VATResult {
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  currency: string;
}

export function calculateVAT(
  subtotal: number,
  vatRate: number = 0.15,
  currency: string = 'SAR'
): VATResult {
  const vatAmount = Math.round(subtotal * vatRate * 100) / 100;
  const total = Math.round((subtotal + vatAmount) * 100) / 100;

  return {
    subtotal,
    vatRate,
    vatAmount,
    total,
    currency,
  };
}

export function calculateVATInclusive(
  totalWithVAT: number,
  vatRate: number = 0.15,
  currency: string = 'SAR'
): VATResult {
  const subtotal = Math.round((totalWithVAT / (1 + vatRate)) * 100) / 100;
  const vatAmount = Math.round((totalWithVAT - subtotal) * 100) / 100;

  return {
    subtotal,
    vatRate,
    vatAmount,
    total: totalWithVAT,
    currency,
  };
}

// ============================================================
// GOSI Configuration (not hardcoded in frontend)
// ============================================================
export const gosiConfig = pgTable('gosi_config', {
  id: serial('id').primaryKey(),
  employeeContributionRate: real('employee_contribution_rate').notNull().default(0.0975), // 9.75%
  employerContributionRate: real('employer_contribution_rate').notNull().default(0.1175), // 11.75%
  maxContributionSalary: real('max_contribution_salary').notNull().default(45000), // SAR
  isActive: boolean('is_active').notNull().default(true),
  effectiveFrom: timestamp('effective_from').notNull().defaultNow(),
  effectiveTo: timestamp('effective_to'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export interface GOSIResult {
  baseSalary: number;
  employeeContribution: number;
  employerContribution: number;
  totalContribution: number;
  netSalary: number;
}

export function calculateGOSI(
  baseSalary: number,
  employeeRate: number = 0.0975,
  employerRate: number = 0.1175,
  maxSalary: number = 45000
): GOSIResult {
  const contributionBase = Math.min(baseSalary, maxSalary);
  const employeeContribution = Math.round(contributionBase * employeeRate * 100) / 100;
  const employerContribution = Math.round(contributionBase * employerRate * 100) / 100;

  return {
    baseSalary,
    employeeContribution,
    employerContribution,
    totalContribution: employeeContribution + employerContribution,
    netSalary: baseSalary - employeeContribution,
  };
}

export default {
  vatConfig,
  gosiConfig,
  calculateVAT,
  calculateVATInclusive,
  calculateGOSI,
};
