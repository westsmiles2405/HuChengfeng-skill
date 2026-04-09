# HuChengfeng-skill 发布说明（VSCE）

## 1) 版本号策略

- 功能新增：`minor`（例如 `0.1.0 -> 0.2.0`）
- 修复问题：`patch`（例如 `0.2.0 -> 0.2.1`）
- 破坏性变更：`major`

## 2) 发布前检查清单

- [ ] `npm install`
- [ ] `npm run compile`
- [ ] `package.json` 中 `version` 已更新
- [ ] `README.md` / `README_EN.md` 已同步更新
- [ ] 图标存在：`media/hcf-icon.png`、`media/hcf-icon.svg`
- [ ] 人设策略配置项已可用：`hcf.personaMode`、`hcf.safeMode`

## 3) 本地打包

```bash
npm install -g @vscode/vsce
vsce package
```

产物示例：`huchengfeng-companion-0.1.0.vsix`

## 4) 发布到 Marketplace（可选）

```bash
vsce login <publisher>
vsce publish
```

## 5) 回滚建议

- 如果发布后发现问题，先修复并发补丁版本（`patch`）。
- 不建议覆盖已发布版本，保持版本线性递增。
