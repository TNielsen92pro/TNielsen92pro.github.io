

/* ------------- CANVAS ------------- */

// Draw a small incrementation of blur according to BLURDETAIL value 
function drawBlurIncrement(interval, index, blurSize, weight) {
  context.beginPath()
  context.arc(X, Y, RADIUS, getArcAngle(interval + (index/BLURDETAIL)), getArcAngle(interval + (index + 1)/BLURDETAIL))
  currentColor = computeColor(weight)
  context.lineWidth = LINEWIDTH
  const rgb = hexToRgb(currentColor)
  const blur = (rgb.r / 15) - (rgb.g / 20)
  if(blur > 0) {
      context.shadowBlur = ((rgb.r / 15) - (rgb.g / 20)) * blurSize
      context.shadowColor = currentColor
  } else {
      context.shadowBlur = 0
  }
  context.stroke()
  context.shadowBlur = 0
}

// Draw blur for a time interval and color a gradient depending on weight values
function drawBlur(index, prevWeight, weight, nextWeight, blurSize) {
  for(let i = 0; i < BLURDETAIL; i++) {
    thisWeight = 0
    i < (BLURDETAIL / 2)
    ? thisWeight = ((weight + prevWeight) / 2) + ((((weight) - ((weight + prevWeight) / 2)) / (BLURDETAIL / 2)) * i)
    : thisWeight = (weight) + (((((weight + nextWeight) / 2) - (weight)) / (BLURDETAIL / 2)) * (i - BLURDETAIL / 2))
    
    drawBlurIncrement(index, i, blurSize, thisWeight)
  }
}

function drawAnimatedArc(curr, fin) {
  
  context.beginPath()
  context.arc(X, Y, RADIUS, getArcAngle(curr) - 0.001, getArcAngle(curr + (SIZE / (fps * startAnimationTime))) + 0.001)
  context.stroke()

  let lastFPS = fps - 0.1
  delta = (performance.now() - lastCalledTime)/1000
  lastCalledTime = performance.now()
  fps = 1/delta;
  lastFPS += 0.1
  if(curr + (SIZE / (lastFPS * startAnimationTime)) < fin) {
    requestAnimationFrame(function() {
      drawAnimatedArc(curr + (SIZE / (lastFPS * startAnimationTime)), fin)
    })
  } else if (fin < SIZE) {
    drawArc(fin, -1, true)
  } else {
    initializing = false
    return
  }
}

// Draw the arc of a time interval and color it by weight gradient
function drawArc(index, hoverIndex, animate = false) {
  if(index >= SIZE) {
    return
  }
  context.strokeStyle = intervals[index].gradient
  context.lineWidth = LINEWIDTH

  if(animate) {
    drawAnimatedArc(index, index + 1)
  } else {
    if(hoverIndex === index) { // Highlight arc if hovering
      context.strokeStyle = 'rgba(0, 0, 0)'
      context.lineWidth = LINEWIDTH + 2
      context.beginPath()
      context.arc(X, Y, RADIUS, getArcAngle(index) + 0.001, getArcAngle(index + 1) - 0.001)
      context.stroke()
      context.strokeStyle = intervals[index].gradient
      context.lineWidth = LINEWIDTH
    }
    context.beginPath()
    context.arc(X, Y, RADIUS, getArcAngle(index) - 0.001, getArcAngle(index + 1) + 0.001)
    context.stroke()
  }
}

function drawMoon() {
  // Code for placing moon within the circle
  // context.drawImage(document.getElementById("moonImg"), X - 100, Y - 125 + (RADIUS / 2), 200, 250);
  context.drawImage(document.getElementById("moonImg"), canvas.width - 250, canvas.height - 300, 200, 250);
}

function drawSun() {
  // Code for placing sun within the circle
  // context.drawImage(document.getElementById("sunImg"), X - 100, Y - 100 - (RADIUS / 2), 200, 200);
  context.drawImage(document.getElementById("sunImg"), canvas.width - 250, 50, 200, 200);
}

function drawArrow() {
  context.strokeStyle = 'rgba(0, 0, 0)'
  context.lineWidth = 7

  context.beginPath()
  context.arc(X, Y, RADIUS - (LINEWIDTH * 1.2), getArcAngle(0) - 0.001, getArcAngle(0.5) + 0.001)
  context.stroke()


  context.save();
  context.fillStyle = context.strokeStyle
  const triangleCoords = {
    A: {
      x: getCircleSectionCoords(0.5).x + 20,
      y: getCircleSectionCoords(0.5).y + 20
    },
    B: {
      x: getCircleSectionCoords(0.5).x + 45,
      y: getCircleSectionCoords(0.5).y + 35
    },
    C: {
      x: getCircleSectionCoords(0.5).x + 45,
      y: getCircleSectionCoords(0.5).y + 5
    }
  }

  const triangleCenterCoords = {
    x: (triangleCoords.A.x + triangleCoords.B.x + triangleCoords.C.x) / 3,
    y: (triangleCoords.A.y + triangleCoords.B.y + triangleCoords.C.y) / 3,
  }

  // Calculations made by hand because of stress
  context.translate(triangleCenterCoords.x - 3, triangleCenterCoords.y - 3)
  context.rotate(130 * Math.PI / 180);
  context.beginPath()
  context.moveTo(-50 / 3, 0)
  context.lineTo(25 / 3, 15)
  context.lineTo(25 / 3, -15)
  context.fill()
  context.restore();

}

function drawBackground() {
  context.beginPath()

  const testGradient = context.createLinearGradient(
    0,
    0,
    0,
    canvas.height
  )

  testGradient.addColorStop(0.2, '#FFE38D10')
  testGradient.addColorStop(0.5, '#FFE38D')
  testGradient.addColorStop(1, '#127898')



  context.fillStyle = testGradient

  const backgroundRadius = RADIUS * 2 - (LINEWIDTH / 2)
  const startAngle = 0
  const endAngle = Math.PI * 2
  context.arc(X, Y, backgroundRadius, startAngle, endAngle, false)
  context.fillRect(0, 0, canvas.width, canvas.height)
}

function getAngle(norm1, norm2) {
  const dot = (norm1.x * norm2.x) + (norm1.y * norm2.y)
  const angle = Math.acos(dot)
  return (Math.PI / 2) - angle
}

// Put text by the end of the time interval of a certain index. Used for drawing time stamps
function putText(text, index) {
  textSize = 20
  const circleCoords = getCircleSectionCoords(index + 1)
  const unitNorm = calculateUnitNormal(circleCoords.x, circleCoords.y)
  context.fillStyle = getFillstyleString(stampColor[0], stampColor[1], stampColor[2], alpha)
  // context.fillStyle = stampColor
  context.font = `${textSize}` + 'px OpenSans'
  const verticalUnit = {x: 1, y: 0}
  let turnAngle = getAngle(unitNorm, verticalUnit)

  if(index > 3) turnAngle = -turnAngle

  const xTranslate = circleCoords.x - (context.measureText(text).width / 2) + (unitNorm.x * LINEWIDTH * 2)
  const yTranslate = circleCoords.y + (textSize / 2) + (unitNorm.y * LINEWIDTH * 2)


  context.save();
  context.translate(circleCoords.x + (unitNorm.x * 40), circleCoords.y + (unitNorm.y * 40))
  context.rotate(turnAngle);
  context.fillText(text, - (context.measureText(text).width / 2), (textSize / 2) - 3);
  context.restore();

  // Deprecated numbers positions inside circle
  // context.fillText(text, circleCoords.x - (context.measureText(text).width / 2) - (unitNorm.x * LINEWIDTH * 2), circleCoords.y + (textSize / 2) - (unitNorm.y * LINEWIDTH * 2))
}

// Draw all time stamps
function drawTime() {
  var text = 'God morgon!'
  // var text = '06.00'
  var textSize = 50
  context.fillStyle = getFillstyleString(stampColor[0], stampColor[1], stampColor[2], alpha)
  context.font = `${textSize}` + 'px OpenSans'
  context.fillText(text, X + RADIUS * Math.sin(-Math.PI/2 + ROTATION * Math.PI) - context.measureText(text).width / 2, Y + RADIUS * Math.cos(Math.PI/2 + ROTATION * Math.PI) + textSize / 2)
  // Swedish
  putText('Morgon', -0.5)

  putText('Förmiddag', 0.5)
  putText('Tidig eftermiddag', 1.5)
  putText('Sen eftermiddag', 2.5)
  putText('Tidig kväll', 3.5)
  putText('Sen kväll', 4.5)
  putText('Natt', 5.5)
  putText('Natt', 6.5)
  
  /* // English
  putText('Morning', -0.5)
  putText('Early lunch', 0.5)
  putText('Early Afternoon', 1.5)
  putText('Late Afternoon', 2.5)
  putText('Early evening', 3.5)
  putText('Late evening', 4.5)
  putText('Night', 5.5)
  putText('Night', 6.5)
  */

  /*
  var time = 6
  for(var i = 0; i < SIZE; i++) {
    time = (time + Math.floor(24/SIZE)) % 24
    if(time === 6) continue // 06.00 is rendered above
    if(time < 10) {
        putText('0' + time + '.00', i)

    } else {
        putText(time + '.00', i)
    }
  }
  */
  if(alpha < 1) alpha += 0.8 / fps
}

function drawAnimatedLine(fromX, fromY, toX, toY, time, totX = null, totY = null) {
  let xDirection = 1;
  if(totX === null || totY === null) {
    totX = toX - fromX,
    totY = toY - fromY
  }
  if(lineX === null || lineY === null) {
    lineX = fromX
    lineY = fromY
  }
  if(totX < 0) {
    xDirection = -1
  }
  if(animatingLine && (xDirection * lineX >= xDirection * toX)) {
    animatingLine = false
    lineX = toX
    lineY = toY
  } else if(animatingLine) {
    lineX += (totX / (time * fps))
    lineY += (totY / (time * fps))
  }
  context.beginPath()
  context.moveTo(fromX, fromY)
  context.lineTo(lineX, lineY)
  context.stroke();
}

function resetTooltips() {
  animatingLine = false
  bubbleDist = null
  lineIncrement = 1
  lineX = null
  lineY = null
  tooltipAlpha = 0
  tooltipQuestionIndex = 0
}

/* 
  TODO:
  * Change to dynamic solution where all coordinates are computed in update function
    and saved in an array / object to avoid big calculations each render.
  * Only show bad answers? (Take weightlimit as argument to filter answer swapping)
*/
// Draw the tooltip of a given index
function drawTooltip(index) {
  const maxWidth = 400
  const radius = 5
  const edgesOffset = 15 // Margin to window edges
  const bubbleOffset = 10 // Margin between text and bubble
  var textOffset = (LINEWIDTH * 5) // Decides how far away from circle tooltips appear
  var tooltip = 'Kunde ej hitta fråga'

  var questions = tagInfo.filter(el => {
    const tempIdx = index === 7 ? 6 : index
    return (el.tag.toLowerCase() === data.find(day => day.idx === tempIdx).tag.toLowerCase() && (el.score / el.maxScore) >= originalData.find(day => day.idx === tempIdx).normWeight)
  })
  if(questions.length > 1) {
    questions.sort((first, snd) => {
      return first.score / first.maxScore > snd.score / snd.maxScore ? -1 : 1
    })
  }
  var info = questions[tooltipQuestionIndex]
 
  tooltip = info ? info.question : 'No question found. Have the developer options been altered? Try refreshing the visualization'
  const answer = info ? info.answer : ' '
  
  context.font = `${tooltipTextSize}` + 'px OpenSans' // Measuretext is incorrect in first frame for some reason.
  const circleCoords = {
    x: getCircleSectionCoords(index + 0.5).x,
    y: getCircleSectionCoords(index + 0.5).y
  }

  const words = tooltip.split(' ')
  const rowBreakIndices = []
  var wordNr = 0
  var rowWidth = 0
  var rows = 1
  var longestRow = 0

  words.forEach(word => {
    rowWidth += context.measureText(word).width + context.measureText(' ').width
    if(rowWidth > maxWidth) {
      rowWidth = context.measureText(word).width + context.measureText(' ').width
      rows++
      rowBreakIndices.push(wordNr)
    }
    if(rowWidth > longestRow) {
      longestRow = rowWidth - context.measureText(' ').width
    }
    wordNr++
  })
  if (longestRow < context.measureText(answer).width + 20) {
    longestRow = context.measureText(answer).width + 20
  }
  var bubbleWidth = longestRow + bubbleOffset * 2
  
  const unitNorm = calculateUnitNormal(circleCoords.x, circleCoords.y)
  var normDirection = -1

  // TODO: Check this code and figure out why bottom of circle has further tooptip distance
  // if(
  //   Math.abs(circleCoords.x - (circleCoords.x - (bubbleWidth / 2) - (normDirection * unitNorm.x * textOffset))) >
  //   Math.abs(circleCoords.y - (circleCoords.y - (normDirection * unitNorm.y * textOffset - (rows / 2) * tooltipTextSize)))
  // ) {
  //   textOffset = bubbleWidth / 2
  // } else {
  //   textOffset = (tooltipTextSize * rows + bubbleOffset * 2)
  // }

  var textX = circleCoords.x - (bubbleWidth / 2) - (normDirection * unitNorm.x * textOffset)
  var textY = circleCoords.y - (normDirection * unitNorm.y * textOffset)
  if(textX - bubbleOffset < edgesOffset || textX + bubbleOffset + bubbleWidth > (canvas.width - edgesOffset) || textY + bubbleOffset > (canvas.height - edgesOffset) || textY - bubbleOffset - textSize * rows < edgesOffset) {
      normDirection = 1
  }
  const textCorner = {
    x: circleCoords.x - (bubbleWidth / 2) - (normDirection * unitNorm.x * textOffset),
    y: circleCoords.y - (normDirection * unitNorm.y * textOffset)
  }
  const textCenter = {
    x: circleCoords.x - (normDirection * unitNorm.x * textOffset),
    y: circleCoords.y - (normDirection * unitNorm.y * textOffset) - (rows / 2) * tooltipTextSize
  }
  const bubble = {
    x: textCorner.x - bubbleOffset,
    y: textCorner.y + bubbleOffset,
    w: bubbleWidth,
    h: tooltipTextSize * 1.3 * (rows + 1) + bubbleOffset * 2,
    r: radius
  }
  context.strokeStyle = "black";
  context.lineWidth = 1.5;
  
  const lineCoords = {
    x1: circleCoords.x,
    y1: circleCoords.y,
    x2: textCenter.x,
    y2: textCenter.y
  }

  const rectIntersection = getRectIntersection(
    bubble, lineCoords
  )
  if(rectIntersection !== null) {
    if(animatingLine) {
      drawAnimatedLine(
        circleCoords.x,
        circleCoords.y,
        rectIntersection.x,
        rectIntersection.y,
        0.2
      )
    } else {
      context.beginPath()
      context.moveTo(circleCoords.x, circleCoords.y)
      context.lineTo(rectIntersection.x, rectIntersection.y)
      context.stroke()
    }
  } else if (isPointInBubble(circleCoords, bubble)) {
    animatingLine = false
  }
  
  drawBubble(bubble.x, bubble.y, bubble.w, bubble.h, bubble.r, 0.6)
  
  // Check if bubble was clicked
  if(mouseClicked) {
    if(isPointInBubble(mousePos, bubble)) {
        tooltipQuestionIndex = ((tooltipQuestionIndex + 1) % questions.length)
        mouseClicked = false
      }
  }

  if(!animatingBubble) {
    stdFill =  getFillstyleString(tooltipColor[0], tooltipColor[1], tooltipColor[2], tooltipAlpha)
    context.fillStyle = stdFill
    var currentRow = 0
    var currentX = 0
    words.forEach((word, i) => {
      if(rowBreakIndices.includes(i)) {
        currentRow++
        currentX = 0
      }
      context.fillText(word, textCorner.x + currentX, textCorner.y - tooltipTextSize * 0.3 - (rows * tooltipTextSize * 1.3) + (currentRow * tooltipTextSize * 1.3))
      currentX += context.measureText(word).width + context.measureText(' ').width
    })

    context.beginPath()
    context.fillText(answer, textCorner.x + bubble.w / 2 - (context.measureText(answer).width / 2), textCorner.y - tooltipTextSize * 0.3)
    context.beginPath();
    context.rect(textCorner.x + bubble.w / 2 - (context.measureText(answer).width / 2) - 20, textCorner.y - tooltipTextSize * 0.3 - 10, 10, 10);
    var rgb = info ? hexToRgb(computeColor(info.score / info.maxScore)) : (0, 0, 0)
    context.fillStyle = getFillstyleString(rgb.r, rgb.g, rgb.b, tooltipAlpha)
    context.fill()
    if(tooltipAlpha < 1) tooltipAlpha += 1 / fps
  }
}

// Draw the bubble around a tooltip
function drawBubble(x, y, w, h, radius, time) {
  var r = x + w;
  var t = y - h;

  context.beginPath();
  context.strokeStyle = "black";
  context.lineWidth = 1.5;
  context.moveTo(x + radius, y);
  if(!animatingBubble) {
    context.lineTo(r - radius, y);
    context.quadraticCurveTo(r, y, r, y - radius);
    context.lineTo(r, y - h + radius);
    context.quadraticCurveTo(r, t, r - radius, t);
    context.lineTo(x + radius, t);
    context.quadraticCurveTo(x, t, x, t + radius);
    context.lineTo(x, y - radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    const bgColor = isPointInBubble(mousePos, {x, y, w, h}) ? tooltipHoverFill : tooltipFill
    context.fillStyle = getFillstyleString(bgColor[0], bgColor[1], bgColor[2], tooltipAlpha)
    context.fill();
  } else if(!animatingLine){
    const totalDist = w * 2 + h * 2 - radius * 8
    if(bubbleDist === null) {
      bubbleDist = 0
    }
    bubbleDist += totalDist / (time * fps)
    var remainingDist = 0
    if(bubbleDist < (w - radius * 2)) {
      context.lineTo(x + radius + bubbleDist, y)
    } else {
      context.lineTo(r - radius, y)
      context.quadraticCurveTo(r, y, r, y - radius)
      remainingDist = bubbleDist - (w - radius * 2)
      if(remainingDist < (h - radius * 2)) {
        context.lineTo(r, y - remainingDist - radius)
      } else {
        context.lineTo(r, y - h + radius)
        context.quadraticCurveTo(r, t, r - radius, t)
        remainingDist = remainingDist - (h - radius * 2)
        if(remainingDist < (w - radius * 2)) {
          context.lineTo(x + w - radius - remainingDist, t)
        } else {
          context.lineTo(x + radius, t);
          context.quadraticCurveTo(x, t, x, t + radius);
          remainingDist = remainingDist - (w - radius * 2)
          if(remainingDist < (h - radius * 2)) {
            context.lineTo(x, y - h + radius + remainingDist);
          } else {
            context.lineTo(x, y - radius);
            context.quadraticCurveTo(x, y, x + radius, y);
            animatingBubble = false
          }
        }
      }
    }
  }
  context.stroke();
}