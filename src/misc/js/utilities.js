export function isObject( thing ) {
  if ( (typeof thing === "object" || typeof thing === 'function') && (thing !== null) ) {
    return true;
  } else {
    return false;
  }
}