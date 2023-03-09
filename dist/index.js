import { Binance } from './exchanges/Binance/index.js';
(async function () {
    const binanceResult = await Binance.work();
}());
