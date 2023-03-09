export interface TradeFee {
  symbol: string
  makerCommission: string
  takerCommission: string
}

export interface AccountInfo {
  makerCommission: boolean
  takerCommission: number
  buyerCommission: number
  sellerCommission: number
  commissionRates: {
    maker: string
    taker: string
    buyer: string
    seller: string
  }
  canTrade: boolean
  canWithdraw: boolean
  canDeposit: boolean
  brokered: boolean
  requireSelfTradePrevention: boolean
  updateTime: number
  accountType: string
  balances: {
    asset: string
    free: string
    locked: string
  }[]
  permissions: string[]
}

type RateLimit = {
  rateLimitType: string
  interval: string
  intervalNum: number
  limit: number
}

type Filter = {
  filterType: string
  [key: string]: string
}

type Symbol = {
  symbol: string
  status: string
  baseAsset: string
  baseAssetPrecision: number
  quoteAsset: string
  quotePrecision: number
  quoteAssetPrecision: number
  baseCommissionPrecision: number
  quoteCommissionPrecision: number
  orderTypes: string[]
  icebergAllowed: boolean
  ocoAllowed: boolean
  quoteOrderQtyMarketAllowed: boolean
  allowTrailingStop: boolean
  cancelReplaceAllowed: boolean
  isSpotTradingAllowed: boolean
  isMarginTradingAllowed: boolean
  filters: Filter[]
  permissions: string[]
  defaultSelfTradePreventionMode: string
  allowedSelfTradePreventionModes: string[]
}

export interface ExchangeInfo {
  timezone: string
  serverTime: number
  rateLimits: RateLimit[]
  exchangeFilters: any
  symbols: Symbol[]
}

export interface SymbolPrice {
  symbol: string
  price: string
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  isSecure?: boolean
}
