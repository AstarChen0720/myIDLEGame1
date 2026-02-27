### 一、先把 Room B 講成白話

- **Room B（Logic）** = 店長的大腦 / 客服中心  
  - 負責：  
    - 聽 UI 說「玩家剛剛做了什麼事」  
    - 查帳本（Room A 的狀態）  
    - 用規則書（constants）算一算  
    - 再下指令給 Room A：「餅乾加 5 顆」「買一間 grandma」

**所以：**  

> Room B 文件要寫的，不是「規則本身」，而是：  
> **「在某個玩家互動發生時，大腦要一步步做哪些決定？」**

---

### 二、可以這樣寫比較不會卡住

下面直接用你的遊戲做完整範例。

#### 1. 層次一：問題清單（最抽象）

這一段可以寫在 `開發模仿流程.md` 的「Room B」底下：

```text
Room B 需要負責回答的問題（Problem List）：

1. 玩家點擊大餅乾時：
   - 這次點擊應該給玩家幾顆餅乾？
   - 哪些狀況下要忽略點擊？（例如遊戲暫停？）

2. 玩家按下「購買建築」時：
   - 目前這種建築的價格是多少？
   - 玩家現在餅乾夠不夠？
   - 夠的話，要怎麼更新：餅乾 -price、建築數量 +1？

3. 遊戲每經過一小段時間（tick）時：
   - 所有建築加起來，這段時間應該產生多少餅乾？
   - 要不要考慮 buff / 升級倍率？
   - 最後要怎麼把這些餅乾加回 Room A？

4. 存檔 / 載入時：
   - 要從 Room A 把哪些欄位打包成存檔？
   - 載入時，哪些欄位可以被覆蓋？（cookies, buildings, upgrades...）
```

這裡只是在列「大腦需要負責哪些問題」，**不講數學細節**，數學在規則書。

---

#### 2. 層次二：UI 看得到的「邏輯 API」

接著，把這些問題變成「Room C 會呼叫的函式名稱」：

```text
Room B 對外提供的主要函式（給 UI 用）：

- handleClickCookie()
  - 用在：玩家點了大餅乾。
  - UI 行為：`CookieButton` 只要呼叫這個函式，不管怎麼算。

- tryBuyBuilding(buildingKey)
  - 用在：玩家按下某個建築的「購買」按鈕。
  - UI 行為：
    - 呼叫後，如果買成功，UI 會自動因為 state 改變而更新。
    - 如果買失敗，函式會回傳錯誤（例如「餅乾不足」），UI 視情況顯示訊息。

- tick(deltaSeconds)
  - 用在：每隔固定時間被呼叫一次（例如每 1 秒）。
  - 功能：根據目前所有建築和升級，算出這段時間產生多少餅乾，更新回 Room A。
```

這一層你可以想成：  
**「寫給 UI 開發者看的：UI 只要知道有哪些函式可以用，不需要知道裡面怎麼算。」**

---

#### 3. 層次三：每個函式的「詳細流程」（一步步，大腦在做什麼）

這邊才是你問的「詳細流程」，也是 Room B 文件最重要的部分。  
還是純文字，不是程式碼。

##### 範例一：`handleClickCookie` 的流程

```text
handleClickCookie() 的流程：

1. 從 Room A 讀取目前的 clickerLevel。
2. 從規則書（constants）讀取：
   - baseClick
3. 用規則計算「這次點擊要給多少餅乾」：
   - 本遊戲規則：單次點擊收益 = baseClick + clickerLevel
4. 呼叫 Room A 提供的 action：
   - addCookies(本次點擊收益)
5. （未來可以加）記錄統計資料，例如：
   - 累積點擊次數 +1
   - 最近一次點擊時間
```

##### 範例二：`tryBuyBuilding(buildingKey)` 的流程

```text
tryBuyBuilding(buildingKey) 的流程：

1. 從 Room A 讀取：
   - 當前餅乾數：cookies
   - 目前擁有的該建築數量：buildings[buildingKey]

2. 從規則書讀取該建築的固定屬性：
   - basePrice
   - priceGrowthRate (例如 1.15)

3. 用規則計算「目前價格」：
   - price = basePrice × (priceGrowthRate ^ buildings[buildingKey])

4. 檢查餅乾是否足夠：
   - 如果 cookies < price：
     - 回傳失敗結果（例如：{ ok: false, reason: 'NOT_ENOUGH_COOKIES', price }）
     - 結束，不更新 Room A。
   - 如果 cookies >= price：
     - 繼續下一步。

5. 更新 Room A（透過它提供的 actions）：
   - setCookies(cookies - price)
   - incrementBuilding(buildingKey)

6. 回傳成功結果（例如：{ ok: true, price }）。
```

這個流程就是**「客服中心接到一個『我要買建築』的電話時，腦中實際做的事」**。

##### 範例三：`tick(deltaSeconds)` 的流程

```text
tick(deltaSeconds) 的流程：

1. 從 Room A 讀取：
   - 所有建築數量：buildings（例如 grandma 幾棟、factory 幾棟）
   - 升級資訊（如果會影響產量）

2. 從規則書讀取：
   - 每一種建築的 baseCps
   - （未來）產量加成倍率

3. 計算這個 tick 應該產生多少餅乾：
   - 先算出「每一種建築的每秒產量」：
     - grandmaCpsPerSecond = baseCps_grandma × grandmaCount × （各種倍率）
     - factoryCpsPerSecond = baseCps_factory × factoryCount × （各種倍率）
   - 把所有建築的每秒產量加總：
     - totalCpsPerSecond = grandmaCpsPerSecond + factoryCpsPerSecond + ...
   - 轉換成「這個 tick 的產量」：
     - produced = totalCpsPerSecond × deltaSeconds

4. 呼叫 Room A 的 action：
   - addCookies(produced)
```

---

### 三、總結成一句話（方便你記在腦中）

- **Room A 文件**：  
  - 寫「我有哪些欄位、有哪些簡單 action」，像銀行 API。
- **規則書（constants）**：  
  - 寫「這個世界的數學 / 物理定律」，不看玩家，只看規則。
- **Room B 文件**：  
  - 寫「當某個事件發生時（點擊、購買、時間流逝…），  
  大腦要依照規則書 + Room A 狀態，**一步步做什麼決策**？」  
  - 用 `handleClickCookie / tryBuyBuilding / tick` 這種函式為單位，  
  每個函式下面寫 1 → 2 → 3 → 4 的流程。

