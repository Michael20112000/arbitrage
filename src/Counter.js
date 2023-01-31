export const Counter = new class {
  constructor() {
    this.requests = 0
    this.iterations = 0
  }

  request(amount) {
    amount ? this.requests += amount : this.requests += 1
  }

  iteration(amount) {
    amount ? this.iterations += amount : this.iterations += 1
  }

  getInfo() {
    return {
      requests: this.requests,
      iterations: this.iterations
    }
  }
}
