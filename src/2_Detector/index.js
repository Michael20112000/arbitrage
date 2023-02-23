export const Detector = new class {
  detectArbitrage({symbolsData, target, balances, makerCommission, takerCommission, steps = 3}) {
    this.firstTarget = target
    const targetBalance = this._getBalance(balances, target)

    const currencies = this._getCurrencies(symbolsData)

    const currenciesTradesInfo = this._findMentions(currencies, symbolsData)

    const tree = this._generateTree({
      currenciesTradesInfo, target, targetBalance, makerCommission, takerCommission, steps
    })

    const branches = tree.flatMap((node) => this._getBranches(node))

    const fullBranches = this._removeShortBranches(branches, steps)

    const profitFirstSortedBranches = this._sortProfitFirst(fullBranches)

    return {
      target, targetBalance, steps, profitFirstSortedBranches
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

  _generateTree = ({currenciesTradesInfo, target, targetBalance, steps, prevSymbol = null}) => {
    if (steps !== 0) {
      return currenciesTradesInfo[target].map(variant => {
        if (variant.symbol === prevSymbol) {
          return null
        }

        const isTargetBaseAsset = variant.baseAsset === target
        const nextTarget = isTargetBaseAsset ? variant.quoteAsset : variant.baseAsset

        const type = isTargetBaseAsset ? 'sell' : 'buy'
        let theoreticalQuantity = type === 'buy' ? targetBalance / variant.price : targetBalance * variant.price
        const tradeCommissions = (theoreticalQuantity * 0.1) / 100
        // const takerCommissions = (theoreticalQuantity * 0.5) / 100
        theoreticalQuantity = theoreticalQuantity - tradeCommissions

        let next = this._generateTree({
          currenciesTradesInfo,
          target: nextTarget,
          targetBalance: theoreticalQuantity,
          steps: steps - 1,
          prevSymbol: variant.symbol
        })

        if (steps === 2) {
          next = next.filter(i => {
            if (i) {
              return i.baseAsset === this.firstTarget || i.quoteAsset === this.firstTarget
            }
          })
        }

        return {
          ...variant, type, theoreticalQuantity, next
        }
      }).filter(x => x)
    }
  }

  _getBranches(node, path = []) {
    const newPath = path.concat({...node, next: null})
    if (node.next && node.next.length > 0) {
      return node.next.flatMap((child) => this._getBranches(child, newPath))
    } else {
      return [newPath]
    }
  }

  _removeShortBranches(branches, steps) {
    return branches.filter(br => br.length === steps)
  }

  _sortProfitFirst(branches) {
    return branches.sort((a, b) => {
      return b[b.length - 1].theoreticalQuantity - a[a.length - 1].theoreticalQuantity
    })
  }
}
