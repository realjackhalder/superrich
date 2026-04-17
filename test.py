import requests

url = "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search"
payload = {
    "page": 1,
    "rows": 10,
    "payTypes": [],
    "asset": "USDT",
    "fiat": "MMK",
    "tradeType": "BUY"
}

res = requests.post(url, json=payload, timeout=10)
data = res.json()["data"]

print("Length of data:", len(data))
for item in data:
    adv = item["adv"]
    print("price:", adv["price"], "min:", adv["minSingleTransAmount"], "max:", adv["maxSingleTransAmount"])
