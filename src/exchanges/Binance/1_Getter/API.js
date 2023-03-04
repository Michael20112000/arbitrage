// node_modules
import crypto from 'crypto'
import https from 'https'
import {config} from 'dotenv'
import {newRequest} from '../Counter.js'
import url from 'url'
// env
config()
const BASE_ENDPOINT = process.env.BASE_ENDPOINT
const API_KEY = process.env.API_KEY
const API_SECRET = process.env.API_SECRET

export const API = new class {
  getFees() {
    return this._createRequest({path: `/sapi/v1/asset/tradeFee`, isSecure: true})
  }

  getAccountInfo() {
    return this._createRequest({path: '/api/v3/account', isSecure: true})
  }

  getExchangeInfo() {
    return this._createRequest({path: '/api/v3/exchangeInfo?permissions=SPOT'})
  }

  getSymbolsPrices(symbolsNames) {
    return this._createRequest({path: `/api/v3/ticker/price?symbols=${JSON.stringify(symbolsNames)}`})
  }

  _createRequest({method = 'GET', path, isSecure = false}) {
    newRequest()
    return new Promise(resolve => {
      const options = {
        hostname: BASE_ENDPOINT, path, method
      }

      if (isSecure) {
        options.headers = {'X-MBX-APIKEY': API_KEY}
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

    const hash = crypto.createHmac('sha256', API_SECRET)
      .update(`timestamp=${timestamp}`)
      .digest('hex')

    const char = path.includes('?') ? '&' : '?'

    return `${path}${char}timestamp=${timestamp}&signature=${hash}`
  }
}
