# Store API 設計範例：專業開發者一步步怎麼寫

```markdown

## 1. 根據「會出現的流程」來設計

- 先想：點餅乾、買建築、tick、讀檔、重置……這些流程**會動到 Store 的哪些資料**。
- 再根據這些需求，列出 Store 要提供的 **State** 和 **Actions**。  
→ 所以是「根據會用到的流程」來決定要開放什麼，而不是先亂開一堆再來用。

---

## 2. 「最少且足夠」的權限

- 你的說法：「根據你要做的事情，來開放**最少的**銀行權限給 Logic」→ **對。**
- 更精準一點：是「**最少且足夠**」——  
  - **夠用**：每個流程都能透過這些操作完成該做的事；  
  - **最少**：不多開用不到的方法（例如不需要 `subtractCookies`，用 `setCookies` 或只在 Logic 裡算好再 `addCookies` 負數等設計就好，總之不要一堆重複、危險的開口）。

也就是：**只開 Logic 真正需要的那幾種操作，不多開。**

---

## 一句話

**「根據會出現的流程會用到 Store 的部分，規定出最少且足夠的『可修改的資料 + 對應的操作』，等於只開放 Logic 需要的最少銀行權限。」**  
你現在的理解就是這樣，可以照這個原則去設計 Room A 的 API。


```

這份是「從流程反推 Store 介面」的完整示範：思考順序 + 最終結果長什麼樣子。

---

## 一、專業開發者的思考流程（一步步）

### 步驟 1：先列出「所有會動到 Store 的流程」

腦中自問：**哪些事情發生時，會讀或改金庫的資料？**

從你的 logic.md / 開發流程裡整理出來：


| #   | 流程          | 誰觸發                              | 會動到 Store 嗎？                                |
| --- | ----------- | -------------------------------- | ------------------------------------------- |
| 1   | 玩家點擊餅乾      | UI 呼叫 handleClickCookie          | ✅ 要讀 click 相關、要寫 cookies                    |
| 2   | 玩家購買建築      | UI 呼叫 tryBuyBuilding(key)        | ✅ 要讀 cookies、buildings；要寫 cookies、buildings |
| 3   | 遊戲每段時間 tick | useAutoProduction 呼叫 tick(delta) | ✅ 要讀 buildings、upgrades；要寫 cookies          |
| 4   | 存檔          | 離開前 / 定時                         | ✅ 要讀「要存的那一堆」                                |
| 5   | 載入存檔        | 進遊戲 / 讀檔按鈕                       | ✅ 要寫「整包覆蓋」                                  |
| 6   | 重置遊戲        | 設定裡按重置                           | ✅ 要寫「全部清空或還原預設」                             |


→ **結論：Store 至少要能支援這 6 種流程用到的「讀」和「寫」。**

---

### 步驟 2：每個流程，Logic 要「讀」什麼、「寫」什麼？

逐流程填表（只關心 Store，不寫計算細節）：


| 流程   | 要從 Store **讀**                        | 要對 Store **寫**（希望有的操作）                  |
| ---- | ------------------------------------- | --------------------------------------- |
| 點擊餅乾 | clickerLevel（或算點擊量的依據）                | 餅乾 **加** 某個數                            |
| 購買建築 | cookies、buildings[buildingKey]        | 餅乾 **設成** 某值（扣款）、某建築 **+1**             |
| tick | buildings、upgrades                    | 餅乾 **加** 某個數（產量）                        |
| 存檔   | cookies, buildings, upgrades, 上次存檔時間等 | 無（只讀）                                   |
| 載入   | 無                                     | **整包** 覆蓋：cookies, buildings, upgrades… |
| 重置   | 無                                     | **全部** 還原成初始值                           |


→ **讀的需求** = Store 至少要存：`cookies`、`buildings`、`upgrades`，若點擊跟升級有關再加 `clickerLevel` 或從 upgrades 推。  
→ **寫的需求** = 需要這些「操作」：  

- 餅乾 **加** N → `addCookies(amount)`  
- 餅乾 **設成** 某值 → `setCookies(value)`（買東西扣款）  
- 某建築 **+1** → `incrementBuilding(buildingKey)`  
- 整包覆蓋 → `loadFromSave(saveData)`  
- 全部還原 → `resetGame()`

---

### 步驟 3：寫成「金庫的開口」清單（最小且足夠）

- **State（金庫裡放什麼）**  
只放流程會讀、且不會從別欄位算出來的：
  - `cookies`
  - `buildings`（例如 `{ grandma: 0, factory: 0 }`）
  - `upgrades`（例如 `{ clicker: 0 }`，或你遊戲的 key）
  - `lastSaveData`（可選，若要顯示上次存檔時間或做比對）
- **Actions（只開放這幾種操作）**  
對應上表，不多開：
  - `addCookies(amount)` — 點擊、tick 用
  - `setCookies(value)` — 購買時扣款用
  - `incrementBuilding(buildingKey)` — 購買成功 +1
  - `setUpgradeLevel(key, level)` — 若有升級流程、Logic 算完後寫回
  - `loadFromSave(saveData)` — 載入存檔整包覆蓋
  - `resetGame()` — 重置

**腦中檢查：**  
「點擊只會加餅乾 → addCookies 夠用；購買要扣錢+建築+1 → setCookies + incrementBuilding 夠用；tick 只加餅乾 → addCookies；載入/重置 → loadFromSave / resetGame。」  
→ **沒有多開用不到的口，也沒有少開導致某流程做不到。** 這就是「最少且足夠」。

---

### 步驟 4：規定 Store 的「紅線」（不寫什麼）

專業開發者會順便寫下：

- Room A **不**做：判斷「錢夠不夠」、算「這次點擊加多少」、算「建築價格」、算「tick 產量」。
- Room A **只**做：收到明確指令就改對應欄位（例如收到 `addCookies(5)` 就 `cookies += 5`）。
- 任何 if/else 的「業務判斷」都在 Room B，Store 只做「原子操作」。

---

## 二、最終結果長什麼樣子（可貼進 storerules / 設計文件）

下面就是上面思考完的「成品」：一份給自己或團隊看的 Store API 介面說明。

---

### useGameStore 介面（Room A）

**職責：** 只負責保存遊戲資料，並提供最少且足夠的「讀取」與「寫入」方法。不負責計算、不負責判斷。

**State(資料)（對外可讀）：**


| 欄位             | 型別（概念）                 | 說明                                    |
| -------------- | ---------------------- | ------------------------------------- |
| `cookies`      | number                 | 目前餅乾數                                 |
| `buildings`    | Record<string, number> | 各建築數量，例如 `{ grandma: 2, factory: 0 }` |
| `upgrades`     | Record<string, number> | 各升級等級，例如 `{ clicker: 1 }`             |
| `lastSaveData` | object                 | null                                  |


**Actions(操作)（Logic / 載入 / 重置 只能透過這些改資料）：**


| 方法                               | 用途                                         | 誰會用                    |
| -------------------------------- | ------------------------------------------ | ---------------------- |
| `addCookies(amount)`             | 餅乾 += amount                               | handleClickCookie、tick |
| `setCookies(value)`              | 餅乾 = value                                 | tryBuyBuilding（扣款）     |
| `incrementBuilding(buildingKey)` | buildings[buildingKey] += 1                | tryBuyBuilding         |
| `setUpgradeLevel(key, level)`    | upgrades[key] = level                      | 未來購買升級時                |
| `loadFromSave(saveData)`         | 用 saveData 覆蓋 cookies、buildings、upgrades 等 | 載入存檔流程                 |
| `resetGame()`                    | 全部還原成初始值                                   | 重置流程                   |


**紅線：**

- Store 內不寫「錢夠不夠」「價格多少」「點一下加多少」等邏輯。
- 所有「讀 State + 計算 + 決定呼叫哪個 Action」都在 Room B（Logic）完成。

---

## 三、和你現有文件的對應

- **開發模仿流程.md 第六步**：就是叫你做出「上面這份介面」。
- **logic.md**：裡面的 `handleClickCookie`、`tryBuyBuilding`、`tick` 的「呼叫 Room A 的 action」那幾步，對應的就是這份裡的 `addCookies`、`setCookies`、`incrementBuilding` 等。
- **storerules.md 那句**：「根據會出現的流程會用到 Store 的部分，規定出最少且足夠的『可修改的資料 + 對應的操作』」→ 上面步驟 1～3 就是在做這件事，**第二步的表格**就是「根據流程列出要讀要寫什麼」的範例。

之後你要加新流程（例如「購買升級」），就再走一遍：  
**新流程要讀什麼、寫什麼？** → 若現有 State/Actions 不夠，再補一個欄位或一個 action，仍然保持「最少且足夠」。