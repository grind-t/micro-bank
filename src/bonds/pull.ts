import { join } from "node:path";
import { env } from "node:process";

import { listAllRussianBonds } from "@grind-t/russian-bonds";
import { TInvestApi, tInvestNumber } from "@grind-t/t-invest";

import { saveParquet } from "../common/save-parquet.ts";

const tInvestApi = new TInvestApi(env.T_INVEST_READONLY_TOKEN);

const [portfolio, allBonds] = await Promise.all([
  tInvestApi.operations.getPortfolio({ accountId: env.T_INVEST_ACCOUNT_ID }),
  listAllRussianBonds(env.T_INVEST_READONLY_TOKEN),
]);

const portfolioBonds = portfolio.positions
  .filter((v) => v.instrumentType === "bond")
  .map((v) => ({
    ticker: v.ticker,
    quantity: v.quantity && tInvestNumber(v.quantity),
    averagePrice: v.averagePositionPrice && tInvestNumber(v.averagePositionPrice),
  }));

void saveParquet(join(import.meta.dirname, "all.parquet"), allBonds);
void saveParquet(join(import.meta.dirname, "portfolio.parquet"), portfolioBonds);
