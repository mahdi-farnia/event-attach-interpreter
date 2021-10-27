function isObjObj(o) {
  return (
    o != null &&
    typeof o === 'object' &&
    !Array.isArray(o) &&
    Object.prototype.toString.call(o) === '[object Object]'
  );
}

module.exports = function isPlainObject(arg) {
  if (!isObjObj(arg)) return !1;

  let ctor = arg.constructor,
    prot;
  if (typeof ctor !== 'function') return !1;

  prot = ctor.prototype;
  if (!isObjObj(prot)) return !1;

  if (!prot.hasOwnProperty('isPrototypeOf')) return !1;

  return !0;
};
