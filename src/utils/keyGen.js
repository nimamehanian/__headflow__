const seenKeys = {};
const MULTIPLIER = 2 ** 24;
const keyGen = () => {
  let key;
  while (key === undefined || Object.prototype.hasOwnProperty.call(seenKeys, key) || !isNaN(+key)) {
    key = Math.floor(Math.random() * MULTIPLIER).toString(32);
  }
  seenKeys[key] = true;
  return key;
};

export default keyGen;
