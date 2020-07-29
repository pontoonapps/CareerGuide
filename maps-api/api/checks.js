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

function arrayOptional(value, memberCheck) {
  if (value == null) return true;
  if (!Array.isArray(value)) return false;

  // can't just do every(memberCheck) because every gives too many params
  return value.every((x) => memberCheck(x));
}

module.exports = {
  stringOptional,
  stringRequired,
  numberOptional,
  numberRequired,
  arrayOptional,
};
