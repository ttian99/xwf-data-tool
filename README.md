# xwf-data-tool
the tool to format xwf data from excel

## 安装依赖
```
git clone https://github.com/ttian99/xwf-data-tool.git xwf-data-tool
cd xwf-data-tool
npm install
```

## 使用方法
``` js
// 获取各学校对应小区
node getSchoolArr.js

// 获取各小区对应学校
node getVillageArr.js

// 获取所有学校对应小区
node getS2V.js

// 获取所有小区对应学校
node getV2S.js

// 获取锁定的数据
// -- 测试
node getLock.js
// -- 正式环境
pm2 start getLock.js
```