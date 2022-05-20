<template>
  <q-page class="row justify-center">

    <div class="col-12 col-md-11" id="main"></div>

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
        <q-fab-action padding="3px" color="warning" icon="keyboard_double_arrow_right" @click="redoAuto" label="自动前进(差异++)" />
        <q-fab-action padding="3px" color="info" icon="keyboard_double_arrow_left" @click="undoAuto" label="自动后退(差异--)" />
        <q-fab-action padding="3px" color="secondary" :icon="gitHubIcon" @click="toStar" label="give me a star ->"/>
      </q-fab>
    </q-page-sticky>



  </q-page>
</template>

<script>
import echartsUtils from "../js/echatsUtils"
import { evaGithub } from '@quasar/extras/eva-icons'

import { defineComponent, onMounted, onUnmounted, onUpdated, ref, toRefs } from 'vue';

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
    let gitHubIcon = ref(evaGithub)

    let {stringA, stringB, drawOb} = toRefs(props)

    let fabLabel = ref("可视化回放")
    let seamless = ref(true)
    let fabPos = ref([18, 18])
    let draggingFab = ref(false)
    let redoAutoFlag = ref({})
    let undoAutoFlag = ref({})

    let myChart = ref({});

    onMounted(() => {
      echartsUtils.init(document.getElementById('main'))

      window.onresize = () => {
        echartsUtils.resizeChart();
      }

    })

    onUpdated(() => {
      // 重新初始化Option
      clearInterval(redoAutoFlag.value)
      clearInterval(undoAutoFlag.value)
      echartsUtils.updateOption(stringA.value, stringB.value, drawOb.value)


    })

    onUnmounted(() => {
      echartsUtils.destory()
      clearInterval(redoAutoFlag.value)
      clearInterval(undoAutoFlag.value)
    })

    return {
      gitHubIcon,
      stringA,
      stringB,
      drawOb,
      fabLabel,
      seamless,
      fabPos,
      draggingFab,
      redoAutoFlag,
      undoAutoFlag,
      moveFab (ev) {
        draggingFab.value = ev.isFirst !== true && ev.isFinal !== true

        fabPos.value = [
          fabPos.value[ 0 ] - ev.delta.x,
          fabPos.value[ 1 ] - ev.delta.y
        ]
    },
    redoStep() {
      clearInterval(redoAutoFlag.value)
      clearInterval(undoAutoFlag.value)
      seamless.value = true
      fabLabel.value = echartsUtils.redo()
    },
    undoStep() {
      clearInterval(redoAutoFlag.value)
      clearInterval(undoAutoFlag.value)
      seamless.value = true
      fabLabel.value = echartsUtils.undo()
    },
    redoAuto() {
      clearInterval(redoAutoFlag.value)
      clearInterval(undoAutoFlag.value)
      seamless.value = true
      redoAutoFlag.value = setInterval(() => {
        fabLabel.value = echartsUtils.redo()
        if(fabLabel.value === "可视化回放")
          clearInterval(redoAutoFlag.value)
      }, 500)
    },
    undoAuto() {
      clearInterval(redoAutoFlag.value)
      clearInterval(undoAutoFlag.value)
      seamless.value = true
      undoAutoFlag.value = setInterval(() => {
        fabLabel.value = echartsUtils.undo()
        if(fabLabel.value === "可视化回放")
          clearInterval(undoAutoFlag.value)
      }, 500)
    },
    toStar() {
      seamless.value = true
      window.open("https://github.com/G-haoyu/MyerView")
    }
    };

  }
})
</script>
