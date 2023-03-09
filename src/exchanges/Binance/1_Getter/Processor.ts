export const Processor = new class {
  filterAliveSymbols(symbols) {
    return symbols.filter(s => s.status === 'TRADING')
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

  combineChunks(symbolsPrices) {
    return symbolsPrices.reduce((acc, chunk) => acc.concat(chunk), [])
  }

  combineSymbolsInfo(symbols, symbolsPrices, fees) {
    const feesObj = fees.reduce((acc, curr) => {
      acc[curr.symbol] = curr.takerCommission
      return acc
    }, {})

    return symbols.map((symbObj, index) => ({
        ...symbObj,
        price: symbolsPrices[index].price,
        takerCommission: feesObj[symbObj.symbol] * 100
      })
    )
  }
}
