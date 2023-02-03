// import fs from 'fs'

export const Detector = new class {
  detectArbitrage({symbolsData, currency, balances, steps}) {
    const currBalance = this._getBalance(balances, currency)

    const whatICanGetByCurrency = this._whatICanGetByCurrency(currency, symbolsData)

    whatICanGetByCurrency.forEach(symbol => {
      const currName = symbol.baseAsset === currency ? symbol.quoteAsset : symbol.baseAsset
      symbol.whatICanGetByCurrency = this._whatICanGetByCurrency(currName, symbolsData)

      symbol.whatICanGetByCurrency.forEach(symb => {
        const currName = symb.baseAsset === currency ? symb.quoteAsset : symb.baseAsset
        symb.whatICanGetByCurrency = this._whatICanGetByCurrency(currName, symbolsData)
      })
    })

    return symbolsData
  }

  _getBalance(balances, currency) {
    for (const item of balances) {
      if (item.asset === currency) return item.free
    }
  }

  _whatICanGetByCurrency() {

  }
}

// fs.writeFile('staticData/symbolsData.json', JSON.stringify(symbolsData), err => {
//   if (err) throw err
//   console.log('Data written to file')
// })
