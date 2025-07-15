export interface FundsInfo {
  broker: string;
  availableMargin: number;
  usedMargin: number;
  totalBalance: number;
  collateral?: number;
  payinAmount?: number;
}
