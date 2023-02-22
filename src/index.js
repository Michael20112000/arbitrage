import {iterationCounter, calculateTime} from './Counter.js'
import {Getter} from './1_Getter/index.js'
import {Detector} from './2_Detector/index.js'
import fs from 'fs'
// import {Worker} from './3_Worker/index.js'

setTimeout(() => {
  (async function () {
    // const getterStart = process.hrtime()
    const {makerCommission, takerCommission, balances, symbolsData} = await Getter.getArbitrageData('binance')
    // calculateTime(getterStart, 'Getter')

    // const detectorStart = process.hrtime()
    const binanceArbitrage = Detector.detectArbitrage({
      symbolsData,
      target: 'USDT',
      balances,
      makerCommission,
      takerCommission
    })
    // calculateTime(detectorStart, 'Detector')

    const targetBalance = binanceArbitrage.targetBalance
    const bestOffer = binanceArbitrage.profitFirstSortedBranches[0][2].theoreticalQuantity
    if (bestOffer > targetBalance) {
      console.log('Клює!')
      fs.writeFile('staticData/binanceArbitrage.json', JSON.stringify(binanceArbitrage), err => {
        if (err) throw err
        console.log('Data written to file')
      })
    }

    // const arbitrageResult = Worker.makeMoney(binanceArbitrage)
    // console.log(`iterations: ${iterationCounter}`)
  }())
}, 66000)

// fs.writeFile('staticData/symbolsData.json', JSON.stringify(symbolsData), err => {
//   if (err) throw err
//   console.log('Data written to file')
// })
