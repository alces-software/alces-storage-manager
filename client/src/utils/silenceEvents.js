
//
// Return a function which runs the wrapped function `fn` without propagating
// any events.
//
export default function(fn) {
  return (event, ...args) => {
    if (event && event.preventDefault) {
      event.preventDefault()
      event.stopPropagation()
      return fn(...args);
    }
    return fn(...[event].concat(args));
  }
}
