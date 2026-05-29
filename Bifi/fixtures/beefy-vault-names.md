---
type: fixtures
project: Bifi
source: api.beefy.finance/vaults + /tvl (snapshot 2026-05-29)
purpose: real vault names for Figma mockups — pick organic mixes by length tier
---

# Beefy vault names — picker pool

Curated set of real, active Beefy vaults from the public API. Use when filling vault lists in Figma mockups to replace placeholder tickers (`BTC`, `LEO`, `TON`, `XLM` etc).

**Selection rule for "organic" lists**: alternate short and long entries rather than ranking by length. One very long anchor (~19-24 chars) and one ultra-short (~5-7 chars) per ~9-row list keeps the layout from feeling like a stress test.

Refresh: re-run `curl https://api.beefy.finance/vaults` + `/tvl` and re-sort. Snapshot 2026-05-29.

---

## Set last shipped (Select vault to receive, 2026-05-29)

The 9-row mix actually placed in the artboard `Widthdraw to vault` → `Select vault to receive`:

1. `cbBTC-USDC` (10)
2. `tBTC-WBTC` (9)
3. `WETH-USDC vLP` (13)
4. `USDf/USDC` (9)
5. `AERO-wstETH vLP` (15)
6. `wS-WBTC` (7)
7. `sUSD/DAI/USDCe/USDT` (19) — anchor
8. `ETH-WBNB` (8)
9. `USDT0 (Steakhouse)` (18)

---

## Tier 1 — Short (≤ 8 chars)

Single-asset Morpho/Aave vaults usually just show the ticker; some Beefy single-strategy ones too.

- `BIFI` (4) — beefy / ethereum
- `USDC` (4) — many (single-asset Morpho/Aave variants)
- `cbBTC` (5)
- `TriCRV` (6)
- `T/WETH` (6) — convex
- `wS-WBTC` (7) — shadow / sonic
- `OP-USDC` (7) — velodrome / optimism
- `OP-WETH` (7) — velodrome / optimism
- `ETH-WBNB` (8) — pancakeswap / bsc
- `MIM-USDC` (8) — mim / arbitrum
- `tBTC/WBTC` (9) — convex / arbitrum

## Tier 2 — Medium (9-13 chars)

The bread and butter — simple LP pairs.

- `tBTC-WBTC` (9)
- `USDf/USDC` (9)
- `RLUSD/USDC` (10)
- `cbBTC-USDC` (10)
- `sUSD/sUSDe` (10)
- `ETH-BTCB` (8)
- `wstETH-WETH` (11) — uniswap / arbitrum
- `USDS/stUSDS` (11) — curve
- `eUSD/USDC` (9)
- `msETH/WETH` (10)
- `cbETH-WETH` (10) — aerodrome / base
- `PYUSD/USDC` (10) — curve
- `BOLD/LUSD` (9)
- `MIM-USD₮0` (9) — arbitrum
- `WBTC-USDC` (9) — pancakeswap / arbitrum
- `crvUSD/USDT` (11)
- `cvxCRV/CRV` (10)
- `WETH-USDC vLP` (13) — aerodrome / base
- `USDC-AERO vLP` (13)
- `USDC-MAI sLP` (12)

## Tier 3 — Long (14-20 chars)

Pair + suffix or 3-token Curve-style.

- `AERO-wstETH vLP` (15)
- `msETH-WETH sLP` (14)
- `msUSD-USDC sLP` (14) — aerodrome
- `DOLA-USDC sLP` (13)
- `WETH-USDC vLP V2` (16)
- `USDT/WBTC/WETH` (14) — convex / ethereum
- `USDT/GHO/USDC LP` (16) — aura / ethereum
- `frxETH/sfrxETH` (14) — convex / fraxtal
- `MIM/DAI/USDC/USDT` (17) — convex / stakedao
- `alETH/frxETH` (12)
- `WBTC/cbBTC/hemiBTC` (18) — stakedao
- `USDC/USDT/GHO V3` (16) — aura / arbitrum
- `USDT0/AUSD/USDC V3` (18) — balancer / monad
- `pmUSD/crvUSD` (12)
- `frxUSD/msUSD` (12)
- `crvUSD/sUSDe` (12)
- `WETH-bsdETH vLP` (15)
- `TriCryptoUSDC` (13)

## Tier 4 — Very long (21+ chars)

Use ONE per list as the visual anchor. More than one feels noisy.

- `sUSD/DAI/USDCe/USDT` (19) — curve / optimism
- `USDC (Steakhouse, Smokehouse)` (29) — morpho / ethereum
- `USDC (Steakhouse, High Yield V2)` (32) — morpho / base
- `USDT0 (Steakhouse, High Yield V2)` (33)
- `wstETH (Steakhouse, Smokehouse)` (31)
- `USDC (Gauntlet, Frontier V2)` (28)
- `frxUSD/FXB20291231` (18) — odd-looking but real (FXB expiry token)
- `frxUSD/FXB20261231` (18)
- `reUSDe 25Jun26` (14) — magpie / ethereum
- `reUSD 25Jun26` (13)

A common trick: ship the long one in **short form** in the mockup — `USDT0 (Steakhouse)` instead of `USDT0 (Steakhouse, High Yield V2)`. Still real, doesn't force-wrap.

---

## Chain badge pool

When the chain chip below the name should vary (instead of always `ETH`):

| chain    | typical chip label   |
|----------|----------------------|
| ethereum | `ETH`                |
| base     | `BASE`               |
| arbitrum | `ARB`                |
| optimism | `OP`                 |
| bsc      | `BSC`                |
| fraxtal  | `FRAX`               |
| sonic    | `SONIC`              |
| berachain| `BERA`               |
| monad    | `MONAD`              |
| avax     | `AVAX`               |

## Picker recipes

- **5 rows, calm**: 1 short, 3 medium, 1 long anchor.
- **9 rows, busy**: 2 short, 4 medium, 2 long, 1 very long anchor.
- **12+ rows**: same pattern, repeat tier 2 densely.
- **Avoid**: all-pair, all-Curve-stable, or every row with the same suffix (`vLP`). The placeholder list was too uniform — that's exactly the look to *avoid*.
