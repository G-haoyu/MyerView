import * as echarts from 'echarts'

export default {
  myChart: null,

  myOption: {},

  xAxisLabelValue: [],

  yAxisLabelValue: [],

  xAxisLabelLength: 0,

  yAxisLabelLength: 0,

  drawOb: {},

  init(dom) {
    this.myChart = echarts.init(dom)
  },

  destory() {
    if(this.myChart !== null)
      this.myChart.dispose()
  },

  updateOption(stringA, stringB, drawOb) {
    if(stringA.length !== 0 && stringB.length !== 0) {
      this.xAxisLabelValue = stringA.split("")
      this.yAxisLabelValue = stringB.split("")
      this.xAxisLabelValue.unshift("")
      this.yAxisLabelValue.unshift("")
      this.xAxisLabelLength = this.xAxisLabelValue.length - 1
      this.yAxisLabelLength = this.yAxisLabelValue.length - 1
      this.createOption()
      // drawOb全绘制
      this.drawOb = drawOb
      console.log(drawOb)
      console.log(drawOb.allPaths)
      // 正确路径
      let rightPathData = {
        data: drawOb.rightPath,
        type: 'line',
        itemStyle: {
          color: 'red'
        },
        lineStyle: {
          width: 2,
          type: 'solid'
        }
      }
      this.myOption.series.push(rightPathData)
      // 所有搜索路径
      if(JSON.stringify(drawOb) !== "{}") {
        for(let j = 0; j < drawOb.allPaths.length; j++) {
          let dPaths = drawOb.allPaths[j]
          if(dPaths.d === 0){
            dPaths.paths[0].path.shift()
          }
          for(let i = 0; i < dPaths.paths.length; i++) {
            let kPaths = dPaths.paths[i]
            let akPathData = {
              data: kPaths.path,
              type: 'line',
              itemStyle: {
                color: 'green'
              },
              lineStyle: {
                  width: 2,
                  type: 'dashed'
              }
            }
            this.myOption.series.push(akPathData)
          }
        }
      }
      this.reloadChart()

    }
  },

  resizeChart() {
    this.myChart.resize()
  },

  reloadChart() {
    console.log(this.myOption)
    this.myChart.setOption(this.myOption, true)
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
    return kArray
  },
  createOption() {
    this.myOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
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
          data: [
            [this.xAxisLabelLength, this.yAxisLabelLength]
          ],
          type: 'scatter',
          symbolSize: 0,
          markLine: {
            silent: true,
            lineStyle: {
              color: '#333',
              width: 0.8,
              opacity: 0.4
            },
            data: this.generateKLines(this.xAxisLabelLength, this.yAxisLabelLength)
          }
        }
      ]
    }
  },
}
