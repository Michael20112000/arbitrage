export const Detector = new class {
  detectArbitrage({symbolsData, target, balances, steps = 3}) {
    this.firstTarget = target
    // const targetBalance = this._getBalance(balances, target)
    const targetBalance = 500

    const currencies = this._getCurrencies(symbolsData)

    const currenciesTradesInfo = this._findMentions(currencies, symbolsData)

    const tree = this._generateTree({
      currenciesTradesInfo, target, targetBalance, steps
    })

    const queue = this._getAllBranches(tree)

    return {
      target, targetBalance, steps, queue
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

  _generateTree = ({currenciesTradesInfo, target, targetBalance, steps}) => {
    if (steps !== 0) {
      return currenciesTradesInfo[target].map(variant => {
        const isTargetBaseAsset = variant.baseAsset === target
        const nextTarget = isTargetBaseAsset ? variant.quoteAsset : variant.baseAsset

        const type = isTargetBaseAsset ? 'sell' : 'buy'
        const theoreticalQuantity = type === 'buy' ? targetBalance / variant.price : targetBalance * variant.price

        let next = this._generateTree({
          currenciesTradesInfo, target: nextTarget, targetBalance: theoreticalQuantity, steps: steps - 1
        })

        if (steps === 2) {
          next = next.filter(i => i.baseAsset === this.firstTarget || i.quoteAsset === this.firstTarget)
        }

        return {
          ...variant, type, theoreticalQuantity, next
        }
      })
    }
  }

  _getAllBranches(tree) {
    const result = []

    tree.forEach(node => {
      if (node.hasOwnProperty('next')) {
        result.push([node.symbol, this._getAllBranches(node.next)])
      } else {
        result.push([node.symbol])
      }
    })

    return result
  }
}

let first = [
  {
    'symbol': 'a',
    'next': [
      {
        'symbol': 'a1',
        'next': [
          {
            'symbol': 'a1.1',
          },
          {
            'symbol': 'a1.2',
          },
          {
            'symbol': 'a1.3',
          }
        ]
      },
      {
        'symbol': 'a2',
        'next': [
          {
            'symbol': 'a2.1',
          },
          {
            'symbol': 'a2.2',
          },
          {
            'symbol': 'a2.3',
          }
        ]
      },
    ]
  },
  {
    'symbol': 'b',
    'next': [
      {
        'symbol': 'b1',
        'next': [
          {
            'symbol': 'b1.1',
          },
          {
            'symbol': 'b1.2',
          },
          {
            'symbol': 'b1.3',
          }
        ]
      },
      {
        'symbol': 'b2',
        'next': [
          {
            'symbol': 'b2.1',
          },
          {
            'symbol': 'b2.2',
          },
          {
            'symbol': 'b2.3',
          }
        ]
      },
    ]
  },
]

let second = [
  [{'symbol': 'a'}, {'symbol': 'a1'}, {'symbol': 'a1.1'}],
  [{'symbol': 'a'}, {'symbol': 'a1'}, {'symbol': 'a1.2'}],
  [{'symbol': 'a'}, {'symbol': 'a1'}, {'symbol': 'a1.3'}],
  [{'symbol': 'a'}, {'symbol': 'a2'}, {'symbol': 'a2.1'}],
  [{'symbol': 'a'}, {'symbol': 'a2'}, {'symbol': 'a2.2'}],
  [{'symbol': 'a'}, {'symbol': 'a2'}, {'symbol': 'a2.3'}],
  [{'symbol': 'b'}, {'symbol': 'b1'}, {'symbol': 'b1.1'}],
  [{'symbol': 'b'}, {'symbol': 'b1'}, {'symbol': 'b1.2'}],
  [{'symbol': 'b'}, {'symbol': 'b1'}, {'symbol': 'b1.3'}],
  [{'symbol': 'b'}, {'symbol': 'b2'}, {'symbol': 'b2.1'}],
  [{'symbol': 'b'}, {'symbol': 'b2'}, {'symbol': 'b2.2'}],
  [{'symbol': 'b'}, {'symbol': 'b2'}, {'symbol': 'b2.3'}],
]
