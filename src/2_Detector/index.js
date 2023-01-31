// import fs from 'fs'

export const Detector = new class {
  detectArbitrage({symbolsData, currency, balances, steps}) {
    const result = {
      target: currency,
      balance: this._getBalance(balances, currency),
      steps
    }

    result.miningMethods = this._findMentions({symbolsData, currency})

    result.miningMethods.forEach(symbObj => {
      const step2Currency = symbObj.baseAsset === currency ? symbObj.quoteAsset : symbObj.baseAsset
      symbObj.miningMethods = this._findMentions({symbolsData, currency: step2Currency})

      symbObj.miningMethods.forEach(s => {
        const step3Currency = s.baseAsset === step2Currency ? s.quoteAsset : s.baseAsset
        s.miningMethods = this._findMentions({symbolsData, currency: step3Currency})
      })
    })

    return result
  }

  _getBalance(balances, currency) {
    for (const item of balances) {
      if (item.asset === currency) return item.free
    }
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
