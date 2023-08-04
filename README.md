# Gas Optimization Challenge

Solc version: 0.8.17  
Optimizer enabled: true  
Runs: 100  
Block limit: 30000000 gas  

## Auction

**Before**
|Methods|Min|Max|Avg|# calls|
|---|---|---|---|---|
|auctionEnd|-|-|62526|1|
|bid|57098|68948|63023|2|
|withdraw|23543|28577|26060|2|
|Deployments|||331613||

**After**
|Methods|Min|Max|Avg|# calls|
|---|---|---|---|---|
|auctionEnd|-|-|58522|1|
|bid|55184|67038|61111|2|
|withdraw|23543|28577|26060|2|
|Deployments|||266372||

## Purchase

**Before**
|Methods|Min|Max|Avg|# calls|
|---|---|---|---|---|
|abort|-|-|53270|1|
|confirmPurchase|-|-|46533|3|
|confirmReceived|-|-|36210|2|
|refundSeller|-|-|38417|1|
|Deployments|||370617||

**After**
|Methods|Min|Max|Avg|# calls|
|---|---|---|---|---|
|abort|-|-|51257|1|
|confirmPurchase|-|-|44478|3|
|confirmReceived|-|-|34078|2|
|refundSeller|-|-|34202|1|
|Deployments|||346760||

## Ballot

**Before**
|Methods|Min|Max|Avg|# calls|
|---|---|---|---|---|
|delegate|-|-|53812|1|
|giveRightToVote|48286|48298|48296|6|
|vote|-|-|72331|3|
|Deployments|||647762||

**After**
|Methods|Min|Max|Avg|# calls|
|---|---|---|---|---|
|delegate|-|-|32521|1|
|giveRightToVote|44307|44319|44317|6|
|vote|-|-|51073|3|
|Deployments|||496026||