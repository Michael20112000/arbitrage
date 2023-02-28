export const Processor = new class {
  getTargetBalance(balances, currency) {
    const balance = balances.find(item => item.asset === currency)
    return balance ? balance.free : undefined
  }

  findMentions(symbols) {
    const currencies = this._getCurrencies(symbols)
    const result = {}

    currencies.forEach(currency => {
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

  generateTree = ({
                    currenciesTradesInfo,
                    firstTarget,
                    target,
                    targetBalance,
                    steps,
                    prevSymbol = null
                  }) => {
    if (steps !== 0) {
      return currenciesTradesInfo[target].map(variant => {
        if (variant.symbol === prevSymbol) {
          return null
        }

        const isTargetBaseAsset = variant.baseAsset === target
        const nextTarget = isTargetBaseAsset ? variant.quoteAsset : variant.baseAsset

        const side = isTargetBaseAsset ? 'SELL' : 'BUY'

        let {dirtyQuantity, commission, cleanQuantity} = Processor.calculateTheoreticalQuantity({
          side,
          balance: targetBalance,
          price: variant.price,
          takerCommission: variant.takerCommission
        })

        let next = this.generateTree({
          currenciesTradesInfo,
          firstTarget,
          target: nextTarget,
          targetBalance: cleanQuantity,
          steps: steps - 1,
          prevSymbol: variant.symbol
        })

        if (steps === 2) {
          next = next.filter(i => {
            if (i) {
              return i.baseAsset === firstTarget || i.quoteAsset === firstTarget
            }
          })
        }

        return {
          ...variant, side, dirtyQuantity, commission, cleanQuantity, next
        }
      }).filter(x => x)
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

  calculateTheoreticalQuantity({side, balance, price, takerCommission}) {
    switch (side) {
      case 'BUY': {
        const dirtyQuantity = balance / price
        const commission = dirtyQuantity * takerCommission / 100
        return {
          dirtyQuantity,
          commission,
          cleanQuantity: dirtyQuantity - commission
        }
      }
      case 'SELL': {
        const dirtyQuantity = balance * price
        const commission = dirtyQuantity * takerCommission / 100
        return {
          dirtyQuantity,
          commission,
          cleanQuantity: dirtyQuantity - commission
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
