/*
 * data validation functions
 */

function stringOptional(value, maxLen = 0) {
  if (value == null) return true;
  if (typeof value !== 'string') return false;
  if (maxLen && value.length > maxLen) return false;
  return true;
}

function stringRequired(value, maxLen = 0) {
  if (value == null) return false;
  if (typeof value !== 'string') return false;
  if (value.length === 0) return false;
  if (maxLen && value.length > maxLen) return false;
  return true;
}

function numberOptional(value) {
  return value == null || typeof value === 'number';
}

function numberRequired(value) {
  return typeof value === 'number';
}

module.exports = {
  stringOptional,
  stringRequired,
  numberOptional,
  numberRequired,
};
