/* eslint-disable @typescript-eslint/no-use-before-define */
export const isUndefined = (obj: unknown): obj is undefined =>
  typeof obj === 'undefined';

export const isObject = (fn: unknown): fn is object =>
  !isNil(fn) && typeof fn === 'object';

export const isPlainObject = (fn: unknown): fn is object => {
  if (!isObject(fn)) {
    return false;
  }
  const proto = Object.getPrototypeOf(fn);
  if (proto === null) {
    return true;
  }
  const ctor =
    Object.prototype.hasOwnProperty.call(proto, 'constructor') &&
    proto.constructor;
  return (
    typeof ctor === 'function' &&
    ctor instanceof ctor &&
    Function.prototype.toString.call(ctor) ===
      Function.prototype.toString.call(Object)
  );
};

// eslint-disable-next-line @typescript-eslint/ban-types
export const isFunction = (val: unknown): val is Function =>
  typeof val === 'function';
export const isString = (val: unknown): val is string =>
  typeof val === 'string';
export const isNil = (val: unknown): val is null | undefined =>
  isUndefined(val) || val === null;
