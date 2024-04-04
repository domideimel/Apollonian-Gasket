import type P5 from 'p5'
import { Vector } from 'p5'
import { Circle } from './Circle.ts'

export default class ApollonianGasket {
  private circles: Circle[] = []
  private queue: Circle[][] = []

  private readonly EPSILON = 0.1

  constructor (private _p5: P5) {
    this.start()
  }

  private start () {
    const c1 = new Circle(-1 / (this._p5.width / 2), this._p5.width / 2, this._p5.height / 2, this._p5)
    const r2 = this._p5.random(100, c1.radius / 2)
    const v = Vector.fromAngle(this._p5.random(this._p5.TWO_PI))
    v.setMag(c1.radius - r2)

    const c2 = new Circle(1 / r2, this._p5.width / 2 + v.x, this._p5.height / 2 + v.y, this._p5)
    const r3 = v.mag()
    v.rotate(this._p5.PI)
    v.setMag(c1.radius - r3)

    const c3 = new Circle(1 / r3, this._p5.width / 2 + v.x, this._p5.height / 2 + v.y, this._p5)
    this.circles = [c1, c2, c3]

    this.queue = [[c1, c2, c3]]
  }

  private nextGeneration () {
    this.queue = this.queue.flatMap((triplet) => {
      const [c1, c2, c3] = triplet
      const k4 = this.decartes({ c1, c2, c3 })
      const newCircles = this.complexDecartes({ c1, c2, c3, k4 })

      const validCircles = newCircles.filter(newCircle => this.validate({ c1, c2, c3, c4: newCircle }))
      this.circles.push(...validCircles)

      return validCircles.flatMap(newCircle => [
        [c1, c2, newCircle],
        [c1, c3, newCircle],
        [c2, c3, newCircle]
      ])
    })
  }

  private decartes ({ c1, c2, c3 }: { c1: Circle, c2: Circle, c3: Circle }): number[] {
    const k1 = c1.bend
    const k2 = c2.bend
    const k3 = c3.bend

    const sum = k1 + k2 + k3
    const product = this._p5.abs(k1 * k2 + k2 * k3 + k1 * k3)
    const root = 2 * this._p5.sqrt(product)
    return [sum + root, sum - root]
  }

  private complexDecartes ({ c1, c2, c3, k4 }: { c1: Circle, c2: Circle, c3: Circle, k4: number[] }): Circle[] {
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
      .mult(zk2)
      .add(zk2.mult(zk3))
      .add(zk1.mult(zk3))
      .sqrt()
      .scale(2)

    const center1 = sum.add(root).scale(1 / k4[0])
    const center2 = sum.sub(root).scale(1 / k4[0])
    const center3 = sum.add(root).scale(1 / k4[1])
    const center4 = sum.sub(root).scale(1 / k4[1])

    return [
      new Circle(k4[0], center1.a, center1.b, this._p5),
      new Circle(k4[0], center2.a, center2.b, this._p5),
      new Circle(k4[1], center3.a, center3.b, this._p5),
      new Circle(k4[1], center4.a, center4.b, this._p5),
    ]
  }

  private validate ({ c1, c2, c3, c4 }: { c1: Circle, c2: Circle, c3: Circle, c4: Circle }): boolean {
    if (c4.radius < 2) return false

    const isDistinct = this.circles.every(other => {
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
    this._p5.background(255)
    const len1 = this.queue.length
    this.nextGeneration()
    const len2 = this.queue.length

    if (len1 == len2) {
      this._p5.noLoop()
    }

    this.circles.forEach(circle => circle.show())
  }
}
