import https from 'https'
import crypto from 'crypto'
import {newRequest} from '../Counter.js'
import {config} from 'dotenv'
import url from 'url'
// env
config()
const BASE_ENDPOINT = process.env.BASE_ENDPOINT
const API_KEY = process.env.API_KEY
const API_SECRET = process.env.API_SECRET

export const Worker = new class {
  async makeMoney(data) {
    const actionsSequence = data.scenarios[0]

    const requests = this._implementSequence(actionsSequence)

    for await (const value of requests) {
      console.log(value)
    }

    return data
  }

  * _implementSequence(actions) {
    const action_1 = actions[0]
    const action_2 = actions[1]
    const action_3 = actions[2]

    const {symbol: symbol1, side: side1, qty: qty1} = action_1
    const {symbol: symbol2, side: side2, qty: qty2} = action_2
    const {symbol: symbol3, side: side3, qty: qty3} = action_3

    yield this._createRequest({
      method: 'POST',
      path: `/api/v3/order?symbol=${symbol1}&side=${side1}&type=MARKET&quoteOrderQty=${qty1}`,
      isSecure: true
    })

    yield this._createRequest({
      method: 'POST',
      path: `/api/v3/order?symbol=${symbol2}&side=${side2}&type=MARKET&quoteOrderQty=${qty2}`,
      isSecure: true
    })

    yield this._createRequest({
      method: 'POST',
      path: `/api/v3/order?symbol=${symbol3}&side=${side3}&type=MARKET&quoteOrderQty=${qty3}`,
      isSecure: true
    })
  }

  _createRequest({method = 'GET', path, isSecure = false}) {
    newRequest()
    return new Promise(resolve => {
      const options = {
        hostname: BASE_ENDPOINT, path, method
      }

      if (isSecure) {
        options.headers = {
          'X-MBX-APIKEY': API_KEY
        }
        options.path = this._updateToSecure(options.path)
      }

      const request = https.request(options, response => {
        let data = ''
        response.on('data', chunk => data += chunk)
        response.on('error', console.error)
        response.on('end', () => resolve(JSON.parse(data)))
      })

      request.on('error', err => {
        console.log('Request error!', err)
      })
      request.end()
    })
  }

  _updateToSecure(path) {
    const timestamp = Date.now()
    const query = url.parse(path).query

    const hash = crypto.createHmac('sha256', API_SECRET)
      .update(`${query}&timestamp=${timestamp}`)
      .digest('hex')

    const char = path.includes('?') ? '&' : '?'

    return `${path}${char}timestamp=${timestamp}&signature=${hash}`
  }
}
