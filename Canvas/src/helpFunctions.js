/* ------------- UPDATE / REFRESH ------------- */

function changeOriginalData(index, normWeight) {
  originalData.reduce((list, obj) => {
    if(obj.idx === index) {
      obj.normWeight = normWeight
    }
    list.push(obj)
    return list
  }, [])
}

function changeFullDay (normWeight) {
  FULL_DAY.normWeight = normWeight
}

// Called when settings dynamically change the data values
function updateSettings() {
  data = addGeneralWeight(originalData)
  AVG = findAvgByKey(data, 'normWeight')
  // console.log('Avg before highlighting: ', AVG)
  stdDev = getStdDev(data)
  data.push(data[data.length - 1])
  !DISABLE_ADJUSTMENT && highlightRisk(data)
  !DISABLE_ADJUSTMENT && adjustColors(AVG)
  // Remove 3 lines here
  // data.pop()
  //   console.log('Average after highlighting: ', findAvgByKey(data, 'normWeight'))
  // data.push(data[data.length - 1])
  // To here
  update()
}

// Update interval array with colors and gradients for intervals
function update() {
  for(let i = 0; i < SIZE; i++) {
    const weight = data[i].normWeight
    const prevWeight = data[(i + SIZE - 1) % SIZE].normWeight
    const nextWeight = data[(i + 1) % SIZE].normWeight
    const arcStart = getCircleSectionCoords(i)
    const arcEnd = getCircleSectionCoords(i+1)
    const gradient = context.createLinearGradient(arcStart.x,
                                                  arcStart.y,
                                                  arcEnd.x,
                                                  arcEnd.y)
    currentColor = computeColor(weight)
    gradient.addColorStop(0, computeColor((weight + prevWeight) / 2))
    gradient.addColorStop(0.5, currentColor)
    gradient.addColorStop(1, computeColor((weight + nextWeight) / 2))
    intervals[i] = {
      color: currentColor,
      gradient: gradient
    }
}
}

/* ------------- GENERAL FUNCTIONS ------------- */

// Helper function to log actual data (logging full object normally shows wrong data so a loop is needed)
function logData(list)  {
  list.forEach(d => console.log(d))
}

function sortAscendingByKey(data, key) {
  data.sort((first, snd) => {
    return first[key] < snd[key] ? -1 : 1
  })
}

function sortDescendingByKey(data, key) {
  data.sort((first, snd) => {
    return first[key] > snd[key] ? -1 : 1
  })
}

function compareDiff(w1, w2, w3) {
  return Math.max(Math.abs(w1 - w2), Math.abs(w1 - w3), Math.abs(w2 - w3))
}

// Find the maximum based on parameter key
function findMaxByKey(list, key) {
  return list.reduce((res, obj) => {
    return obj[key] > res ? obj[key] : res
  }, 0)
}

// Find average value by key
function findAvgByKey(list, key) {
  return list.reduce((res, obj) => {
    return res + obj[key];
  }, 0) / list.length;
}

function findMinByKey(list, key) {
  return list.reduce((res, obj) => {
    return obj[key] < res ? obj[key] : res
  }, 999)
}

// Changes objects weight values to an interval between 0 to 1 depending on the max value possible
function calculateNorms(tagList) {
  return days.map((day, i) => {
    var weight = 0
    const tagObj = tagList.find(el => el && (el.tag.toLowerCase() === day.toLowerCase()))
    tagObj && (weight = tagObj.meanAnswered / tagObj.meanMax)
    return {
      idx: i,
      tag: day.toLowerCase(),
      normWeight: weight
    }
  })
}

// Returns the standard deviation of given list (expects normWeight value in list)
function getStdDev(list) {
  const sum = list.reduce((tot, cur) => {
    return tot += (((Math.floor(cur.normWeight * 100) / 100) - AVG) * ((Math.floor(cur.normWeight * 100) / 100) - AVG))
  }, 0)
  const stdDev = Math.sqrt((1 / list.length) * sum)
  return stdDev
}

function removeDuplicateElement() {
  data.pop()
}

function duplicateLastElement() {
  data.push(data[data.length - 1])
}

/* ------------- TUNING ------------- */

// Adjust the color spectra depending on average weight
function adjustColors(avg) {
  avg > 0.3 ? YELLOW = avg / 2 : YELLOW = 0.2
}

// Adds the full-day weight to time intervals according to the influence settings
function addGeneralWeight(normalizedData) {
  return normalizedData.map(obj => {
    return ((obj.idx > 0) && (obj.idx < 6)) // Controls which hours the full-day score affects
    ? {
      idx: obj.idx,
      tag: obj.tag,
      normWeight: obj.normWeight + (1 - obj.normWeight) * FULL_DAY.normWeight * FULL_DAY_INFLUENCE
    }
    : {
      idx: obj.idx,
      tag: obj.tag,
      normWeight: obj.normWeight
    }
  })
}

// Highlights areas depending on result data. (Maybe highlight HIGHLIGHTS and always lower the rest?)
function highlightRisk(data) {
  const max = findMaxByKey(data, 'normWeight')
  // Remove duplicate to avoid double highlight on night-time
  removeDuplicateElement()
  
  // Sort by weight descending, thereafter by interval idx value if weights are the same (to avoid different results in different environments/browsers) 
  data.sort(
    function(a, b) {
        if (a.normWeight === b.normWeight) {
          return a.idx - b.idx
        }
        return a.normWeight < b.normWeight ? 1 : -1
  });

  const min = findMinByKey(data, 'normWeight')

  let minFound = false
  let maxFound = false

  if(AVG >= HIGHLIGHT_UPPER_LIMIT + HIGHLIGHT_INTERVAL) { // Highest value
    
    for(let i = 0; i < HIGHLIGHTS; i++) {
      if(max - data[i].normWeight < HIGHLIGHT_THRESHOLD) {
        if(data[i].normWeight === max && !maxFound) {
          // data[i].normWeight = data[i].normWeight + ((AVG * AVG * (1 - max) * 2) / 1.5) // divide for less impact since half is lowered
          data[i].normWeight = data[i].normWeight + ((1 - data[i].normWeight) * 0.5) // <- Highlighting by constant percent may be an option
          maxFound = true
        } else {
          // data[i].normWeight = data[i].normWeight + ((AVG * AVG * (1 - max) * 2) / 2)
          data[i].normWeight = data[i].normWeight + ((1 - data[i].normWeight) * 0.3) // <- Highlighting by constant percent may be an option
        }
      }
    }
    for(let i = 0; i < (SIZE - HIGHLIGHTS); i++) {
      if(data[data.length - 1 - i].normWeight === min && !minFound) { // Lower the lowest more for visual impact and hope
        data[data.length - 1 - i].normWeight = data[data.length - 1 - i].normWeight - (data[data.length - 1 - i].normWeight * 0.3 * 1.5 * data[data.length - 1 - i].normWeight )
        // data[data.length - 1 - i].normWeight = data[data.length - 1 - i].normWeight - (AVG * AVG * ((1 - max) + 0.2)  *  data[data.length - 1 - i].normWeight * 2)
        // data[data.length - 1 - i].normWeight = data[data.length - 1 - i].normWeight - ((AVG * AVG * (1 - max) * 2) / 1.5)
        minFound = true
    } else {
      // data[data.length - 1 - i].normWeight = data[data.length - 1 - i].normWeight - ((AVG * AVG * (1 - max) * 2) / 2)
      data[data.length - 1 - i].normWeight = data[data.length - 1 - i].normWeight - (data[data.length - 1 - i].normWeight * 0.15 * 1.5 * data[data.length - 1 - i].normWeight)
      // data[data.length - 1 - i].normWeight = data[data.length - 1 - i].normWeight - (AVG * AVG * ((1 - max) + 0.2)  *  data[data.length - 1 - i].normWeight * 1.5)
    }
    }
  }
   else if(stdDev < STD_VAL_THRESHOLD && AVG > HIGHLIGHT_LOWER_LIMIT) { // Lowest highlight

    if(AVG < HIGHLIGHT_UPPER_LIMIT) {
      for(let i = 0; i < HIGHLIGHTS; i++) { // Maybe highligh every other one when they're the same? To avoid long line of red
        if(max - data[i].normWeight < HIGHLIGHT_THRESHOLD) { // Highlight threshold controls max deviation from max interval value for highlight
          if(data[i].normWeight === max && !maxFound) { // Extra highlight on max for correct visual focus
            data[i].normWeight = data[i].normWeight + ((1 - data[i].normWeight) * 0.5)
            maxFound = true
            // data[i].normWeight = data[i].normWeight + (AVG * AVG * (1 - max) * 2.5)
          } else {
            data[i].normWeight = data[i].normWeight + ((1 - data[i].normWeight) * 0.3) // <- Highlighting by constant percent may be an option
          }
        }
      }
    } else if(AVG >= HIGHLIGHT_UPPER_LIMIT && AVG < (HIGHLIGHT_UPPER_LIMIT + HIGHLIGHT_INTERVAL)) { // Middle highlight
      for(let i = 0; i < HIGHLIGHTS / 2; i++) { // Otherwise highlight & lower the same value
          if(max - data[i].normWeight < HIGHLIGHT_THRESHOLD) {
            if(data[i].normWeight === max && !maxFound) {
              // data[i].normWeight = data[i].normWeight + ((AVG * AVG * (1 - max) * 2) / 1.5) // divide for less impact since half is lowered
              data[i].normWeight = data[i].normWeight + ((1 - data[i].normWeight) * 0.5) // <- Highlighting by constant percent may be an option
              maxFound = true
            } else {
              // data[i].normWeight = data[i].normWeight + ((AVG * AVG * (1 - max) * 2) / 2)
              data[i].normWeight = data[i].normWeight + ((1 - data[i].normWeight) * 0.3) // <- Highlighting by constant percent may be an option
            }
          }
          if(data[data.length - 1 - i].normWeight - min < HIGHLIGHT_THRESHOLD) {
            if(data[data.length - 1 - i].normWeight === min && !minFound) {
              // data[data.length - 1 - i].normWeight = data[data.length - 1 - i].normWeight - ((1 - data[data.length - 1 - i].normWeight) * 0.5) * ((AVG - HIGHLIGHT_UPPER_LIMIT) / HIGHLIGHT_INTERVAL) // Got something here!
              data[data.length - 1 - i].normWeight = data[data.length - 1 - i].normWeight - (data[data.length - 1 - i].normWeight * 0.6) * ((AVG - HIGHLIGHT_UPPER_LIMIT) / HIGHLIGHT_INTERVAL) // Got something here!
              minFound = true
            } else {
              // data[data.length - 1 - i].normWeight = data[data.length - 1 - i].normWeight - ((1 - data[data.length - 1 - i].normWeight) * 0.3) * ((AVG - HIGHLIGHT_UPPER_LIMIT) / HIGHLIGHT_INTERVAL) // Got something here!
              data[data.length - 1 - i].normWeight = data[data.length - 1 - i].normWeight - (data[data.length - 1 - i].normWeight * 0.4) * ((AVG - HIGHLIGHT_UPPER_LIMIT) / HIGHLIGHT_INTERVAL)
              //data[data.length - 1 - i].normWeight = data[data.length - 1 - i].normWeight - ((AVG * AVG * (1 - max) * 2) / 2)
            }
          }
      }
    } else { // Everything should be in or real close to red-zone here
      // Should these be data.size - HIGHLIGHTS? That would make sure the
      // same amount of risky areas are shown in both highlight situations
      // (probably not, since a higher general value should not give the
      // same output as lower general value)
      // for(let i = 0; i < HIGHLIGHTS; i++) {
      //   if(data[data.length - 1 - i].normWeight - min < HIGHLIGHT_THRESHOLD) {
      //     if(data[data.length - 1 - i].normWeight === min) { // Lower the lowers more for visual impact and hope
      //       data[data.length - 1 - i].normWeight = data[data.length - 1 - i].normWeight - (AVG * AVG * ((1 - max) + 0.2)  *  data[data.length - 1 - i].normWeight * 1.5)
      //     } else {
      //       data[data.length - 1 - i].normWeight = data[data.length - 1 - i].normWeight - (AVG * AVG * ((1 - max) + 0.2)  *  data[data.length - 1 - i].normWeight)
      //     }
      //   }
      // }
    }
  }
  // Sort back to ascending
  sortAscendingByKey(data, 'idx')
  // Add duplicate again for rendering full night
  duplicateLastElement()
}

/* ------------- CANVAS ------------- */

// Get coordinates for mouse position
function getMousePos(event) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }
}

// Calculates circle normal at position [x, y] on circle (unit-length)
function calculateUnitNormal(x, y) {
  const normalX = x - X
  const normalY = y - Y
  const length = Math.sqrt((normalX * normalX) + (normalY * normalY))
  unitX = normalX / length
  unitY = normalY / length
  return {x : unitX, y : unitY}
}

function areClockwise(v1, v2) {
  vector1 = {
    x: v1.x - X,
    y: v1.y - Y
  }
  vector2 = {
    x: v2.x - X,
    y: v2.y - Y
  }
  return -vector1.x*vector2.y + vector1.y*vector2.x > 0;
}

// Get coordinates at specific time index on circle (at beginning time-interval)
function getCircleSectionCoords(index) {
  return getCoords(RADIUS, index)
}

// Get arc angle at index (Works for values inbetween indexes)
function getArcAngle(index) {
  return (1.1 + ((1.8 * index) / SIZE) + ROTATION)*Math.PI
}

// Get coords for start of index with specified radius
function getCoords(radius, index) {
  const x = X + radius * Math.sin((1.1 + ((1.8 * (-index)) / SIZE) - ROTATION)*Math.PI + Math.PI/3.34)
  const y = Y + RADIUS * Math.cos((1.1 + ((1.8 * (-index)) / SIZE) - ROTATION)*Math.PI + Math.PI/3.34)
  return {x, y}
}

// Returns point of intersection between line and rectangle. Returns null if no intersection was found
function getRectIntersection(rect, line) {
  
  var intersection = getLineIntersection(line.x1, line.y1, line.x2, line.y2, rect.x, rect.y, rect.x + rect.w, rect.y)
  if(intersection === null) {
    intersection = getLineIntersection(line.x1, line.y1, line.x2, line.y2, rect.x, rect.y, rect.x, rect.y - rect.h)
    if(intersection === null) {
      intersection = getLineIntersection(line.x1, line.y1, line.x2, line.y2, rect.x, rect.y - rect.h, rect.x + rect.w, rect.y - rect.h)
      if(intersection === null ) {
        intersection = getLineIntersection(line.x1, line.y1, line.x2, line.y2, rect.x + rect.w, rect.y, rect.x + rect.w, rect.y - rect.h)
      }
    }
  }
  
  if(intersection === null) {
    return null
  }
  return {
    x: intersection.x,
    y: intersection.y
  }
}

// Returns intersection point between two lines. Returns null if no intersections are found
function getLineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
  const t = ((x1-x3)*(y3-y4) - (y1-y3)*(x3-x4)) / ((x1-x2)*(y3-y4) - (y1-y2)*(x3-x4));
  const u = -((x1-x2)*(y1-y3) - (y1-y2)*(x1-x3)) / ((x1-x2)*(y3-y4) - (y1-y2)*(x3-x4)); // How to use u?
  if(t && u && t <= 1.0 && t >= 0.0 && u >= 0 && u <= 1) {
    return {
      x: x1 + (t*(x2 - x1)),
      y: y1 + (t*(y2 - y1))
    }
  }
  return null;
}

function isPointInBubble(point, bubble) {
  if(point.x >= bubble.x && point.x <= bubble.x + bubble.w && point.y <= bubble.y && point.y >= bubble.y - bubble.h) {
    return true
  }
  return false
}

// Compute color for a certain interval weight according to the color value constants
function computeColor(weight) {
  var r = 0
  var g = 0
  var b = 0
  if(weight > YELLOW && weight < RED) {
      r = 255
      g = 255 - Math.floor((weight - YELLOW) * (1/(RED - YELLOW)) * 255) // Green value reduces between yellow -> red
      b = 0
  } else if (weight > GREEN && weight < YELLOW) {
      r = 0 + Math.floor((weight * (1 / YELLOW)) * 255)   // Red value increases between green -> yellow
      g = 255
      b = 0
  } else {
      if(weight >= RED) {
          return "#ff0000"
      }
      if(weight === YELLOW) {
          return "#ffff00"
      }
      if(weight === GREEN) {
          return "#00ff00"
      }
  }
  r = r.toString(16).length == 1 ? "0" + r.toString(16) : r.toString(16)
  g = g.toString(16).length == 1 ? "0" + g.toString(16) : g.toString(16)
  b = b.toString(16).length == 1 ? "0" + b.toString(16) : b.toString(16)
  return '#' + r + g + b
}

function hexToRgb(hexStr) {
  const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexStr)
  return {
    r: parseInt(rgb[1], 16),
    g: parseInt(rgb[2], 16),
    b: parseInt(rgb[3], 16)
  }
}

function getFillstyleString(r, g, b, a) {
  return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')'
}