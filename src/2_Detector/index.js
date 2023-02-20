export const Detector = new class {
  detectArbitrage({symbolsData, target, balances, steps = 3}) {
    this.firstTarget = target
    // const targetBalance = this._getBalance(balances, target)
    const targetBalance = 500

    const currencies = this._getCurrencies(symbolsData)

    const currenciesTradesInfo = this._findMentions(currencies, symbolsData)

    const chains = this._generateChains({
      currenciesTradesInfo,
      target,
      targetBalance,
      steps
    })

    const queue = this._generateQueue(chains)

    return {
      target,
      targetBalance,
      steps,
      queue
    }
  }

  _getBalance(balances, currency) {
    const balance = balances.find(item => item.asset === currency)
    return balance ? balance.free : undefined
  }

  _getCurrencies(symbolsData) {
    const currencies = new Set()

    symbolsData.forEach(i => {
      currencies.add(i.baseAsset)
      currencies.add(i.quoteAsset)
    })

    return Array.from(currencies)
  }

  _findMentions(currencies, symbolsData) {
    const result = {}

    currencies.forEach(currency => {
      result[currency] = symbolsData.filter(item => item.baseAsset === currency || item.quoteAsset === currency)
    })

    return result
  }

  _generateChains = ({currenciesTradesInfo, target, targetBalance, steps}) => {
    if (steps !== 0) {
      return currenciesTradesInfo[target].map(variant => {
        const isTargetBaseAsset = variant.baseAsset === target
        const nextTarget = isTargetBaseAsset ? variant.quoteAsset : variant.baseAsset

        const type = isTargetBaseAsset ? 'sell' : 'buy'
        const theoreticalQuantity = type === 'buy' ? targetBalance / variant.price : targetBalance * variant.price

        let next = this._generateChains({
          currenciesTradesInfo,
          target: nextTarget,
          targetBalance: theoreticalQuantity,
          steps: steps - 1
        })

        if (steps === 2) {
          next = next.filter(i => i.baseAsset === this.firstTarget || i.quoteAsset === this.firstTarget)
        }

        return {
          ...variant,
          type,
          theoreticalQuantity,
          next
        }
      })
    }
  }

  _generateQueue(chains) {
    return 42
  }
}
