import {API} from './API.js'
import {Processor} from './Processor.js'

export const Getter = new class {
  async getArbitrageData() {
    const [accountInfo, exchangeInfo, fees] = await Promise.all([
      API.getAccountInfo(),
      API.getExchangeInfo(),
      API.getFees()
    ])

    const {balances} = accountInfo
    const {symbols} = exchangeInfo

    const aliveSymbols = Processor.filterAliveSymbols(symbols)

    const symbolsPrices = Processor.combineChunks(
      await Promise.all(
        Processor.splitIntoChunks({arr: aliveSymbols, perChunk: 400})
          .map(chunk => {
              const symbolsNames = Processor.getSymbolsNames(chunk)
            return API.getSymbolsPrices(symbolsNames)
          })
      )
    )

    const symbolsData = Processor.combineSymbolsInfo(aliveSymbols, symbolsPrices, fees)

    return {
      balances, symbolsData
    }
  }
}
