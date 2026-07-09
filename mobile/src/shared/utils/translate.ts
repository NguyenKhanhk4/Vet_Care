/**
 * Utility functions to translate English enum values to Vietnamese
 */

export const translateSpecies = (species?: string): string => {
  if (!species) return 'Không rõ';
  const map: Record<string, string> = {
    dog: 'Chó',
    cat: 'Mèo',
    bird: 'Chim',
    rabbit: 'Thỏ',
    hamster: 'Hamster',
    fish: 'Cá',
    other: 'Khác',
  };
  return map[species.toLowerCase()] || species;
};

export const translateGender = (gender?: string): string => {
  if (!gender) return 'Không rõ';
  const map: Record<string, string> = {
    male: 'Đực',
    female: 'Cái',
    unknown: 'Không rõ',
  };
  return map[gender.toLowerCase()] || gender;
};

export const translateVaccineStatus = (status?: string): string => {
  if (!status) return 'Không rõ';
  const map: Record<string, string> = {
    'up-to-date': 'Đã tiêm đủ',
    overdue: 'Quá hạn tiêm',
    'not-vaccinated': 'Chưa tiêm',
    unknown: 'Không rõ',
  };
  return map[status.toLowerCase()] || status;
};
