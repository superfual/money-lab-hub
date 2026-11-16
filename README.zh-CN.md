# Money Lab — 财务决策实验室

在投入真金白银之前，先练习管理资金。

[体验中文版本](https://fual-money-lab-x.phamphuanloc.chatgpt.site/?lang=zh) · [English README](README.md) · [评审指南（英文）](docs/judge-review.md)

Money Lab 以12个模拟月份，帮助玩家平衡现金、应急储备、投资和义务支出。目标不仅是增长资产，还要保持偿付能力。支持越南语、英语和简体中文；切换语言共用同一游戏进度。

- World 1：简单／中等／困难难度、月度现金流、投资估值、知识题及单人／多人体验。
- 掷骰前可不限时查看财务，掷骰后开始60秒决策窗口。
- Replay：改变一个已记录选择，使用相同事件种子比较，不修改原始结果或额外奖励 HUB。
- TapeOut #48：投资停止关卡；REF #49：组合由 Money Lab 计算的储备、下期义务和分期负担条件。两者部署于 X Layer 主网。
- 独立验证工具：导入决策 JSON，重新计算，并可读取记录区块。摘要和电路计算不能证明现实财务输入真实。
- 公开主网与创始人试点使用独立账本；HUB 免费且不可转移。玩家自行确认交易，gas 使用真实 OKB。
- World 2／3 为早期可玩的旅游投资原型，并非完整商业产品或主网多人系统。

游戏过程和财务输入在链下处理，结果由服务器签名，合约验证并结算。不能将整局游戏描述为完全去中心化或由电路证明。HUB 没有兑换现金的承诺。

创始人 Fual Nguyễn（Phạm Phú An Lộc）正寻找伙伴，一起完善 World 1，并继续建设 World 2 与 World 3。

[当前链上证据](docs/submission-readiness-evidence.json) · [本地化实现说明](docs/chinese-localization.md)
