import {API} from './API.js'
import {Transformer} from './Transformer.js'

export const Binance = new class {
  async getDataForArbitrage() {
    const [/*{serverTime},*/ accountInfo, exchangeInfo] = await Promise.all([
      // API.checkServerTime(),
      API.getAccountInfo(),
      API.getExchangeInfo()
    ])

    // console.log('time difference: ', serverTime - Date.now())

    const {makerCommission, takerCommission, balances} = accountInfo

    const {symbols} = exchangeInfo

    let aliveSymbols = Transformer.filterAliveSymbols(symbols).slice(0, 300)

    aliveSymbols = Transformer.trimUnnecessaryInfo(aliveSymbols)

    const aliveSymbols_inChunks = Transformer.splitIntoChunks({arr: aliveSymbols, perChunk: 100})

    const additionalSymbolsInfo_inChunks = await Promise.all(aliveSymbols_inChunks.map(chunk => {
      const symbolsNames = Transformer.getSymbolsNames(chunk)

      return Promise.all([
        API.getSymbolsPrices(symbolsNames),
        Promise.all(symbolsNames.map(symbolName => API.getOrderBook(symbolName)))
      ])
    }))

    const combinedAdditionalSymbolsInfo = Transformer.combineAdditionalSymbolsInfo(additionalSymbolsInfo_inChunks)

    const fullSymbols = Transformer.generateFullSymbols(aliveSymbols, combinedAdditionalSymbolsInfo)

    return {
      makerCommission, takerCommission, balances, symbolsData: fullSymbols
    }
  }
}
