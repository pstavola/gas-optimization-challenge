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

