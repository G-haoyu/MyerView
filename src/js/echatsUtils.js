import * as echarts from 'echarts'

export default {
  myChart: null,

  myOption: {},

  xAxisLabelValue: [],

  yAxisLabelValue: [],

  xAxisLabelLength: 0,

  yAxisLabelLength: 0,

  kArray: [],

  drawOb: {},

  showRightPath: true,

  showKLine: true,

  nowD: null,

  nowP: null,

  undoStack: [],
  undoStack2: [],

  init(dom) {
    this.myChart = echarts.init(dom)
  },

  destory() {
    if(this.myChart !== null)
      this.myChart.dispose()
  },

  updateOption(stringA, stringB, drawOb) {
    if(stringA.length !== 0 && stringB.length !== 0) {
      this.nowD = drawOb.d
      this.nowP = 0
      this.undoStack = []
      this.undoStack2 = []
      this.showRightPath = true
      this.showKLine = true
      this.xAxisLabelValue = stringA.split("")
      this.yAxisLabelValue = stringB.split("")
      this.xAxisLabelValue.unshift("")
      this.yAxisLabelValue.unshift("")
      this.xAxisLabelLength = this.xAxisLabelValue.length - 1
      this.yAxisLabelLength = this.yAxisLabelValue.length - 1
      this.createOption()
      // drawOb全绘制
      this.drawOb = drawOb
      this.drawOb["dConts"] = []
      console.log(drawOb)
      // 正确路径
      let rightPathData = {
        id: 'rightPath',
        data: drawOb.rightPath,
        type: 'line',
        showSymbol: false,
        z: 10,
        clip: true,
        itemStyle: {
          color: 'red'
        },
        lineStyle: {
          width: 2,
          type: 'solid'
        }
      }
      this.myOption.series.unshift(rightPathData)
      // 所有搜索路径
      if(JSON.stringify(drawOb) !== "{}") {
        let dCounts = []
        for(let j = drawOb.allPaths.length - 1; j >= 0; j--) {
          let dPaths = drawOb.allPaths[j]
          let d = dPaths.d
          if(d === 0){
            dPaths.paths[0].path.shift()
          }
          // 创建d-conters
          let dCountList = []
          // 创建kPath
          for(let i = dPaths.paths.length - 1; i >= 0; i--) {
            let kPaths = dPaths.paths[i]
            let k = kPaths.k
            let akPathData = {
              id: 'd'+d+':k'+k,
              data: kPaths.path,
              type: 'line',
              showSymbol: false,
              clip: true,
              itemStyle: {
                color: 'green'
              },
              lineStyle: {
                  width: 2,
                  type: 'solid'
              }
            }
            this.myOption.series.unshift(akPathData)
            // kPaths末尾元素进入dCountList
            dCountList.unshift(kPaths.path.at(-1))
          }
          // 组装dCount
          dCounts.unshift({d: d, path: dCountList})
          this.drawOb.dConts = dCounts
          // 绘制dCount路径
          let dCountData = {
            id: 'd'+d,
            data: dCountList,
            type: "line",
            symbolSize: 6,
            clip: true,
            endLabel: {
              show: true,
              formatter: (val) => {return 'd = ' + d},
              rotate: 45,
              distance: 12,
              offset: [7, -7]
            },
            itemStyle: {
              color: "orange"
            },
            lineStyle: {
                width: 0.6,
                type: "solid"
            }
          }
          this.myOption.series.push(dCountData)
        }
        this.reloadChart()
      }
    }
  },

  reloadChart() {
    this.myChart.setOption(this.myOption, true)
  },

  reloadChart2() {
    this.myChart.setOption(this.myOption, false)
  },

  undo() {
    let result = "可视化回放"
    if(this.nowD !== null) {
      // 如果是倒退第一步，先把rightPath移除
      if(this.drawOb.d === this.nowD && this.showRightPath === true) {
        this.showRightPath = false
        // rightPath 位置，从尾开始
        let location = -this.drawOb.d - 4
        this.undoStack.unshift(JSON.stringify(this.myOption.series.at(location).data))
        this.myOption.series.at(location).data = []
        result = "nowD: "+this.nowD
      }
      // 如果还能倒退，且showRightPath为false
      else if(this.nowD > 0 && this.showRightPath === false) {
        let location = -this.drawOb.d - 4 - this.nowP - 1
        this.undoStack.unshift(JSON.stringify(this.myOption.series.at(location).data))
        let id = this.resolveID(this.myOption.series.at(location).id)
        // 显示当前 k 线 id.k
        let kLinesIndex = id.k + this.yAxisLabelLength - 1
        if(kLinesIndex >=0 && kLinesIndex < this.kArray.length)
          this.myOption.series.at(-this.drawOb.d - 3).markLine.data = [this.kArray[kLinesIndex]]
        else
          this.myOption.series.at(-this.drawOb.d - 3).markLine.data = []
        this.reloadChart2()
        // 删除当前数据
        this.myOption.series.at(location).data = []
        // 判断是否开始一轮 d ，id.d !== nowD，如果开始则先删除dCount
        if(id.d !== this.nowD || this.nowP === 0) {
          let location2 = -id.d - 1
          this.undoStack2.unshift(JSON.stringify(this.myOption.series.at(location2).data))
          this.myOption.series.at(location2).data = []

          this.nowD = id.d
        }
        this.nowP = this.nowP + 1
        result = "nowD: "+this.nowD+" nowK: "+id.k
      }
    }
    this.reloadChart2()
    return result
  },

  redo() {
    let result = "可视化回放"
    if(this.nowD !== null) {
      // 如果是前进最后一步，把rightPath还原
      if(this.drawOb.d === this.nowD && this.showRightPath === false && this.nowP === 0) {
        this.showRightPath = true
        // rightPath 位置，从尾开始
        let location = -this.drawOb.d - 4
        this.myOption.series.at(location).data = JSON.parse(this.undoStack.shift())
        result = "可视化回放"
      }
      // 如果还能前进，且showRightPath为false
      else if(this.nowD <= this.drawOb.d && this.nowP !== 0) {
        let location = -this.drawOb.d - 4 - this.nowP
        // this.undoStack.unshift(JSON.stringify(this.myOption.series.at(location).data))
        let id = this.resolveID(this.myOption.series.at(location).id)
        if(!this.showKLine){
          this.showKLine = true
          // 显示当前 k 线 id.k
          let kLinesIndex = id.k + this.yAxisLabelLength - 1
          if(kLinesIndex >=0 && kLinesIndex < this.kArray.length)
            this.myOption.series.at(-this.drawOb.d - 3).markLine.data = [this.kArray[kLinesIndex]]
          else
            this.myOption.series.at(-this.drawOb.d - 3).markLine.data = []
          this.reloadChart2()
        }
        // // 显示当前 k 线 id.k
        // let kLinesIndex = id.k + this.yAxisLabelLength - 1
        // if(kLinesIndex >=0 && kLinesIndex < this.kArray.length)
        //   this.myOption.series.at(-this.drawOb.d - 3).markLine.data = [this.kArray[kLinesIndex]]
        // else
        // this.myOption.series.at(-this.drawOb.d - 3).markLine.data = []
        //   this.reloadChart2()
        // 添加当前数据
        else {
          this.showKLine = false
          this.myOption.series.at(location).data = JSON.parse(this.undoStack.shift())
          // 判断是否开始一轮 d ，id.d !== nowD，如果开始则先删除dCount
          if(id.d !== this.nowD) {
            let location2 = -id.d
            // this.undoStack2.unshift(JSON.stringify(this.myOption.series.at(location2).data))
            this.myOption.series.at(location2).data = JSON.parse(this.undoStack2.shift())

            this.nowD = id.d
          } else if (this.nowP === 1) {
            let location2 = -this.drawOb.d - 1
            // this.undoStack2.unshift(JSON.stringify(this.myOption.series.at(location2).data))
            this.myOption.series.at(location2).data = JSON.parse(this.undoStack2.shift())
          }
          this.nowP = this.nowP - 1
        }
        // this.myOption.series.at(location).data = JSON.parse(this.undoStack.shift())
        // // 判断是否开始一轮 d ，id.d !== nowD，如果开始则先删除dCount
        // if(id.d !== this.nowD) {
        //   let location2 = -id.d
        //   // this.undoStack2.unshift(JSON.stringify(this.myOption.series.at(location2).data))
        //   this.myOption.series.at(location2).data = JSON.parse(this.undoStack2.shift())

        //   this.nowD = id.d
        // } else if (this.nowP === 1) {
        //   let location2 = -this.drawOb.d - 1
        //   // this.undoStack2.unshift(JSON.stringify(this.myOption.series.at(location2).data))
        //   this.myOption.series.at(location2).data = JSON.parse(this.undoStack2.shift())
        // }
        // this.nowP = this.nowP - 1
        result = "nowD: "+this.nowD+" nowK: "+id.k
      }
    }
    this.reloadChart2()
    return result
  },

  resolveID(id) {
    let res = {}
    let sp = id.split(":")
    let ds = sp[0].split(/d/g)
    res["d"] = parseInt(ds[1])
    if(sp.length == 2) {
      let ks = sp[1].split(/k/g)
      res["k"] = parseInt(ks[1])
    }
    return res
  },

  resizeChart() {
    this.myChart.resize()
  },

  getXAxisLabel(index, rightValues, showIndex) {
    if(showIndex)
      return '{textXStyle|'+rightValues[index]+'}\n'+index
    return '{textXStyle|'+rightValues[index]+'}'
  },

  getYAxisLabel(index, rightValues, showIndex) {
    if(showIndex)
      return '{textYStyle|'+rightValues[index]+'}'+index
    return '{textYStyle|'+rightValues[index]+'}'
  },

  generateKLines(xLength, yLength) {
    let kStart = -(yLength - 1)
    let kEnd = xLength  - 1
    let kArray = []
    let kMid = xLength - yLength
    for(let i = kStart; i <= kEnd; i++) {
      let ll
      if(i < kMid) {
        if(i > 0)
          ll = [
            {name: 'k = ' + i, coord: [i, 0]},
            {coord: [i + yLength, yLength]}
          ]
        else
          ll = [
            {name: 'k = ' + i, coord: [0, -i]},
            {coord: [i + yLength, yLength]}
          ]
      } else if(i > kMid) {
        if(i < 0)
          ll = [
            {name: 'k = ' + i, coord: [0, -i]},
            {coord: [xLength, xLength - i]}
          ]
        else
          ll = [
            {name: 'k = ' + i, coord: [i, 0]},
            {coord: [xLength, xLength - i]}
          ]
      } else {
        if(kMid >= 0)
          ll = [
            {name: 'k = ' + kMid, coord: [kMid, 0]},
            {coord: [xLength , yLength]}
          ]
        else
          ll = [
            {name: 'k = ' + kMid, coord: [0, -kMid]},
            {coord: [xLength , yLength]}
          ]
      }
      kArray.push(ll)
    }
    this.kArray = kArray
    return kArray
  },

  createOption() {
    this.myOption = {
      xAxis: [{
        type: 'value',
        position: "top",
        interval: 1,

        max: this.xAxisLabelLength,
        axisLabel: {
          formatter: (value, index) => {
            return this.getXAxisLabel(index, this.xAxisLabelValue, true)
          },
          rich: {
            textXStyle: {
              color: 'blue',
              distance: 50
            }
          }
        }
      }],
      yAxis:  [{
        type: 'value',
        inverse: true,
        interval: 1,
        max: this.yAxisLabelLength,
        axisLabel: {
          formatter: (value, index) => {
            return this.getYAxisLabel(index, this.yAxisLabelValue, true)
          },
          rich: {
            textYStyle: {
              color: 'orange',
              lineWeight: 30
            }
          }
        }
      }],
      series: [
        {
          id: 'nowKLine',
          data: [
            [this.xAxisLabelLength, this.yAxisLabelLength]
          ],
          type: 'scatter',
          symbolSize: 0,
          clip: true,
          markLine: {
            silent: true,
            symbol: ['none', 'arrow'],
            lineStyle: {
              color: '#9C27B0',
              width: 1,
              opacity: 1
            },
            data: []
          }
        },
        {
          id: 'kLines',
          data: [
            [this.xAxisLabelLength, this.yAxisLabelLength]
          ],
          type: 'scatter',
          symbolSize: 0,
          clip: true,
          markLine: {
            silent: true,
            symbol: ['none', 'none'],
            lineStyle: {
              color: '#333',
              width: 0.8,
              opacity: 0.4
            },
            label: {
              distance: [18,25]
            },
            data: this.generateKLines(this.xAxisLabelLength, this.yAxisLabelLength)
          }
        }
      ]
    }
  },
}
