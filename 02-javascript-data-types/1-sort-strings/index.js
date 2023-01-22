/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const sortedArr = [...arr];
  const collator = new Intl.Collator(['ru-en', 'ru', 'en'], { caseFirst: 'upper' });
  return sortedArr.sort((a, b) => {
    const sortAnswer = collator.compare(a, b);
    if (sortAnswer > 0) {
      if (param === 'asc') {
        return 1;
      }
      if (param === 'desc') {
        return -1;
      }
    }
    if (sortAnswer < 0) {
      if (param === 'asc') {
        return -1;
      }
      if (param === 'desc') {
        return 1;
      }
    }
    return 0;
  });
}

