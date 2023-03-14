export const Processor = new class {
  target = undefined
  targetBalance = undefined

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

    if (this.target === undefined && this.targetBalance === undefined) {
      this.target = target
      this.targetBalance = targetBalance
    }

    if (steps !== 0) {
      return currenciesTradesInfo[target].map(variant => {
        if (variant.symbol === prevSymbol) {
          return
        }

        const isTargetBaseAsset = variant.baseAsset === target
        const nextTarget = isTargetBaseAsset ? variant.quoteAsset : variant.baseAsset

        const side = isTargetBaseAsset ? 'SELL' : 'BUY'

        let {dirtyQuantity, commission, cleanQuantity, spent, remainder} = Processor._makeCalculations({
          side,
          balance: targetBalance,
          variant
        })

        let next = this.generateTree({
          currenciesTradesInfo,
          target: nextTarget,
          targetBalance: cleanQuantity,
          steps: steps - 1,
          prevSymbol: variant.symbol
        })

        if (steps === 2) {
          next = next.filter(i => {
            if (i) {
              return i.baseAsset === this.target || i.quoteAsset === this.target
            }
          })
        }

        const result = {
          ...variant, side, dirtyQuantity, commission, cleanQuantity, spent, remainder, next
        }

        if (steps === 1) {
          result.targetEarnings = +(cleanQuantity - this.targetBalance).toFixed(variant.baseAssetPrecision)
          result.percentEarnings = +(cleanQuantity * 100 / this.targetBalance - 100).toFixed(2)
        }

        return result
      }).filter(x => x) // фільтруємо кроки назад
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

  _makeCalculations({side, balance, variant}) {
    const {filters, price, takerCommission} = variant
    const {baseAssetPrecision, baseCommissionPrecision} = variant
    const {quoteAssetPrecision, quoteCommissionPrecision} = variant

    const stepSize = parseFloat(filters.find(filter => filter.filterType === 'LOT_SIZE').stepSize)

    switch (side) {
      case 'BUY': {
        const dirtyQuantity = +(Math.trunc((balance / price) / stepSize) * stepSize).toFixed(baseAssetPrecision)
        const commission = +(dirtyQuantity * takerCommission / 100).toFixed(baseCommissionPrecision)
        const spent = +(dirtyQuantity * price).toFixed(quoteAssetPrecision)

        return {
          dirtyQuantity,
          commission,
          cleanQuantity: +(dirtyQuantity - commission).toFixed(baseAssetPrecision),
          spent,
          remainder: +(balance - spent).toFixed(baseAssetPrecision)
        }
      }
      case 'SELL': {
        const dirtyQuantity = +(Math.trunc((balance * price) / stepSize) * stepSize).toFixed(quoteAssetPrecision)
        const commission = +(dirtyQuantity * takerCommission / 100).toFixed(quoteCommissionPrecision)
        const spent = +(dirtyQuantity / price).toFixed(baseAssetPrecision)

        return {
          dirtyQuantity,
          commission,
          cleanQuantity: +(dirtyQuantity - commission).toFixed(quoteAssetPrecision),
          spent,
          remainder: +(balance - spent).toFixed(quoteAssetPrecision)
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
