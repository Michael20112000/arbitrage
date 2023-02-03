import {Getter} from './1_Getter/index.js'
import {Detector} from './2_Detector/index.js'
// import {Worker} from './3_Worker/index.js'
// import fs from 'fs'

(async function () {
  const {makerCommission, takerCommission, balances, symbolsData} = await Getter.getArbitrageData('binance')

  const binanceArbitrage = Detector.detectArbitrage({symbolsData, currency: 'USDT', balances, steps: 3})

  // const arbitrageResult = Worker.makeMoney(binanceArbitrage)
}())
