/**
 * String utility functions for handling Vietnamese text
 */

/**
 * Removes accents/diacritics from a Vietnamese string
 * @param {string} str 
 * @returns {string} Unaccented string
 */
const removeAccents = (str) => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

/**
 * Creates a Regex string that matches accented and unaccented characters 
 * for MongoDB $regex search.
 * @param {string} searchTerm 
 * @returns {string} Regex pattern string
 */
const createAccentInsensitiveRegex = (searchTerm) => {
  if (!searchTerm) return '';
  const map = {
    a: '[aAáÁàÀảẢãÃạẠăĂắẮằẰẳẲẵẴặẶâÂấẤầẦẩẨẫẪậẬ]',
    e: '[eEéÉèÈẻẺẽẼẹẸêÊếẾềỀểỂễỄệỆ]',
    i: '[iIíÍìÌỉỈĩĨịỊ]',
    o: '[oOóÓòÒỏỎõÕọỌôÔốỐồỒổỔỗỖộỘơƠớỚờỜởỞỡỠợỢ]',
    u: '[uUúÚùÙủỦũŨụỤưƯứỨừỪửỬữỮựỰ]',
    y: '[yYýÝỳỲỷỶỹỸỵỴ]',
    d: '[dDđĐ]'
  };
  
  const normalized = removeAccents(searchTerm);
  
  let regexStr = '';
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i].toLowerCase();
    if (map[char]) {
      regexStr += map[char];
    } else if (char.trim() !== '') {
      regexStr += char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    } else {
      regexStr += '\\s+';
    }
  }
  return regexStr;
};

module.exports = {
  removeAccents,
  createAccentInsensitiveRegex
};
