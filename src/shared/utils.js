/**
 * Helper to render the className prop on a Component.
 * @example <div {...classNames('classNameOne', 'classNameTwo')} />
 * @param  {...String} classNames Classnames, separated by commas
 */
export const classNames = (...classNames) => {
  if (Array.isArray(classNames)) {
    return {
      className: classNames.filter(className => className).join(' ')
    }
  }
}

export const noop = function() {}
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value))
