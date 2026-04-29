const toHijri = (gregorianDateStr) => {
  const date = new Date(gregorianDateStr);
  const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-uma-nu-latn', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  
  const parts = formatter.formatToParts(date);
  const day = parts.find(p => p.type === 'day')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const year = parts.find(p => p.type === 'year')?.value;

  // The requested format: DD/ Month Name/ YYYY
  return `${day}/ ${month}/ ${year}`;
};

const g = "2026-04-29T00:00:00";
console.log("hijri: ", toHijri(g));

const d = new Date(g);
console.log("gregorian: ", `${d.getDate()}/ ${d.getMonth() + 1}/ ${d.getFullYear()}`);
