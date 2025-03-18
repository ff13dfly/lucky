const self = {
  stamp: () => {
    return new Date().getTime();
  },
  day:()=>{
    const dt = new Date();
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  },
  rand: (m, n) => {
    return Math.round(Math.random() * (m - n) + n);
  },
  char: (n, pre) => {
    n = n || 7;
    pre = pre || "";
    for (let i = 0; i < n; i++)
      pre +=
        i % 2
          ? String.fromCharCode(self.rand(65, 90))
          : String.fromCharCode(self.rand(97, 122));
    return pre;
  },
  shorten: (addr, n) => {
    if (n === undefined) n = 10;
    return addr.substr(0, n) + "..." + addr.substr(addr.length - n, n);
  },
  copy:(arr_obj)=>{
    return JSON.parse(JSON.stringify(arr_obj));
  },
  clean:(arr)=>{
    return Array.from(new Set(arr));
  },
  tail:(str,n)=>{
    return str.substr(0, n) + "...";
  },
  empty: (obj) => {
    if (JSON.stringify(obj) === "{}") return true;
    return false;
  },
  toDate: (stamp) => {
    return new Date(stamp).toLocaleString();
  },
  toF: (a,fix)=>{
    fix=fix||3;return parseFloat(a.toFixed(fix))
  },
  u8ToHex: (u8array) => {
    return Array.prototype.map.call(u8array, function (byte) {
      return ("0" + (byte & 0xFF).toString(16)).slice(-2);
    }).join("");
  },
  hexToU8: (hexString) => {
    if (hexString.length % 2 !== 0) {
      throw new Error("Hex string must have an even number of characters");
    }
    const u8array = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2) {
      u8array[i / 2] = parseInt(hexString.substr(i, 2), 16);
    }
    return u8array;
  },
};

module.exports = self;