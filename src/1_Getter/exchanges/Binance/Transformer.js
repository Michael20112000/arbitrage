export const Transformer = new class {
  filterAliveSymbols(symbols) {
    return symbols.filter(s => {
      return s.status === 'TRADING'
    })
  }

  trimUnnecessaryInfo(symbols) {
    return symbols.map(({symbol, baseAsset, quoteAsset}) => ({symbol, baseAsset, quoteAsset}))
  }

  splitIntoChunks({arr, perChunk}) {
    return arr.reduce((resultArray, item, index) => {
      const chunkIndex = Math.floor(index / perChunk)

      if (!resultArray[chunkIndex]) {
        resultArray[chunkIndex] = []
      }

      resultArray[chunkIndex].push(item)

      return resultArray
    }, [])
  }

  getSymbolsNames(symbols) {
    return symbols.map(({symbol}) => symbol)
  }

  combineAdditionalSymbolsInfo(additionalSymbolsInfoInChunks) {
    return additionalSymbolsInfoInChunks.reduce((acc, chunk) => {
      acc.prices = acc.prices.concat(chunk[0])
      acc.orderBook = acc.orderBook.concat(chunk[1])

      return acc
    }, {prices: [], orderBook: []})
  }

  generateFullSymbols(symbols, additionalSymbolsInfo) {
    const {prices, orderBook} = additionalSymbolsInfo

    return symbols.map((symbObj, index) => ({
        ...symbObj,
        price: prices[index].price,
        // orderBook: {
        //   sell: orderBook[index].asks.reverse(),
        //   buy: orderBook[index].bids
        // }
      })
    )
  }
}
