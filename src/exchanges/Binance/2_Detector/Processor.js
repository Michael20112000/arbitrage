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
          return
        }

        const isTargetBaseAsset = variant.baseAsset === target
        const nextTarget = isTargetBaseAsset ? variant.quoteAsset : variant.baseAsset

        const side = isTargetBaseAsset ? 'SELL' : 'BUY'

        let {qty, dirtyQuantity, commission, cleanQuantity, remainder} = Processor.calculateTheoreticalQuantity({
          side,
          filters: variant.filters,
          balance: targetBalance,
          price: variant.price,
          takerCommission: variant.takerCommission,

          baseAssetPrecision: variant.baseAssetPrecision,
          quoteAssetPrecision: variant.quoteAssetPrecision,

          baseCommissionPrecision: variant.baseCommissionPrecision,
          quoteCommissionPrecision: variant.quoteCommissionPrecision,

          quotePrecision: variant.quotePrecision
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
          ...variant, qty, side, dirtyQuantity, commission, cleanQuantity, remainder, next
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

  calculateTheoreticalQuantity({
                                 side,
                                 filters,
                                 balance,
                                 price,
                                 takerCommission,
                                 baseAssetPrecision,
                                 quoteAssetPrecision,
                                 baseCommissionPrecision,
                                 quoteCommissionPrecision,
                                 quotePrecision
                               }) {
    switch (side) {
      case 'BUY': {
        const lotSizeFilter = filters.find(filter => filter.filterType === 'LOT_SIZE')
        const stepSize = parseFloat(lotSizeFilter.stepSize)
        const dirtyQuantity = (Math.floor((balance / price) / stepSize) * stepSize).toFixed(baseAssetPrecision)
        const commission = (dirtyQuantity * takerCommission / 100).toFixed(baseCommissionPrecision)

        return {
          qty: (dirtyQuantity * price).toFixed(baseCommissionPrecision),
          dirtyQuantity,
          commission,
          cleanQuantity: dirtyQuantity - commission,
        }
      }
      case 'SELL': {
        const lotSizeFilter = filters.find(filter => filter.filterType === 'LOT_SIZE')
        const stepSize = parseFloat(lotSizeFilter.stepSize)
        const dirtyQuantity = (Math.floor((balance * price) / stepSize) * stepSize).toFixed(quoteAssetPrecision)
        const commission = (dirtyQuantity * takerCommission / 100).toFixed(quoteCommissionPrecision)

        return {
          qty: (dirtyQuantity / price).toFixed(quoteCommissionPrecision),
          dirtyQuantity,
          commission,
          cleanQuantity: dirtyQuantity - commission,
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

/*
Target balance (USDT) = 30.80449822

Step 1. AMP/USDT  ->  BUY  AMP, price 0.00516      => get 5963 AMP
Step 2. AMP/BTC   ->  SELL AMP, price 0.00000024   => get 0.00142969 BTC
Step 3. BTC/USDT  ->  SELL BTC, price 22351.98     => get 31.92444588 USDT

Вийде 30.65551705 USDT якщо продати AMP за BTC по 0.00000023, а це менше ніж початкова сума target.
Основна проблема: на момент коли скрипт дізнавався ціни AMP коштувала 0.00000024 BTC.
Утворився спред, тобто можливість заробітку. Конкуренти роз'їли цей спред за долю секунди.

Погрішність того про що ми говорили становить 0.1% (береться не повна сума, не 100%, а дуже наближене значення).
Це невелика погрішність і вона погоди не робить, на даному етапі її можна ігнорувати.
*/
