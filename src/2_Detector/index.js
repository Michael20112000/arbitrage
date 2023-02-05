import fs from 'fs'

export const Detector = new class {
  detectArbitrage({symbolsData, currency, balances, steps}) {
    const currencyBalance = this._getBalance(balances, currency)

    let step1 = this._getTradedSymbols(symbolsData, currency).slice(0, 2)

    let step2 = []

    let step3 = []

    for (const symb of step1) {
      const nextCurrency = symb.baseAsset === currency ? symb.quoteAsset : symb.baseAsset
      step2.push(this._getTradedSymbols(symbolsData, nextCurrency))

      step2.forEach(symbArr => {
        return symbArr.forEach(symbol => {
          const nextCurr = symbol.baseAsset === nextCurrency ? symbol.quoteAsset : symbol.baseAsset

          step3.push(this._getTradedSymbols(symbolsData, nextCurr).filter(s => s.baseAsset === currency || s.quoteAsset === currency))
        })
      })
    }

    fs.writeFile('staticData/step1.json', JSON.stringify(step1), err => {
      if (err) throw err
      console.log('Data written to file')
    })

    fs.writeFile('staticData/step2.json', JSON.stringify(step2), err => {
      if (err) throw err
      console.log('Data written to file')
    })

    fs.writeFile('staticData/step3.json', JSON.stringify(step3), err => {
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

  _getTradedSymbols(symbolsData, currency) {
    return symbolsData.filter(symb => symb.baseAsset === currency || symb.quoteAsset === currency)
  }
}

// fs.writeFile('staticData/symbolsData.json', JSON.stringify(symbolsData), err => {
//   if (err) throw err
//   console.log('Data written to file')
// })
