/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const splitted = path.split('.');
  return (obj) => {
    let buffer = {...obj};
    for (const i in splitted) {
      if (!buffer[splitted[i]]) {
        return;
      }
      buffer = buffer[splitted[i]];
    }
    return buffer;
  };
}