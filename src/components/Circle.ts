import type P5 from 'p5'
import { Complex } from '../utils/Complex.ts'

export class Circle {
  center: Complex
  private _radius?: number
  private readonly seed: number


  get radius (): number {
    if (this._radius === undefined) {
      this._radius = this._p5.abs(1 / this.bend)
    }
    return this._radius
  }

  constructor (public bend: number, public x: number, public y: number, private _p5: P5, private colors?: P5.Color[]) {
    this.center = new Complex(x, y, _p5)
    this._radius = this._p5.abs(1 / this.bend)
    this.seed = this._p5.int(this._p5.random(100000))
    this._p5.randomSeed(this.seed)
  }

  show () {
    if (!this.colors) {
      this._p5.stroke(0)
      this._p5.noFill()
    }
    if (this.colors) {
      const color = this._p5.lerpColor(
        this.colors[0],
        this.colors[1],
        this._p5.map(Math.log2(this.radius), 3.4, Math.log2(100), 1, 0)
      )
      this._p5.stroke(252, 238, 33)
      this._p5.strokeWeight(1)
      this._p5.fill(color)
    }

    this._p5.circle(this.center.a, this.center.b, this.radius * 2)
  }

  dist (other: Circle) {
    return this._p5.dist(this.center.a, this.center.b, other.center.a, other.center.b)
  }
}
