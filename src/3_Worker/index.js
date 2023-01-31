export const Worker = new class {
  makeMoney() {

  }

  _getBalance(balances, currency) {
    for (const balance of balances) {
      if (balance.asset === currency) {
        return balance.free
      }
    }
  }
}
