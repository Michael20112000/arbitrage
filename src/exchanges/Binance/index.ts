import {Getter} from './1_Getter/index.js'
import {Detector} from './2_Detector/index.js'
import {Worker} from './3_Worker/index.js'
import {calculateTime, iterationCounter, requestCounter} from './Counter.js'
import fs from 'fs'

export const Binance = new class {
  async work() {
    // 1. Отримуємо необхідну інформацію для визначення арбітражу.
    const getterStart = process.hrtime()
    const {balances, symbolsData} = await Getter.getArbitrageData()
    calculateTime(getterStart, 'Getter')

    // 2. Шукаємо всі арбітражні можливості, сортуємо в порядку спадання вигоди.
    const detectorStart = process.hrtime()
    const binanceArbitrage = Detector.detectArbitrage({
      balances,
      symbolsData,
      target: 'USDT'
    })
    calculateTime(detectorStart, 'Detector')

    fs.writeFile('staticData/binanceArbitrage.json', JSON.stringify(binanceArbitrage), err => {
      if (err) throw err
      console.log('Data written to file')
    })

    // 3. Реалізовуємо знайдений арбітраж.
    const workerStart = process.hrtime()
    const workerResult = await Worker.makeMoney(binanceArbitrage)
    calculateTime(workerStart, 'Worker')

    fs.writeFile('staticData/workerResult.json', JSON.stringify(workerResult), err => {
      if (err) throw err
      console.log('Data written to file')
    })

    // Просто для аналізу продуктивності.
    console.log(`iterations: ${iterationCounter}`)
    console.log(`requests: ${requestCounter}`)
  }
}
