import {Processor} from './Processor.js'
import fs from "fs";

export const Detector = new class {
  detectArbitrage({balances, symbolsData, target, steps = 3}) {
    const targetBalance = Processor.getTargetBalance(balances, target)

    const currenciesTradesInfo = Processor.findMentions(symbolsData)

    const tree = Processor.generateTree({
      currenciesTradesInfo, target, targetBalance, steps
    })

    fs.writeFile('staticData/tree.json', JSON.stringify(tree), err => {
      if (err) throw err
      console.log('Data written to file')
    })

    const allBranches = tree.flatMap(node => Processor.getBranches(node))

    const acceptableBranches = Processor.removeShortBranches(allBranches, steps)

    return {
      target, targetBalance, steps, branches: Processor.sortProfitFirst(acceptableBranches)
    }
  }
}
