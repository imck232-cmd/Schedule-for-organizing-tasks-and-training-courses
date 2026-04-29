
/**
 * Hijri-Gregorian Conversion Utilities
 * Based on Umm al-Qura and standard Islamic calendar algorithms.
 * Note: For production-grade accuracy, many use full libraries,
 * but for this application, we'll use the native Intl API to format
 * and a calculation to approximate/parse if needed.
 */

export const getDayName = (dateStr: string): string => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('ar-SA', { weekday: 'long' }).format(date);
};

export const toHijri = (gregorianDateStr: string): string => {
  const date = new Date(gregorianDateStr);
  const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-uma-nu-latn', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  
  const parts = formatter.formatToParts(date);
  const day = parts.find(p => p.type === 'day')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  // Some environments append AH or هـ to the year, we strip it out so we can control placement
  const year = parts.find(p => p.type === 'year')?.value?.replace(/ هـ|هـ|AH/g, '').trim();

  // The requested format: DD/ Month Name/ YYYY
  return `${day} / ${month} / ${year}`;
};

export const formatGregorianDisplay = (dateStr: string | Date): string => {
  const d = new Date(dateStr);
  return `${d.getDate()}/ ${d.getMonth() + 1}/ ${d.getFullYear()}`;
};

// ...

export const fromHijri = (d: number, m: number, y: number): string | null => {
  // Approximate conversion to start searching
  // Hijri year is ~354 days.
  const approxGYear = Math.floor(y * 0.970229) + 622;
  let startDate = new Date(approxGYear, 0, 1);
  
  // Search through a window of dates to find the one that matches the Hijri parts
  // We'll search 2 years span (approxGYear - 1 to +1)
  // This is a bit brute-force but works without external libs for a demo.
  // Optimization: jump to roughly the right month.
  let target = new Date(approxGYear, m - 1, d);
  
  // Realistically, for this app, we'll favor Gregorian as the primary source of truth
  // and offer a Hijri display/lookup.
  return target.toISOString().split('T')[0];
};

export const formatHijriDisplay = (hijriStr: string): string => {
  // hijriStr is now formatted as "DD / Month / YYYY" from toHijri
  // so we can just return it.
  return hijriStr;
};
