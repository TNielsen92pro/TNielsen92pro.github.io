/*

  ---------- Main file ---------- 

  Questionnaire results "mean" and "tagInfo" are imported from files named "meanOutput.js" and "tagInfo.js". See index.html
  
  Changes in graphical layout such as rotation needs to call the update() function for the visualization to adapt

  */

/* ------------- INITIALIZATION OF DATA ------------- */

// Define the intervals in their corresponding index to visualize. The last element should be the full day.
// Second-to-last is counted twice since night covers two intervals.

let data = calculateNorms(USE_TEST_DATA ? testData : mean)

sortAscendingByKey(data, 'idx')

// Extract the full-day value into global variable FULL_DAY
var FULL_DAY = data[data.length - 1]

// Size of data. Will be the same since full-day is removed and night-time is duplicated
const SIZE = data.length;

// Remove full-day value from main result list
data.pop()

let originalData = data

// Include the full-day score in daytime-intervals
data = addGeneralWeight(data)

// Calculate average risk
var AVG = findAvgByKey(data, 'normWeight')
console.log('Average: ', AVG)

// Extract standard deviation
var stdDev = getStdDev(data);

// Duplicate night-time value spanning 2 time intervals.
// Should be the last operation before tuning & drawing, to avoid faulty computations
data.push(data[data.length - 1])

logData(data)


// Exaggerate representation of risky areas for low-risk average score.
// This is done to endorse habit management for patients of lower risk.
// E.g. - the result should not be fully green unless the patient is close to risk-free
!DISABLE_ADJUSTMENT && highlightRisk(data)
!DISABLE_ADJUSTMENT && adjustColors(AVG)

console.log('Final vis data:')
logData(data)
console.log('fullDay: ', FULL_DAY)
console.log('tagInfo:', tagInfo)
console.log('Std dev: ', stdDev)
// logData(tagInfo)

/* ------------- DRAW ------------- */

document.addEventListener("DOMContentLoaded", function() {

  /* ------------- INITIALIZE DRAW VARIABLES ------------- */
  table = document.getElementById("myTable")
  table.style.display = "none"
  
  // SHOW_TABLE && createAnswerTable()
  canvas = document.getElementById("html-canvas")
  // SHOW_TABLE && canvas.setAttribute("id", "html-canvas-table")
  if(SHOW_TABLE) {
    createAnswerTable()
    canvas.setAttribute("id", "html-canvas-table")
    table.style.display = "unset"
  }
  SHOW_SLIDERS && createSliders()
  canvas.width = canvas.clientWidth
  canvas.height = canvas.clientHeight
  X = canvas.width / 2
  Y = canvas.height / 2
  context = canvas.getContext("2d")
  context.imageSmoothingEnabled = true

  // Record mouse coordinates
  canvas.addEventListener('mousemove', function(evt) {
    mousePos = getMousePos(evt);
    const centerDist = Math.round(Math.sqrt(Math.pow(mousePos.x - X, 2) + Math.pow(mousePos.y - Y, 2)));
    var isHovering = false
    if((centerDist <= RADIUS + (LINEWIDTH / 2) && centerDist >= RADIUS - (LINEWIDTH / 2))) {
      for(let i = 0; i < SIZE; i++) {
        const intervalStart = getCoords(centerDist, i)
        const intervalEnd = getCoords(centerDist, i+1)
        if(!areClockwise(intervalStart, mousePos) && areClockwise(intervalEnd, mousePos)) {
          isHovering = true
          hoverIndex = i
          break;
        }
      }
    }
    if(!isHovering) {
      hoverIndex = -1
    }
  }, false);

  canvas.addEventListener('mousedown', function(evt) {
    var x = evt.x;
    var y = evt.y;
    mouseClicked = true

    /*if(hoverIndex === -1 || (lasthoverIndex === hoverIndex && showTooltip === true)) {
      showTooltip = false
    } else {
      resetTooltips()
      showTooltip = true
      animatingLine = true
      animatingBubble = true
    }
    lasthoverIndex = hoverIndex
    */
  }, false)

  /* ------------- DRAW LOOP ------------- */

  // Frame update variables
  const warmupFrames = 5
  const blurIncrement = 1 // Increments per second
  const maxBlur = 1.5
  const minBlur = 0.5
  var lastFrameHoverIndex = hoverIndex
  startBlur = true
  var blurSize = 0
  var blurDirection = 1
  lastCalledTime = performance.now()
  delta = 0
  fps = 60
  var currentFrame = 0
  
  // The start animation
  function drawStartAnimation() {
    drawArc(0, -1, true)
  }

  // Draw called on each frame update
  // Divide by fps to get equal speed regardless of framerate
  function draw() {
    // Adapt to window size changes
    if(canvas.clientHeight !== canvas.height) {
      canvas.height = canvas.clientHeight
      Y = canvas.height / 2
      update()
    }
    if(canvas.clientWidth !== canvas.width) {
      canvas.width = canvas.clientWidth
      X = canvas.width / 2
      update()
    }

    // Clear screen to render new frame
    context.clearRect(0, 0, canvas.width, canvas.height)

    // Warmup and animation
    if(currentFrame < warmupFrames) {
        currentFrame++ // Warmup frames to initiate fps value
    } else {
        // Blur is used for glow effect
        if(!DISABLE_BLUR) {
          blurSize += ((blurIncrement * blurDirection) / fps)
          if(blurSize > maxBlur) {
              blurSize = maxBlur
              blurDirection = -blurDirection
          } else if(blurSize < minBlur && !startBlur) {
              blurSize = minBlur
              blurDirection = -blurDirection
          } else if(blurSize > minBlur && startBlur) {
              startBlur = false
          }
        }
        if(rotationSpeed > 0) {
          ROTATION += rotationSpeed / fps
          update()
        }
    }

    drawBackground()
    drawSun()
    drawMoon()

    // Draw the blur effects
    // TODO: remove parameters as in arc
    for(var i = 0; i < SIZE; i++) {
      !DISABLE_BLUR && drawBlur(i, data[(i + SIZE - 1) % SIZE].normWeight, data[i].normWeight, data[(i + 1) % SIZE].normWeight, blurSize)
    }

    // Draw arcs. Overwrites blur effect
    for(var i = 0; i < SIZE; i++) {
      drawArc(i, hoverIndex)
    }

    // Draw timestamps
    drawTime();

    if(showTooltip) {
      drawTooltip(clickIndex)
    }

    if(mouseClicked) {
      clickIndex = hoverIndex
      if(clickIndex === -1 || (lastClickIndex === clickIndex && showTooltip === true)) {
        showTooltip = false
      } else {
        resetTooltips()
        showTooltip = true
        animatingLine = true
        animatingBubble = true
      }
      lastClickIndex = clickIndex
      mouseClicked = false
    }

    // Reset values so nothing gets passed on to next frame by mistake
    context.strokeStyle = backgroundColor // backgroundColor should be the same as in css background
    context.lineWidth = 1

    // Calculate performance
    delta = (performance.now() - lastCalledTime)/1000
    lastCalledTime = performance.now()
    fps = 1/delta;

    requestAnimationFrame(draw)
  }
  update()
  drawStartAnimation()
  
  function checkInit() {
    if (!initializing && !drawStarted) {
        draw()
        drawStarted = true
    } else {
      setTimeout(checkInit, 10);
    }
  }

  checkInit();

}, false)