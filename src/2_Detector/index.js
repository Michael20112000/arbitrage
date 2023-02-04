// import fs from 'fs'

export const Detector = new class {
  detectArbitrage({symbolsData, currency, balances, steps}) {
    const currBalance = this._getBalance(balances, currency)

    const first = this._whatICanGetByCurrency(currency, symbolsData)

    first.forEach(symbol => {
      const currName = symbol.baseAsset === currency ? symbol.quoteAsset : symbol.baseAsset
      symbol.second = this._whatICanGetByCurrency(currName, symbolsData)

      symbol.second.forEach(symb => {
        const currName = symb.baseAsset === currency ? symb.quoteAsset : symb.baseAsset
        symb.third = this._whatICanGetByCurrency(currName, symbolsData)
      })
    })

    // fs.writeFile('staticData/first.json', JSON.stringify(first), err => {
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

  _whatICanGetByCurrency(currency, symbolsData) {
    return symbolsData.filter(item => item.baseAsset === currency || item.quoteAsset === currency)
  }
}

// fs.writeFile('staticData/symbolsData.json', JSON.stringify(symbolsData), err => {
//   if (err) throw err
//   console.log('Data written to file')
// })
