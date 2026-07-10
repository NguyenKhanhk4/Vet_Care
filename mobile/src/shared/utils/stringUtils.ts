/**
 * String utility functions for handling Vietnamese text
 */

/**
 * Removes accents/diacritics from a Vietnamese string
 * @param str 
 * @returns Unaccented string
 */
export const removeAccents = (str: string): string => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};
