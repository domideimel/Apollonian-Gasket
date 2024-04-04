import type P5 from 'p5'

export class Complex {
  constructor (public a: number, public b: number, private _p5: P5) {}

  add (other: Complex) {
    return new Complex(this.a + other.a, this.b + other.b, this._p5)
  }

  sub (other: Complex) {
    return new Complex(this.a - other.a, this.b - other.b, this._p5)
  }

  scale (value: number) {
    return new Complex(this.a * value, this.b * value, this._p5)
  }

  mult (other: Complex) {
    const a = this.a * other.a - this.b * other.b
    const b = this.a * other.b + other.a * this.b
    return new Complex(a, b, this._p5)
  }

  sqrt () {
    const m = this._p5.sqrt(this._p5.sqrt(this.a * this.a + this.b * this.b))
    const angle = this._p5.atan2(this.b, this.a) / 2
    return new Complex(m * this._p5.cos(angle), m * this._p5.sin(angle), this._p5)
  }
}
