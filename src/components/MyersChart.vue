<template>
  <q-page class="row justify-center">

    <div class="col-12 col-md-10" id="main"></div>

    <q-page-sticky position="bottom-right" :offset="fabPos">
      <q-fab
        v-model="seamless"
        :label="fabLabel"
        vertical-actions-align="center"
        color="deep-orange"
        padding="none xl"
        icon="keyboard_arrow_up"
        direction="up"
        :disable="draggingFab"
        v-touch-pan.prevent.mouse="moveFab"
      >
        <q-fab-action padding="3px" color="warning" icon="redo" @click="redoStep" label="向前一步(差异+1)" />
        <q-fab-action padding="3px" color="info" icon="undo" @click="undoStep" label="退后一步(差异-1)" />
      </q-fab>
    </q-page-sticky>



  </q-page>
</template>

<script>
import * as echarts from 'echarts';

import echartsUtils from "../js/echatsUtils";

import { defineComponent, onMounted, onUnmounted, onUpdated, reactive, ref, toRefs } from 'vue';

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

    let fabLabel = ref("可视化回放")
    let seamless = ref(true)
    let fabPos = ref([18, 18])
    let draggingFab = ref(false)

    let myChart = ref({});

    onMounted(() => {
      echartsUtils.init(document.getElementById('main'))

      window.onresize = () => {
        echartsUtils.resizeChart();
      }

    })

    onUpdated(() => {
      // 重新初始化Option

      echartsUtils.updateOption(stringA.value, stringB.value, drawOb.value)


    })

    onUnmounted(() => {
      echartsUtils.destory()
    })

    return {
      stringA,
      stringB,
      drawOb,
      fabLabel,
      seamless,
      fabPos,
      draggingFab,
      moveFab (ev) {
        draggingFab.value = ev.isFirst !== true && ev.isFinal !== true

        fabPos.value = [
          fabPos.value[ 0 ] - ev.delta.x,
          fabPos.value[ 1 ] - ev.delta.y
        ]
    },
    redoStep() {
      seamless.value = true
      // echartsUtils.reloadChart()
      fabLabel.value = echartsUtils.redo()
    },
    undoStep() {
      seamless.value = true
      fabLabel.value = echartsUtils.undo()
    }
    };

  }
})
</script>
