export default {
  textADOM: null,
  textBDOM: null,
  create(textADOM, textBDOM) {
    this.textADOM = textADOM
    this.textBDOM = textBDOM
  },
  whenChange(strA, strB) {
    let vss = this.generatePath(strA, strB)
    let so = this.solution(vss.vs, strA.length, strB.length, vss.d)
    let res = this.generateDiffView(so.snakes, strA, strB)

    this.textADOM.innerHTML = res.strA
    this.textBDOM.innerHTML = res.strB

    return {
      d: vss.d,
      allPaths: vss.pathsAll,
      rightPath: so.path
    }
  },
  generatePath(strA, strB) {
    let n = strA.length
    let m = strB.length

    let v = {'1': 0}

    let vs = {
      '0': {'1': 0}
    }

    // let pathsAll = [
    //   {
    //     d: 3,
    //     paths: [
    //       {k: 0, path: [[2, 3], [3, 3], [4, 4]]},
    //       {},
    //       {},
    //       {}
    //     ]
    //   }
    // ]
    let pathsAll = []

    let d

    loop:
    for(d = 0; d <= n + m; d++) {
      // 仅作绘图记录
      let dPaths = {d: d, paths: []}

      let tmp = {}
      for(let k = -d; k <= d; k += 2) {
        // 仅作绘图记录
        let kPath = {k: k, path: []}

        let down = ((k == -d) || ((k != d) && v[k + 1] > v[k - 1]))
        let kPrev = down ? k + 1 : k - 1
        let xStart = v[kPrev]
        let yStart = xStart - kPrev
        // 仅作绘图记录
        kPath.path.push([xStart, yStart])

        let xMid = down ? xStart : xStart + 1
        let yMid = xMid - k
        let xEnd = xMid
        let yEnd = yMid
        // 仅作绘图记录
        kPath.path.push([xEnd, yEnd])

        while(xEnd < n && yEnd < m && strA[xEnd] === strB[yEnd]) {
          xEnd++
          yEnd++
          // 仅作绘图记录
          kPath.path.push([xEnd, yEnd])
        }
        v[k] = xEnd
        tmp[k] = xEnd
        // 仅作绘图记录
        dPaths.paths.push(kPath)

        if (xEnd == n && yEnd == m) {
          // 仅作绘图记录
          pathsAll.push(dPaths)

          vs[d] = tmp
          // let snakes = solution(vs, n, m, d)
          // printRes(snakes, stra, strb)
          break loop
        }
      }
      // 仅作绘图记录
      pathsAll.push(dPaths)

      vs[d] = tmp
    }

    return {pathsAll, vs, d}
  },

  solution(vs, n, m, d) {
    let snakes = []
    let path = []
    let p = {x: n, y: m}
    if(d == 0) {
      for(let i = 0; i <= m; i++) {
        path.push([i, i])
      }
    }
    for(; d > 0; d--) {
      let v = vs[d]
      let vPrev = vs[d-1]
      let k = p.x - p.y
      let xEnd = v[k]
      let yEnd = xEnd - k
      let down = ((k == -d) || ((k != d) && (vPrev[k + 1] > vPrev[k - 1])))
      let kPrev = down ? k + 1 : k - 1
      let xStart = vPrev[kPrev]
      let yStart = xStart - kPrev
      let xMid = down ? xStart : xStart + 1
      let yMid = xMid - k
      snakes.unshift([xStart, xMid, xEnd])
      // 仅作绘图记录
      path.unshift([xEnd, yEnd])
      for(let i = 1; i <= xEnd - xMid; i++) {
        path.unshift([xEnd - i, xEnd - i - k])
      }
      if(d == 1) {
        path.unshift([xStart, yStart])
        for(let i = 1; i <= xStart; i++) {
          path.unshift([xStart - i, yStart - i])
        }
      }
      p.x = xStart
      p.y = yStart
    }

    return {
      snakes: snakes,
      path: path
    }
  },

  generateDiffView(snakes, strA, strB) {
    let resStrA = ''
    let resStrB = ''
    let yOffset = 0

    if(snakes.length == 0) {
      resStrA = strA
      resStrB = strB
    } else {
      snakes.forEach((snake, index) => {
        let s = snake[0]
        let m = snake[1]
        let e = snake[2]
        if (index === 0 && s !== 0) {
          for (let j = 0; j < s; j++) {
            // 相同
            resStrA += strA[j]
            resStrB += strA[j]
            yOffset++
          }
        }

        if (m - s == 1) {
          // 删除,strA有strB没有
          resStrA += "<span class=\"tdel\">"+strA[s]+"</span>"
        } else {
          // 增加
          resStrB += "<span class=\"tadd\">"+strB[yOffset]+"</span>"
          yOffset++
        }

        for (let i = 0; i < e - m; i++) {
          resStrA += strA[m+i]
          resStrB += strA[m+i]
          yOffset++
        }

      })
    }
    resStrA = resStrA.replace(/\n/g, "&#10;")
    resStrB = resStrB.replace(/\n/g, "&#10;")
    resStrA = resStrA.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;")
    resStrB = resStrB.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;")
    return {
      strA: resStrA,
      strB: resStrB
    }
  }
}
