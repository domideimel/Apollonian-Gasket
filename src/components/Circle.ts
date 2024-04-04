import type P5 from 'p5'
import { Complex } from '../utils/Complex.ts'

export class Circle {
  center: Complex
  private _radius?: number

  get radius (): number {
    if (this._radius === undefined) {
      this._radius = this._p5.abs(1 / this.bend)
    }
    return this._radius
  }

  constructor (public bend: number, public x: number, public y: number, private _p5: P5) {
    this.center = new Complex(x, y, _p5)
    this._radius = this._p5.abs(1 / this.bend)
  }

  show () {
    this._p5.stroke(0)
    this._p5.noFill()
    this._p5.circle(this.center.a, this.center.b, this.radius * 2)
  }

  dist (other: Circle) {
    return this._p5.dist(this.center.a, this.center.b, other.center.a, other.center.b)
  }
}
