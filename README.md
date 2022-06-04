# Myers 差分算法可视化

*Author: Oto_G*

*Mail: 421739728@qq.com*

## 简介

**在线预览 [Myers View](https://myer-view.vercel.app/)**

使用 [Quasar](https://github.com/quasarframework/quasar)（基于 [Vue3](https://github.com/vuejs/core) ）的前端框架进行开发的 [Myers 差分算法](http://xmailserver.org/diff2.pdf) 可视化应用

- 图表库使用 [ECharts](https://github.com/apache/echarts)

感谢 [简析Myers - 掘金 (juejin.cn)](https://juejin.cn/post/6844903613790158862) ，其实现的JS版 Myers 算法已经逐行分析，解析见 [Myers 差分算法解析](https://github.com/G-haoyu/MyerView#myers-%E5%B7%AE%E5%88%86%E7%AE%97%E6%B3%95%E8%A7%A3%E6%9E%90)，C++版本Myers算法实现也已给出，见[C++版Myers差分算法实现](https://github.com/G-haoyu/MyerView#c版myers差分算法实现)

## 相关命令
```bash
npm install
```

### 本地开发
```bash
quasar dev
```

### 构建项目
```bash
quasar build
```

## Myers 差分算法解析

```js
function myers(stra, strb) {
    // 字符串 a 的长度为 n
    let n = stra.length
    // 字符串 b 的长度为 m
    let m = strb.length

    /*
    动态规划回溯前轮计算结果用，结构为 k: x ，
    存储的是该截距（k）目前能到达的最远端 x ，
    且 k 满足公式 k = x - y
    */
    let v = {
      '1': 0
    }
    /*
    存储的是每一步差异（d）中的所有截距（k）
    能到达的最远端 x 值，用于计算差异路径（d-path）
    结构为 d: {k : x}
    */
    let vs = {
      '0': { '1': 0 }
    }
    // 声明差异 d ，该值记录两字符串差异的大小
    let d

    loop:
    // 差异d，最坏情况 n+m 即两字符串完全不同
    for (d = 0; d <= n + m; d++) {
      let tmp = {}
      /*
      斜线不计入循环，只有两个方向 → || ↓
      这里使用剪枝思想，使k不用遍历全表
      */
      for (let k = -d; k <= d; k += 2) {
        /*
        判断是否是通过 + 到达的待测点，+ 的情况为：
        当前截距等于负差异（首次循环，也就是左边界）或者
        当前截距不等于正差异（末次循环，也就是上边界）且
        上一截距的x大于下一截距的x（体现优先删除）
        */
        let down = ((k == -d) || ((k != d) && v[k + 1] > v[k - 1]))
        /*
        如果是 + 方式到的该截距，
        则说明该截距的前一步是从上截距过来的，否则是下截距下来的
        */
        let kPrev = down ? k + 1 : k - 1
        // 获取前一步的坐标 xStart yStart
        let xStart = v[kPrev]
        let yStart = xStart - kPrev
        // 获取可能的当前点坐标，如果是 + 方式则x轴坐标不变，否则横坐标加一
        let xMid = down ? xStart : xStart + 1
        // y轴通过 k = x - y 计算得出
        let yMid = xMid - k
        // 声明当前可能的坐标（还未考虑走斜线）
        let xEnd = xMid
        let yEnd = yMid

        /*
        考虑走斜线（对字符串a、b进行比较，
        如果当前x、y所在字符串相同则走斜线）
        */
        while(xEnd < n && yEnd < m && stra[xEnd] === strb[yEnd]) {
          xEnd++
          yEnd++
        }

        // 更新截距k所能到的最远端xEnd，yEnd不必记录可以计算得到
        // 动态规划回溯子问题的实现
        v[k] = xEnd
        // 记录当前截距的最新端点
        tmp[k] = xEnd

        /*
        如果 xEnd 和 yEnd 到达了各自字符串的末端，
        说明路径寻找到了终点，可以结束寻找
        */
        if (xEnd == n && yEnd == m) {
          // 形成完整 d - k 端点表
          vs[d] = tmp
          // 生成 diff 路径
          let snakes = solution(vs, n, m, d)
          // 打印两字符串 diff
          printRes(snakes, stra, strb)
          // 完成 Myers diff
          break loop
        }
      }

      // 刷新当前差异下能到达的最远端
      vs[d] = tmp
    }
  }

  // 由后向前回溯
  function solution(vs, n, m, d) {
    // snakes存 + - 步骤
    let snakes = []
    // 存放当前搜索的位置
    let p = { x: n, y: m }

    // 两文本的差异数量已知，往前倒推步骤
    for (; d > 0; d--) {
      // 取出最后一步的差异所有能到达的点 v[k], k∈[-d, d]
      let v = vs[d]
      // 取出前一步的差异所有能到达的点
      let vPrev = vs[d-1]
      // 计算当前位置的截距，首次循环是终点所在截距k
      let k = p.x - p.y

      // 获取当前截距的坐标
      let xEnd = v[k]
      let yEnd = xEnd - k

      /*
      判断该步是通过 + 还是 - 操作得到的，分两类：
      1、当前截距与负差异相同
        1.1 这种情况说明当前差异除了走斜线以外，其余都是走 + 完成的（TODO: 可优化）
      2、当前截距不等于正差异 且 前一步差异所到达的点中，
      当前截距的上侧截距能到达的最远点的x值比下策截距能到达的最远点的x值大
        2.1 该判断的后半部分保证了删除先于增加的设计要求
      */
      let down = ((k == -d) || ((k != d) && (vPrev[k + 1] > vPrev[k - 1])))
      // 如果是通过 + 到达的该点，则前一步的截距在上侧，即 k + 1 ，反之则 k - 1
      let kPrev = down ? k + 1 : k - 1
      // 获得真正的前驱点（已包含走斜线情况）
      let xStart = vPrev[kPrev]
      let yStart = xStart - kPrev
      // 获得走斜线的开始点，形象的称为mid，（对于没有走斜线的情况，得到的就是当前点）
      let xMid = down ? xStart : xStart + 1
      let yMid = xMid - k

      // 将当前前驱点、斜线开始点（LCS）、当前点的 x 值压栈入 snakes
      snakes.unshift([xStart, xMid, xEnd])

      // 更新当前计算的位置
      p.x = xStart
      p.y = yStart
    }

    return snakes
  }

  function printRes(snakes, stra, strb) {
    let grayColor = '^'
    let redColor = '-'
    let greenColor = '+'
    let consoleStr = ''
    let args = []
    let yOffset = 0

    snakes.forEach((snake, index) => {
      // 获取步骤的前驱（开始） x
      let s = snake[0]
      // 获取步骤的LCS开始x
      let m = snake[1]
      // 获取步骤的终点 x
      let e = snake[2]
      // LCS的起点（TODO: 可以不新增large变量，snake中记录的m已经记录了LCS的开始位置）
      // let large = s

      // 如果是第一个差异，并且差异的开始点不是字符串头（即两字符串在开始部分有相同子字符串）
      // 只会在snakes的forEach中的一个出现
      if (index === 0 && s !== 0) {
        // 用灰色打印所有相同字符，直到s
        for (let j = 0; j < s; j++) {
          consoleStr += `%c${grayColor+stra[j]}`
          args.push(grayColor)
          // 记录b字符串的当前位置（yOffset类似游标）
          yOffset++
        }
      }

      // 如果该子串的差异是 - 操作
      // 删除
      if (m - s == 1) {
        // 用红色打印删除的字符
        consoleStr += `%c${stra[s]}`
        args.push(redColor)
        // TODO: 此处large可以省略
        // large = m
      // 如果该子串的差异是 + 操作
      // 添加
      } else {
        consoleStr += `%c${strb[yOffset]}`
        args.push(greenColor)
        // b字符串当前位置继续右移
        yOffset++
      }

      // LCS部分，当前终点位置 e 减去 LCS的开始位置，即为相同字串的长度
      // 不变
      // for (let i = 0; i < e - large; i++) {
      for (let i = 0; i < e - m; i++) {
        // TODO: 此处large可以使用m代替
        consoleStr += `%c${stra[m+i]}`
        args.push(grayColor)
        // b字符串当前位置继续右移
        yOffset++
      }
    })

    console.log(consoleStr, ...args)
  }

  // test部分
  let s1 = 'ABCABBA'
  let s2 = 'CBABAC'
  myers(s1, s2)

```

## C++版Myers差分算法实现

```c++
#include <iostream>
#include <string>
#include <cstring>
#include <map>
#include <vector>
#include <malloc.h>
using namespace std;

typedef map<int, int> MAP_INT_INT;

class MyersUtils {
  public:
  	// 初始化 
    MyersUtils();
    // 生成编辑图 
    void myers();
    // 回溯正确路线 
    void solution();
    // 显示差异 
    void show();

  private:
  	// 字符串A 
    string sstrA;
    // 字符串B
    string sstrB;
    // 字符串A 转char[] 
    char* strA;
    // 字符串B 转char[] 
    char* strB;
    // 字符串A长度 
    int m;
    // 字符串B长度 
    int n;
    // 两字符串差异数 
    int d;
    // 编辑图 
    vector<MAP_INT_INT> vs;
    // 完成路径 
    vector<int *> snakes;
};

MyersUtils::MyersUtils() {
    cout << "输入字符串A" << endl;
    cin>>sstrA;
    cout << "输入字符串B" << endl;
    cin>>sstrB;
    
    m = sstrA.length();
    n = sstrB.length();
    
    strA = new char[m + 1];
    strB = new char[n + 1];
    
    strcpy(strA, sstrA.c_str());
    strcpy(strB, sstrB.c_str()); 
    
    d = 0;
	
    myers();
    solution();
    show();
}

void MyersUtils::myers() {
	/* 
    动态规划回溯前轮计算结果用，结构为 k: x ，
    存储的是该截距（k）目前能到达的最远端 x ，
    且 k 满足公式 k = x - y 
    */
    MAP_INT_INT v;
    v.insert(MAP_INT_INT::value_type(1, 0));
    /* 编辑图： 
    存储的是每一步差异（d）中的所有截距（k）
    能到达的最远端 x 值，用于计算差异路径（d-path）
    结构为 d: {k : x}
    */
    vs.push_back(v);
    
    // 终止标志 
    bool isFinish = false;
    
    // 最坏情况 d = n + m 即两字符串完全不同
    for(d; d <= m + n && !isFinish; d++) {
    	MAP_INT_INT tmp;
    	/* 
     	斜线不计入循环，只有两个方向 → || ↓
      	同时，这里使用剪枝思想，使k只用遍历一半 
      	*/
    	for(int k = -d; k <= d; k += 2) {
    		/* 
	        判断是否是通过 + 到达的待测点，+ 的情况为：
	        当前截距等于负差异（首次循环，也就是左边界）或者
	        当前截距不等于正差异（末次循环，也就是上边界）且
	        上一截距的x大于下一截距的x（体现优先删除）
	        */
    		bool isDown = ((k == -d) || ((k != d) && v[k + 1] > v[k - 1]));
    		/* 
	        如果是 + 方式到的该截距，
	        则说明该截距的前一步是从上截距过来的，否则是下截距下来的
	        */
    		int kPrev = isDown ? k + 1 : k - 1;
    		// 获取前一步的 x 坐标 xStart
    		int xStart = v[kPrev];
    		// 获取可能的当前点坐标，如果是 + 方式则x轴坐标不变，否则横坐标 +1
    		int xMid = isDown ? xStart : xStart + 1;
    		// y轴通过 k = x - y 计算得出
    		int yMid = xMid - k;
    		// 声明当前可能的坐标（还未考虑走斜线）
    		int xEnd = xMid;
    		int yEnd = yMid;
	        // 考虑走斜线（对字符串a、b进行比较，如果当前x、y所在字符串相同则走斜线）
			while(xEnd < m && yEnd < n && strA[xEnd] == strB[yEnd]) {
				xEnd++;
				yEnd++;
			}
			
			// 更新截距k所能到的最远端xEnd，yEnd不必记录可以计算得到
        	// 动态规划回溯子问题的实现
    		v[k] = xEnd;
    		// 当前 d 下的各条snake记录 
    		tmp[k] = xEnd;
    		
    		/*
	        如果 xEnd 和 yEnd 到达了各自字符串的末端，
	        说明路径寻找到了终点，可以结束寻找
	        */
    		if(xEnd == m && yEnd == n) {
    			isFinish = true;
    			break;
			}
		}
		// 将当前 d 下的所有snake存入编辑图 
		vs.push_back(tmp);
	}
	
	d = d - 1;
	vs.erase(vs.begin());
}

// 由后向前回溯，找出正确差异路径 
void MyersUtils::solution() {
	// 存放当前搜索的位置
	int p[2] = {m, n};
	// 两文本的差异数量已知，往前倒推步骤
	for(d; d > 0; d--) {
		// 取出最后一步的差异所有能到达的点 v[k], k∈[-d, d]
		MAP_INT_INT v = vs[d];
		// 取出前一步的差异所有能到达的点
		MAP_INT_INT vPrev = vs[d-1];
		// 计算当前位置的截距，首次循环是终点所在截距k
		int k = p[0] - p[1];
		// 获取当前截距的 x 坐标
		int xEnd = v[k];
		/* 
	      判断该步是通过 + 还是 - 操作得到的，分两类：
	      1、当前截距与负差异相同
	        1.1 这种情况说明当前差异除了走斜线以外，其余都是走 + 完成的（TODO: 可优化）
	      2、当前截距不等于正差异 且 前一步差异所到达的点中，
	      当前截距的上侧截距能到达的最远点的x值比下策截距能到达的最远点的x值大
	        2.1 该判断的后半部分保证了删除先于增加的设计要求
      	*/
		bool isDown = ((k == -d) || ((k != d) && (vPrev[k + 1] > vPrev[k - 1])));
		// 如果是通过 + 到达的该点，则前一步的截距在上侧，即 k + 1 ，反之则 k - 1
		int kPrev = isDown ? k + 1 : k - 1;
		// 获得真正的前驱点（已包含走斜线情况）  
		int xStart = vPrev[kPrev];
		int yStart = xStart - kPrev;
		// 获得走斜线的开始点，形象的称为mid，（对于没有走斜线的情况，得到的就是当前点）
		int xMid = isDown ? xStart : xStart + 1;
		
		// 将当前前驱点、斜线开始点、当前点的 x 值存入 snakes
		int* snake = (int*)malloc(sizeof(int) * 3);
		*snake = xStart;
		*(snake+1) = xMid;
		*(snake+2) = xEnd;
		snakes.push_back(snake);
		
		// 更新当前计算的位置
		p[0] = xStart;
		p[1] = yStart;
	}
}

void MyersUtils::show() {
	string res = "";
	// strB 的位置偏移记录 
	int strBOffset = 0;
	
	for(int i = snakes.size() - 1; i >= 0; i--) {
		// 获取当前snake 
		int * snake = snakes[i];
		// 获取步骤的前驱（开始） x
		int s = *snake;
		// 获取步骤的相同部分的开始 x
		int m = *(snake + 1);
		// 获取步骤的终点 x
		int e = *(snake + 2);
		
		// 如果是第一个差异，并且差异的开始点不是字符串头
		if(i == snakes.size() - 1 && s != 0) {
			// 遍历相同字符，一直到第一个差异出现的位置 
			for(int j = 0; j < s; j++) {
				string str(1, strA[j]);
				res += " =:" + str;
				strBOffset++;
			}
		}
		
		// 如果该子串的差异是 - 操作，则是删减字符 
		if(m - s == 1) {
			string str(1, strA[s]);
			res += " -:" + str;
		} 
		// 如果该子串的差异是 + 操作，则是增加字符 
		else {
			string str(1, strB[strBOffset]);
			res += " +:" + str;
			strBOffset++;	
		}
		// 走斜边情况，遍历相同字符串 
		for(int index = 0; index < e - m; index++) {
			string str(1, strA[m + index]);
			res += " =:" + str;
			strBOffset++;	
		}
	}
	
	cout << res << endl;
}

int main() {
	MyersUtils m;
	return 0;
} 

```

