import {iterationCounter, calculateTime} from './Counter.js'
import {Getter} from './1_Getter/index.js'
import {Detector} from './2_Detector/index.js'
// import {Worker} from './3_Worker/index.js'

(async function () {
  const getterStart = process.hrtime()
  const {makerCommission, takerCommission, balances, symbolsData} = await Getter.getArbitrageData('binance')
  calculateTime(getterStart, 'Getter')

  const binanceArbitrage = Detector.detectArbitrage({symbolsData, target: 'USDT', balances})

  // const arbitrageResult = Worker.makeMoney(binanceArbitrage)
  console.log(`iterationCounter: ${iterationCounter}`)
}())
