export const buildJsonByPairs = (pairs) => {
  let ans = {};
  for (let pair of pairs) {
    const path = pair[0];
    const keys = path.split("!!");
    let kIndex = 0;
    let node = ans;
    while (kIndex < keys.length - 1) {
      if (typeof node[keys[kIndex]] === "undefined") {
        node[keys[kIndex]] = {};
      }
      node = node[keys[kIndex]];
      kIndex++;
    }
    node[keys[kIndex]] = pair[1];
  }
  return ans;
};
