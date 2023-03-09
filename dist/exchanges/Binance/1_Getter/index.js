import { API } from './API.js';
import { Processor } from './Processor.js';
import fs from 'fs';
export const Getter = new class {
    async getArbitrageData() {
        const [fees, accountInfo, exchangeInfo] = await Promise.all([
            API.getFees(),
            API.getAccountInfo(),
            API.getExchangeInfo()
        ]);
        const { balances } = accountInfo;
        const { symbols } = exchangeInfo;
        const aliveSymbols = Processor.filterAliveSymbols(symbols);
        const symbolsPrices = Processor.combineChunks(await Promise.all(Processor.splitIntoChunks({ arr: aliveSymbols, perChunk: 400 })
            .map(chunk => {
            const symbolsNames = Processor.getSymbolsNames(chunk);
            return API.getSymbolsPrices(symbolsNames);
        })));
        fs.writeFile('staticData/symbolsPrices.json', JSON.stringify(symbolsPrices), err => {
            if (err)
                throw err;
            console.log('Data written to file');
        });
        const symbolsData = Processor.combineSymbolsInfo(aliveSymbols, symbolsPrices, fees);
        return {
            balances, symbolsData
        };
    }
};
