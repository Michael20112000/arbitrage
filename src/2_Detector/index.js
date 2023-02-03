// import fs from 'fs'

export const Detector = new class {
  detectArbitrage({symbolsData, currency, balances, steps}) {
    const currBalance = this._getBalance(balances, currency)

    const currencies = this._getCurrencies(symbolsData)

    const currenciesTradesInfo = this._findMentions(currencies, symbolsData)

    const arbitrage = this._generateChain(currenciesTradesInfo, steps)

    // fs.writeFile('staticData/arbitrage.json', JSON.stringify(arbitrage), err => {
    //   if (err) throw err
    //   console.log('Data written to file')
    // })

    return symbolsData
  }

  _getBalance(balances, currency) {
    for (const item of balances) {
      if (item.asset === currency) return item.free
    }
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
      const items = symbolsData.filter(item => item.baseAsset === currency || item.quoteAsset === currency)

      result[currency] = items.map(item => ({
          ...item,
          type: item.baseAsset === currency ? 'buy' : 'sell'
        })
      )
    })

    return result
  }

  _generateChain(currenciesTradesInfo, steps) {
    for (const curr in currenciesTradesInfo) {
      const tradedSymbols = currenciesTradesInfo[curr]

      tradedSymbols.forEach(s => {
        s.next = s.type === 'buy'
          ? s.next = currenciesTradesInfo[s.quoteAsset]
          : s.next = currenciesTradesInfo[s.baseAsset]
      })
    }
    return currenciesTradesInfo
  }
}

// fs.writeFile('staticData/symbolsData.json', JSON.stringify(symbolsData), err => {
//   if (err) throw err
//   console.log('Data written to file')
// })
