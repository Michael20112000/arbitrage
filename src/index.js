import {Binance} from './exchanges/Binance/index.js'
import fs from 'fs'

(async function () {
  const binanceResult = await Binance.work()

  fs.writeFile('staticData/binanceResult.json', JSON.stringify(binanceResult), err => {
    if (err) throw err
    console.log('Data written to file')
  })
}())
