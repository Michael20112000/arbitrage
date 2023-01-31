import {Binance} from './exchanges/Binance/index.js'

export const Getter = new class {
  getArbitrageData(exchange) {
    switch (exchange) {
      case 'binance':
        return Binance.getDataForArbitrage()
      case 'other':
        return {message: 'Other exchange'}
      default:
        return {message: 'Unknown exchange!'}
    }
  }
}
