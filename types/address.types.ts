export interface City {
  pkCity: number
  name: string
  fkState: number
  status: number
  createdAt: string
  updatedAt: string
}

export interface State {
  pkState: number
  name: string
  fkCountry: number
  internalCode: string
  status: number
  createdAt: string
  updatedAt: string
}

export interface Country {
  pkCountry: number
  name: string
  code?: string
  internalCode?: string
}
