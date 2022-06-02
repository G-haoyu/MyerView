<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <strong class="text-h2">Myers <span class="text-deep-orange">diff</span> algorithm</strong>
    </div>

    <div class="row justify-center">
      <h5>
        Myers差分算法可视化
        <q-badge align="top" color="primary">v1.0</q-badge>
      </h5>
    </div>

    <div class="row justify-center">
        <div class="q-pa-md col-12 col-md-5">
        <q-input
          ref="textAInput"
          v-model="textA"
          filled
          autogrow
          type="textarea"
          label-slot
          counter
          debounce="1000"
          maxlength="32"
          :rules="[val => !!val.length || '不能为空']"
          >
            <template v-slot:label>
              请输入修改前内容
              <em class="q-px-sm bg-deep-orange text-white rounded-borders">字段A(strA)</em>
            </template>
          </q-input>
      </div>
      <div class="q-pa-md col-12 col-md-5">
        <q-input
          ref="textBInput"
          v-model="textB"
          filled
          autogrow
          type="textarea"
          label-slot
          counter
          debounce="1000"
          maxlength="32"
          :rules="[val => !!val.length || '不能为空']"
        >
          <template v-slot:label>
            请输入修改后内容
            <em class="q-px-sm bg-deep-orange text-white rounded-borders">字段B(strB)</em>
          </template>
        </q-input>
      </div>
    </div>

    <q-separator />

    <div class="row justify-center">
      <div class="q-pa-md col-12 col-md-5">
        <q-card>
          <q-card-section>
            <a class="q-px-sm bg-deep-orange text-white rounded-borders">字段A(strA)</a>
          </q-card-section>

          <q-separator inset />

          <q-card-section id="textACard" class="tfix">
            <!-- show strA diff result -->
          </q-card-section>
        </q-card>
      </div>

      <div class="q-pa-md col-12 col-md-5">
        <q-card>
          <q-card-section>
            <a class="q-px-sm bg-deep-orange text-white rounded-borders">字段B(strB)</a>
          </q-card-section>

          <q-separator inset />

          <q-card-section id="textBCard" class="tfix">
            <!-- show strB diff result -->
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-separator />

    <div class="row justify-center">
      <div class="q-pa-md col-12 col-md-12">
        <MyersChart :stringA="textA" :stringB="textB" :drawOb="drawObject"/>
      </div>
    </div>
  </q-page>
</template>

<script>
import myersUtils from '../js/myersUtils'

import { defineComponent, onMounted, ref } from 'vue';
import MyersChart from 'src/components/MyersChart.vue';

export default defineComponent({
    name: "PageIndex",
    components: [
      MyersChart
    ],
    watch: {
        textA(newValue, oldValue) {
            if (this.textA.length != 0 && this.textB.length != 0)
                this.drawObject = myersUtils.whenChange(this.textA, this.textB)
        },
        textB() {
            if (this.textA.length != 0 && this.textB.length != 0)
                this.drawObject = myersUtils.whenChange(this.textA, this.textB)
        }
    },
    setup() {
        let textA = ref("ABCABBA")
        let textB = ref("CBABAC")
        let drawObject = ref({})
        onMounted(() => {
            let textADOM = document.getElementById("textACard")
            let textBDOM = document.getElementById("textBCard")
            myersUtils.create(textADOM, textBDOM)
            drawObject.value = myersUtils.whenChange(textA.value, textB.value)
        });
        return {
            textA,
            textB,
            drawObject
        }
    },
    components: { MyersChart }
})
</script>
