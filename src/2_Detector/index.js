import fs from 'fs'

export const Detector = new class {
  detectArbitrage({symbolsData, target, balances, steps = 3}) {
    // const targetBalance = this._getBalance(balances, target)
    const targetBalance = 500

    const currencies = this._getCurrencies(symbolsData)

    const currenciesTradesInfo = this._findMentions(currencies, symbolsData)

    const chain = this._generateChain({currenciesTradesInfo, target, targetBalance, steps})

    fs.writeFile('staticData/chain.json', JSON.stringify(chain), err => {
      if (err) throw err
      console.log('Data written to file')
    })

    return {
      target, targetBalance, steps,
      chain
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

  _generateChain({currenciesTradesInfo, target, targetBalance, steps}) {
    if (steps !== 0) {
      return currenciesTradesInfo[target].map(variant => {
        const isTargetBaseAsset = variant.baseAsset === target
        const nextTarget = isTargetBaseAsset ? variant.quoteAsset : variant.baseAsset

        const type = isTargetBaseAsset ? 'sell' : 'buy'
        const theoreticalQuantity = type === 'buy' ? targetBalance / variant.price : targetBalance * variant.price

        const next = this._generateChain({
          currenciesTradesInfo,
          target: nextTarget,
          targetBalance: theoreticalQuantity,
          steps: steps - 1
        })

        if (next) {
          next.filter(i => i)
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

  _calculateQuantity({type, price}) {
    return price
  }
}

// fs.writeFile('staticData/symbolsData.json', JSON.stringify(symbolsData), err => {
//   if (err) throw err
//   console.log('Data written to file')
// })

/*
[
  {
    "symbol": "BTCUSDT",
    "price": "24992.74000000",
    "theoreticalQuantity": 0.02000580968713314
  },
  {
    "symbol": "ETHUSDT",
    "price": "1701.74000000",
    "theoreticalQuantity": 0.29000580968713314
  },
  ...
]
*/
