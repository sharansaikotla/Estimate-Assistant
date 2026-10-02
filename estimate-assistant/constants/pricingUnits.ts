import { LengthUnit } from './units';

// Pricing unit types
export type RollPricingUnit = 'per-roll';
export type LinearPricingUnit = 'per-yard' | 'per-foot' | 'per-meter';
export type AreaPricingUnit = 'per-sq-yard' | 'per-sq-foot' | 'per-sq-meter';
export type PricingUnit = RollPricingUnit | LinearPricingUnit | AreaPricingUnit;

// Check if pricing unit is roll-based
export const isRollPricingUnit = (unit: PricingUnit): unit is RollPricingUnit => {
  return unit === 'per-roll';
};

// Check if pricing unit is linear or area-based
export const isLinearPricingUnit = (unit: PricingUnit): unit is LinearPricingUnit => {
  return ['per-yard', 'per-foot', 'per-meter'].includes(unit);
};

export const isAreaPricingUnit = (unit: PricingUnit): unit is AreaPricingUnit => {
  return ['per-sq-yard', 'per-sq-foot', 'per-sq-meter'].includes(unit);
};

// Pricing unit display labels
export const PRICING_UNIT_LABELS: Record<PricingUnit, string> = {
  'per-roll': 'Per Roll',
  'per-yard': 'Per Yard',
  'per-foot': 'Per Foot',
  'per-meter': 'Per Meter',
  'per-sq-yard': 'Per Sq Yard',
  'per-sq-foot': 'Per Sq Foot',
  'per-sq-meter': 'Per Sq Meter',
};

// Pricing unit short labels for display
export const PRICING_UNIT_SHORT_LABELS: Record<PricingUnit, string> = {
  'per-roll': '/roll',
  'per-yard': '/yd',
  'per-foot': '/ft',
  'per-meter': '/m',
  'per-sq-yard': '/sq yd',
  'per-sq-foot': '/sq ft',
  'per-sq-meter': '/sq m',
};

// Default pricing unit
export const DEFAULT_PRICING_UNIT: PricingUnit = 'per-roll';

// Conversion factors to convert pricing to per linear yard
// For linear units: convert to per yard
export const LINEAR_TO_PER_YARD: Record<LinearPricingUnit, number> = {
  'per-yard': 1,
  'per-foot': 3, // 3 feet = 1 yard, so multiply price by 3
  'per-meter': 1.09361, // 1 meter = 1.09361 yards
};

// For area units: we need roll width to convert to linear pricing
// These factors convert area units to square yards
export const AREA_TO_SQ_YARD: Record<AreaPricingUnit, number> = {
  'per-sq-yard': 1,
  'per-sq-foot': 9, // 9 sq ft = 1 sq yard
  'per-sq-meter': 1 / 1.19599, // 1 sq meter = 1.19599 sq yards
};

// Area unit conversion factors (for calculating from linear dimensions)
export const SQ_FEET_TO_AREA_UNIT: Record<'sq-yard' | 'sq-foot' | 'sq-meter', number> = {
  'sq-yard': 1 / 9, // 9 sq ft = 1 sq yard
  'sq-foot': 1,
  'sq-meter': 0.092903, // 1 sq ft = 0.092903 sq meters
};
