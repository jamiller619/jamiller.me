function Easing(...values) {
  this.value = values
}

Easing.prototype.toString = function(wrapper) {
  return wrapper.replace('$0', this.value.toString())
}

export const easyEase = new Easing(1, 0, 0, 1)
export const easyEaseIn = new Easing(1, 0, 1, 1)
export const easyEaseOut = new Easing(0, 1, 1, 1)

export const toAnime = ease => {
  return ease.toString('cubicBezier($0)')
}

export const spring = ({
  mass = 1,
  damping = 0.5,
  stiffness = 1,
  initialVelocity = 5
}) => {
  return `spring(${mass}, ${damping}, ${stiffness}, ${initialVelocity})`
}

export default {
  easyEase,
  easyEaseIn,
  easyEaseOut
}
