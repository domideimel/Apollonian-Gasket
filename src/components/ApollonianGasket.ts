import type P5 from 'p5'
import { Vector } from 'p5'
import { Circle } from './Circle.ts'

export default class ApollonianGasket {
  private _circles: Circle[] = []
  private _queue: Circle[][] = []
  private readonly _colors: P5.Color[] = []

  private readonly EPSILON = 0.1

  constructor (private _p5: P5) {
    this._colors = [
      this._p5.color(112, 50, 126),
      this._p5.color(45, 197, 244),
    ]
    this.start()
  }

  private start () {
    const c1 = new Circle(-1 / (this._p5.width / 2), this._p5.width / 2, this._p5.height / 2, this._p5, this._colors)
    const r2 = this._p5.random(100, c1.radius / 2)
    const v = Vector.fromAngle(this._p5.random(this._p5.TWO_PI))
    v.setMag(c1.radius - r2)

    const c2 = new Circle(1 / r2, this._p5.width / 2 + v.x, this._p5.height / 2 + v.y, this._p5, this._colors)
    const r3 = v.mag()
    v.rotate(this._p5.PI)
    v.setMag(c1.radius - r3)

    const c3 = new Circle(1 / r3, this._p5.width / 2 + v.x, this._p5.height / 2 + v.y, this._p5, this._colors)
    this._circles = [c1, c2, c3]

    this._queue = [[c1, c2, c3]]
  }

  private nextGeneration () {
    this._queue = this._queue.flatMap(([c1, c2, c3]) => {
      const k4 = this.descartes({ c1, c2, c3 })
      const newCircles = this.complexDescartes({ c1, c2, c3, k4 })

      const validCircles = newCircles.filter(newCircle => this.validate({ c1, c2, c3, c4: newCircle }))
      this._circles.push(...validCircles)

      return validCircles.flatMap(newCircle => [
        [c1, c2, newCircle],
        [c1, c3, newCircle],
        [c2, c3, newCircle]
      ])
    })
  }

  private descartes ({ c1, c2, c3 }: { c1: Circle, c2: Circle, c3: Circle }): number[] {
    const k1 = c1.bend
    const k2 = c2.bend
    const k3 = c3.bend

    const sum = k1 + k2 + k3
    const product = this._p5.abs(k1 * k2 + k2 * k3 + k1 * k3)
    const root = 2 * this._p5.sqrt(product)
    return [sum + root, sum - root]
  }

  private complexDescartes ({ c1, c2, c3, k4 }: { c1: Circle, c2: Circle, c3: Circle, k4: number[] }): Circle[] {
    const k1 = c1.bend
    const k2 = c2.bend
    const k3 = c3.bend

    const z1 = c1.center
    const z2 = c2.center
    const z3 = c3.center

    const zk1 = z1.scale(k1)
    const zk2 = z2.scale(k2)
    const zk3 = z3.scale(k3)

    const sum = zk1.add(zk2).add(zk3)

    const root = zk1
      .multiply(zk2)
      .add(zk2.multiply(zk3))
      .add(zk1.multiply(zk3))
      .sqrt()
      .scale(2)

    return k4.flatMap(k => {
      const centerAdd = sum.add(root).scale(1 / k)
      const centerSub = sum.sub(root).scale(1 / k)

      return [
        new Circle(k, centerAdd.a, centerAdd.b, this._p5, this._colors),
        new Circle(k, centerSub.a, centerSub.b, this._p5, this._colors)
      ]
    })
  }

  private validate ({ c1, c2, c3, c4 }: { c1: Circle, c2: Circle, c3: Circle, c4: Circle }): boolean {
    if (c4.radius < 2) return false

    const isDistinct = this._circles.every(other => {
      const d = c4.dist(other)
      const radiusDiff = this._p5.abs(c4.radius - other.radius)
      return !(d < this.EPSILON && radiusDiff < this.EPSILON)
    })

    if (!isDistinct) return false

    return [c1, c2, c3].every(c => this.isTangent(c4, c))
  }

  private isTangent (c1: Circle, c2: Circle): boolean {
    const d = c1.dist(c2)
    const r1 = c1.radius
    const r2 = c2.radius

    const a = this._p5.abs(d - (r1 + r2)) < this.EPSILON
    const b = this._p5.abs(d - this._p5.abs(r2 - r1)) < this.EPSILON
    return a || b
  }

  draw () {
    this._p5.background(this._p5.lerpColor(this._colors[0], this._p5.color('black'), 0.5))
    const len1 = this._queue.length
    this.nextGeneration()
    const len2 = this._queue.length

    if (len1 == len2) {
      this._p5.noLoop()
    }

    this._circles.forEach(circle => circle.show())
  }
}
