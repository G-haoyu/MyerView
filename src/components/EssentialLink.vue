<template>
  <div></div>
</template>

<script>
import * as echarts from 'echarts';

import echartsUtils from "../js/echatsUtils";

import { defineComponent, onMounted, onUnmounted, onUpdated, reactive, ref, toRefs } from 'vue';

const xAxisLabelValue = ['','a', 'b', 'c', 'a', 'b', 'b', 'a'];
const yAxisLabelValue = ['','c', 'b', 'a', 'b', 'a', 'c'];


export default defineComponent({
  name: 'MyersChart',
  props: {
    stringA: {
      type: String,
      required: true,
      default: 'ABCABBA'
    },
    stringB: {
      type: String,
      required: true,
      default: 'CBABAC'
    },
    drawOb: {
      type: Object,
      required: true
    }
  },
  components: [

  ],

  setup(props) {

    let {stringA, stringB, drawOb} = toRefs(props)

    let seamless = ref(true)
    let fabPos = ref([18, 18])
    let draggingFab = ref(false)

    let option1 = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      xAxis: [{
        type: 'value',
        position: "top",
        axisLabel: {
          formatter: (value, index) => {
            return echartsUtils.getXAxisLabel(index, xAxisLabelValue, true);
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
        axisLabel: {
          formatter: (value, index) => {
            return echartsUtils.getYAxisLabel(index, yAxisLabelValue, true);
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
            [7, 6]
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
            data: echartsUtils.generateKLines(7, 6)
          }
        },
        {
          data: [
            [1, 1],
            [1, 2],
            [2, 3],
            [3, 3],
            [4, 4],
            [5, 4],
            [6, 4],
            [7, 5]
          ],
          type: 'line',
          itemStyle: {
            color: 'red'
          },
          lineStyle: {
            width: 2,
            type: 'solid'
          }
        },
        {
          data: [
            [2, 2],
            [2, 3],
            [3, 4],
            [4, 4],
            [5, 5],
            [5, 6]
          ],
          type: 'line',
          itemStyle: {
            color: 'green'
          },
          lineStyle: {
              width: 2,
              type: 'dashed'
          }
        },
      ]
    };

    var ec = ref({});
    onMounted(() => {
      // TODO: 去除初始option
      let myChart = echartsUtils.initTest(document.getElementById('main'), option1);
      window.onresize = () => {
        echartsUtils.resizeChart(myChart);
      }
      // 生成初始Option
      ec.value = myChart;
    })

    onUpdated(() => {
      // 重新初始化Option
      console.log(stringA.value)
    })

    onUnmounted(() => {
      console.log("delet show")
      ec.value.dispose();
    })

    return {
      stringA,
      stringB,
      drawOb,
      ec,
      seamless,
      fabPos,
      draggingFab,
      moveFab (ev) {
        draggingFab.value = ev.isFirst !== true && ev.isFinal !== true

        fabPos.value = [
          fabPos.value[ 0 ] - ev.delta.x,
          fabPos.value[ 1 ] - ev.delta.y
        ]
    }
    };

  }
})
</script>

