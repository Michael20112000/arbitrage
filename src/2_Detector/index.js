import fs from 'fs'

export const Detector = new class {
  detectArbitrage({symbolsData, currency, balances, steps}) {
    const currencyBalance = this._getBalance(balances, currency)

    const currencies = this._getCurrencies(symbolsData)

    const currenciesTradesInfo = this._findMentions(currencies, symbolsData)

    fs.writeFile('staticData/currenciesTradesInfo.json', JSON.stringify(currenciesTradesInfo), err => {
      if (err) throw err
      console.log('Data written to file')
    })

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
      result[currency] = symbolsData.filter(item => item.baseAsset === currency || item.quoteAsset === currency)
    })

    return result
  }
}

// fs.writeFile('staticData/symbolsData.json', JSON.stringify(symbolsData), err => {
//   if (err) throw err
//   console.log('Data written to file')
// })
