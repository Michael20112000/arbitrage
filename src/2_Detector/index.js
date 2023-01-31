import fs from 'fs'

export const Detector = new class {
  detectArbitrage({symbolsData, currency, balances, steps}) {
    const result = {
      target: currency,
      balance: this._getBalance(balances, currency),
      steps
    }

    result.realizations = this._buildRealizations(symbolsData, currency, steps)

    fs.writeFile('staticData/result.json', JSON.stringify(result), err => {
      if (err) throw err
      console.log('Data written to file')
    })

    return result
  }

  _getBalance(balances, currency) {
    for (const item of balances) {
      if (item.asset === currency) return item.free
    }
  }

  _buildRealizations(symbolsData, currency, steps, depth = 0) {
    if (depth === steps) {
      return []
    }

    const realizations = this._findMentions({symbolsData, currency})
    realizations.forEach(symbObj => {
      const nextCurrency = symbObj.baseAsset === currency ? symbObj.quoteAsset : symbObj.baseAsset
      symbObj.realizations = this._buildRealizations(symbolsData, nextCurrency, steps, depth + 1)
    })

    return realizations
  }

  _findMentions({symbolsData, currency}) {
    const arr = []

    for (const item of symbolsData) {
      if (item.baseAsset === currency || item.quoteAsset === currency) {
        arr.push({
          ...item,
          type: currency === item.baseAsset ? 'sell' : 'buy'
        })
      }
    }

    return arr
  }
}

// fs.writeFile('staticData/symbolsData.json', JSON.stringify(symbolsData), err => {
//   if (err) throw err
//   console.log('Data written to file')
// })
