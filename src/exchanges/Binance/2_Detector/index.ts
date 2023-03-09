import {Processor} from './Processor.js'

export const Detector = new class {
  detectArbitrage({balances, symbolsData, target, steps = 3}) {
    const targetBalance = Processor.getTargetBalance(balances, target)

    const currenciesTradesInfo = Processor.findMentions(symbolsData)

    const tree = Processor.generateTree({
      currenciesTradesInfo, firstTarget: target, target, targetBalance, steps
    })

    const allBranches = tree.flatMap(node => Processor.getBranches(node))

    const acceptableBranches = Processor.removeShortBranches(allBranches, steps)

    return {
      target, targetBalance, steps, scenarios: Processor.sortProfitFirst(acceptableBranches)
    }
  }
}
