export const Processor = new class {
  target = undefined

  getTargetBalance(balances, currency) {
    const balance = balances.find(item => item.asset === currency)
    return balance ? balance.free : undefined
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

  generateTree = (treeSources, isFirstCall = true) => {
    const {currenciesTradesInfo, target, targetBalance, steps, prevSymbol = null} = treeSources

    if (isFirstCall && this.target === undefined) {
      this.target = target
    }

    if (steps !== 0) {
      return currenciesTradesInfo[target].map(variant => {
        if (variant.symbol === prevSymbol) {
          return
        }

        const isTargetBaseAsset = variant.baseAsset === target
        const nextTarget = isTargetBaseAsset ? variant.quoteAsset : variant.baseAsset

        const side = isTargetBaseAsset ? 'SELL' : 'BUY'

        let {spent, dirtyQuantity, commission, cleanQuantity, remainder} = Processor._calculateTheoreticalQuantity({
          side,
          balance: +targetBalance,
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

        return {
          ...variant, spent, side, dirtyQuantity, commission, cleanQuantity, remainder, next
        }
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

  _calculateTheoreticalQuantity({side, balance, variant}) {
    const {filters, price, takerCommission} = variant
    const {baseAssetPrecision, baseCommissionPrecision} = variant
    const {quoteAssetPrecision, quoteCommissionPrecision} = variant

    const stepSize = parseFloat(filters.find(filter => filter.filterType === 'LOT_SIZE').stepSize)
    variant.price = +variant.price

    switch (side) {
      case 'BUY': {
        const dirtyQuantity = +(Math.floor((balance / price) / stepSize) * stepSize).toFixed(baseAssetPrecision)
        const commission = +(dirtyQuantity * takerCommission / 100).toFixed(baseCommissionPrecision)
        const spent = +(dirtyQuantity * price).toFixed(baseCommissionPrecision)

        return {
          spent,
          dirtyQuantity,
          commission,
          cleanQuantity: +(dirtyQuantity - commission).toFixed(baseAssetPrecision),
          remainder: +(balance - spent).toFixed(baseAssetPrecision)
        }
      }
      case 'SELL': {
        const dirtyQuantity = +(Math.floor((balance * price) / stepSize) * stepSize).toFixed(quoteAssetPrecision)
        const commission = +(dirtyQuantity * takerCommission / 100).toFixed(quoteCommissionPrecision)
        const spent = +(dirtyQuantity / price).toFixed(baseCommissionPrecision)

        return {
          spent,
          dirtyQuantity,
          commission,
          cleanQuantity: +(dirtyQuantity - commission).toFixed(quoteAssetPrecision),
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

/* SCRIPT
  price: 10.1309 USDT
  spent: 27.35343 USDT
  dirtyQuantity: 2.7 AMP
  commission: 0.0027 AMP
  cleanQuantity: 2.6973 AMP
*/

/* REAL
  price: 10.1345 USDT
  spent: 27.36315 USDT
  dirtyQuantity: 2.70540440 AMP
  commission: 0.00270540 AMP
  cleanQuantity: 2.702699 AMP
*/
