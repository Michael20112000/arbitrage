let iterationCounter = 0;
let requestCounter = 0;
Array.prototype.forEach = function (callback) {
    for (let i = 0; i < this.length; i++) {
        callback(this[i], i, this);
        iterationCounter++;
    }
};
Array.prototype.filter = function (callback) {
    let result = [];
    for (let i = 0; i < this.length; i++) {
        if (callback(this[i], i, this)) {
            result.push(this[i]);
        }
        iterationCounter++;
    }
    return result;
};
Array.prototype.reduce = function (callback, initialValue) {
    let accumulator = initialValue || this[0];
    for (let i = initialValue ? 0 : 1; i < this.length; i++) {
        accumulator = callback(accumulator, this[i], i, this);
        iterationCounter++;
    }
    return accumulator;
};
Array.prototype.map = function (callback) {
    let result = [];
    for (let i = 0; i < this.length; i++) {
        result.push(callback(this[i], i, this));
        iterationCounter++;
    }
    return result;
};
Array.prototype.find = function (callback) {
    for (let i = 0; i < this.length; i++) {
        iterationCounter++;
        if (callback(this[i], i, this)) {
            return this[i];
        }
    }
    return undefined;
};
function newRequest() {
    requestCounter++;
}
function calculateTime(start, name) {
    const end = process.hrtime(start);
    const time = end[0] + end[1] / 1e9;
    console.log(`${name} time: ${String(time).slice(0, 4)}`);
}
export { iterationCounter, requestCounter, newRequest, calculateTime };
