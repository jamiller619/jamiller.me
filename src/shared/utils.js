/**
 * Helper to render the className prop on a Component.
 *
 * @example <div {...classNames('classNameOne', 'classNameTwo')} />
 * @param  {...String} classNames Classnames, separated by commas
 * @return {Object} object that should be used as a rest property
 */
export const classNames = (...classListProp) => {
  let classList = [...classListProp]

  if (Array.isArray(classListProp[0])) {
    classList = [...classListProp[0]]
  }

  return {
    className: classList.filter(className => className).join(' ')
  }
}

// eslint-disable-next-line no-empty-function
export const noop = function noop() {}
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value))
