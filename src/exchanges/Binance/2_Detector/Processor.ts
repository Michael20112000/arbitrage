export const Processor = new class {
  mainTarget = undefined
  mainTargetBalance = undefined

  getTargetBalance(balances, currency) {
    const balance = balances.find(item => item.asset === currency)
    return balance ? +balance.free : undefined
  }

  findMentions(symbols) {
    const currencies = this._getCurrencies(symbols)
    const result = {}

    currencies.forEach((currency: string) => {
      result[currency] = symbols.filter(item => item.baseAsset === currency || item.quoteAsset === currency)
    })

    return result
  }

  _getCurrencies(symbols) {
    const currencies = new Set()

    symbols.forEach(i => {
      currencies.add(i.baseAsset)
      currencies.add(i.quoteAsset)
    })

    return Array.from(currencies)
  }

  generateTree = (treeSources) => {
    const {currenciesTradesInfo, target, targetBalance, steps, prevSymbol = null} = treeSources

    if (this.mainTarget === undefined && this.mainTargetBalance === undefined) {
      this.mainTarget = target
      this.mainTargetBalance = targetBalance
    }

    if (steps !== 0) {
      return currenciesTradesInfo[target].reduce((acc, symbObj) => {
        if (symbObj.symbol === prevSymbol) {
          return acc
        }

        const isTargetBaseAsset = target === symbObj.baseAsset
        const nextTarget = isTargetBaseAsset ? symbObj.quoteAsset : symbObj.baseAsset

        const side = isTargetBaseAsset ? 'SELL' : 'BUY'

        let {dirtyQuantity, commission, cleanQuantity, spent, remainder} = Processor._makeCalculations({
          side,
          targetBalance,
          symbObj
        })

        let next = this.generateTree({
          currenciesTradesInfo,
          target: nextTarget,
          targetBalance: cleanQuantity,
          steps: steps - 1,
          prevSymbol: symbObj.symbol
        })

        if (steps === 2) {
          // тут next === масив символів на максимальній глибині рекурсії,
          // потрібно щоб він містив тільки ті символи що дозволять вийти на mainTarget
          next = next.filter(i => i.baseAsset === this.mainTarget || i.quoteAsset === this.mainTarget)
        }

        const result = {
          ...symbObj, side, dirtyQuantity, commission, cleanQuantity, spent, remainder, next
        }

        if (steps === 1) {
          result.targetEarnings = 42
          result.percentEarnings = 42
        }

        return [...acc, result]
      }, [])
    }
  }

  getBranches(node, path = []) {
    const newNode = Object.assign({}, node)
    delete newNode.next
    const newPath = path.concat(newNode)

    if (node.next && node.next.length > 0) {
      return node.next.flatMap((child) => this.getBranches(child, newPath))
    } else {
      return [newPath]
    }
  }

  _makeCalculations({side, targetBalance, symbObj}) {
    const {filters, price, takerCommission} = symbObj
    const {baseAssetPrecision, baseCommissionPrecision} = symbObj
    const {quoteAssetPrecision, quoteCommissionPrecision} = symbObj

    switch (side) {
      case 'BUY': {
        const dirtyQuantity = 42
        const commission = 42
        const cleanQuantity = 42
        const spent = 42
        const remainder = 42

        return {
          dirtyQuantity, commission, cleanQuantity,
          spent, remainder
        }
      }
      case 'SELL': {
        const dirtyQuantity = 42
        const commission = 42
        const cleanQuantity = 42
        const spent = 42
        const remainder = 42

        return {
          dirtyQuantity, commission, cleanQuantity,
          spent, remainder
        }
      }
    }
  }

  removeShortBranches(branches, steps) {
    return branches.filter(br => br.length === steps)
  }

  sortProfitFirst(branches) {
    return branches.sort((a, b) => {
      return b[b.length - 1].cleanQuantity - a[a.length - 1].cleanQuantity
    })
  }
}
