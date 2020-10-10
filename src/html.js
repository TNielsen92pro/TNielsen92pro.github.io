/* ------------- RANGE SLIDERS ------------- */

// TODO: Add a delay for update so it doesn't max re-render when dragging slides
function createSliders() {

  var settingsContainer = document.getElementById("settingsContainer")
  let html = ""
  html += getSliderHTML(0, 100, FULL_DAY_INFLUENCE * 100, 'FDIInput', 'FDIValue', FULL_DAY_INFLUENCE, 'Full Day Influence')
  html += getSliderHTML(0, 100, HIGHLIGHT_THRESHOLD * 100, 'HLTInput', 'HLTValue', HIGHLIGHT_THRESHOLD, 'Highlight Threshold')
  html += getSliderHTML(0, 100, HIGHLIGHT_UPPER_LIMIT * 100, 'HULInput', 'HULValue', HIGHLIGHT_UPPER_LIMIT, 'Highlight Upper Limit')
  html += getSliderHTML(0, 100, HIGHLIGHT_LOWER_LIMIT * 100, 'HLLInput', 'HLLValue', HIGHLIGHT_LOWER_LIMIT, 'Highlight Lower Limit')
  html += getSliderHTML(0, 7, HIGHLIGHTS, 'HLInput', 'HLValue', HIGHLIGHTS, 'Highlights')
  html += getSliderHTML(0, 100, HIGHLIGHT_INTERVAL * 100, 'HLIInput', 'HLIValue', HIGHLIGHT_INTERVAL, 'Highlight interval')
  html += getSliderHTML(0, 100, STD_VAL_THRESHOLD * 100, 'SVTInput', 'SVTValue', STD_VAL_THRESHOLD, 'Standard Value Threshold')
  html += getSliderHTML(7, 20, RED * 10, 'FRInput', 'FRValue', RED, 'Full Red Value')
  html +=
  '<div class="checkboxes">\n\
    <input type="checkbox" value="EA" name="EA" class="checkbox" id="EACheckbox">\n\
    <label for="EA">Disable Adjustments</label>\n\
    <input type="checkbox" value="DA" name="DA" class="checkbox" id="DACheckbox">\n\
    <label for="EA">Disable Blur</label>\n\
    <button id="settingsCloseBtn">Close</button>\n\
  </div>\n'

  settingsContainer.innerHTML = html

  var FDIslider = document.getElementById("FDIInput")
  var FDIoutput = document.getElementById("FDIValue")

  FDIslider.oninput = function() {
    FDIoutput.innerHTML = FDIslider.value/100
    FULL_DAY_INFLUENCE = FDIslider.value/100
    updateSettings()
  }

  var HLTslider = document.getElementById("HLTInput")
  var HLToutput = document.getElementById("HLTValue")

  HLTslider.oninput = function() {
    HLToutput.innerHTML = HLTslider.value/100
    HIGHLIGHT_THRESHOLD = HLTslider.value/100
    updateSettings()
  }

  var HULslider = document.getElementById("HULInput")
  var HULoutput = document.getElementById("HULValue")

  HULslider.oninput = function() {
    HULoutput.innerHTML = HULslider.value/100
    HIGHLIGHT_UPPER_LIMIT = HULslider.value/100
    updateSettings()
  }

  var HLLslider = document.getElementById("HLLInput")
  var HLLoutput = document.getElementById("HLLValue")

  HLLslider.oninput = function() {
    HLLoutput.innerHTML = HLLslider.value/100
    HIGHLIGHT_LOWER_LIMIT = HLLslider.value/100
    updateSettings()
  }

  var HLslider = document.getElementById("HLInput")
  var HLoutput = document.getElementById("HLValue")

  HLslider.oninput = function() {
    HLoutput.innerHTML = HLslider.value
    HIGHLIGHTS = HLslider.value
    updateSettings()
  }

  var SVTslider = document.getElementById("SVTInput")
  var SVToutput = document.getElementById("SVTValue")

  SVTslider.oninput = function() {
    SVToutput.innerHTML = SVTslider.value/100
    STD_VAL_THRESHOLD = SVTslider.value/100
    updateSettings()
  }

  var FRslider = document.getElementById("FRInput")
  var FRoutput = document.getElementById("FRValue")

  FRslider.oninput = function() {
    FRoutput.innerHTML = FRslider.value/10
    RED = FRslider.value/10
    updateSettings()
  }

  var HLIslider = document.getElementById("HLIInput")
  var HLIoutput = document.getElementById("HLIValue")

  HLIslider.oninput = function() {
    HLIoutput.innerHTML = HLIslider.value/100
    HIGHLIGHT_INTERVAL = HLIslider.value/100
    updateSettings()
  }

  var EACB = document.getElementById("EACheckbox");
  EACB.oninput = function() {
    DISABLE_ADJUSTMENT = EACB.checked
    updateSettings()
  }
  
  var DACB = document.getElementById("DACheckbox");
  DACB.oninput = function() {
    DISABLE_BLUR = DACB.checked
    updateSettings()
  }

  
  var closeSettings = document.getElementById("settingsCloseBtn")
  closeSettings.onclick = function() {
    container[0].style.display = "none"
    legendButton.style.display = "unset"
  }

  var container = document.getElementsByClassName("slidecontainer")
  container[0].style.display = "none"
  container[1].style.display = "none"

  var legendButton = document.getElementById("legendButton")
  legendButton.onclick = function() {
    container[0].style.display = "unset"
    legendButton.style.display = "none"
  }

  if(DEVELOPER_MODE) {
    var devButton = document.getElementById("devButton")
    devButton.onclick = function() {
      container[1].style.display = "unset"
      devButton.style.display = "none"
    }

    var devContainer = document.getElementById("devContainer")
    html = ""
    for(let i = 0; i < originalData.length; i++) {
      html += getSliderHTML(0, 100, originalData[i].normWeight * 100, 'intervalInput' + i, 'intervalValue' + i, Math.floor(originalData[i].normWeight * 100) / 100, originalData[i].tag)
    }
    html += getSliderHTML(0, 100, FULL_DAY.normWeight * 100, 'fullDayInput', 'fullDayValue', Math.floor(FULL_DAY.normWeight * 100) / 100, FULL_DAY.tag)
    html += "<button id='devCloseBtn'>Close</button>"
    devContainer.innerHTML = html

    for(let i = 0; i < originalData.length; i++) {
      document.getElementById('intervalInput' + i).oninput = function() {
        document.getElementById('intervalValue' + i).innerHTML = document.getElementById('intervalInput' + i).value / 100
        changeOriginalData(i, document.getElementById('intervalInput' + i).value / 100)
        updateSettings()
      }
    }

    fullDayInput = document.getElementById('fullDayInput')
    fullDayOutput = document.getElementById('fullDayValue')
    fullDayInput.oninput = function() {
      fullDayOutput.innerHTML = fullDayInput.value / 100
      changeFullDay(fullDayInput.value / 100)
      updateSettings()
    }
    var closeDevSettings = document.getElementById("devCloseBtn")
    closeDevSettings.onclick = function() {
      container[1].style.display = "none"
      devButton.style.display = "unset"
    }
  } else {
    document.getElementById("devButton").style.display = "none"
  }
}

function getSliderHTML (min, max, val, inputID, valueID, origVal, text) {
  return (
  "\
  <div class='slidersection'>\n\
    <div class='sliderRow'>\n\
    <input type='range' min='" + min + "' max='" + max + "' value='" + val + "' class='slider' id='" + inputID + "'>\n\
    <p class='rangeText' id='" + valueID + "'>" + origVal + "</p>\n\
  </div>\n\
  <p class='myRangeLabel'>\n\
    " + text + "\n\
  </p>\n\
  </div>\n\
  "
  )
}

/* ------------- TABLE ------------- */

// Render the questionnaire answers next to the visualization
function createAnswerTable() {
  var header = document.getElementById('myTable').getElementsByTagName('thead')[0]
  var newHeader = header.insertRow()
  var headerCell = newHeader.insertCell(0)
  headerCell.innerHTML = "<b>Answers</b>"
  tagInfo.forEach(obj => {
    addTableAnswer(obj.question)
    addTableAnswer('<b>- ' + obj.answer + ' (' + obj.score + ' / ' + obj.maxScore + ')</b>')
  })
}

function addTableAnswer(answer) {
  
  var tableRef = document.getElementById('myTable').getElementsByTagName('tbody')[0]

  // Insert a row in the table at the last row
  var newRow = tableRef.insertRow()

  // Insert a cell in the row at index 0
  var newCell  = newRow.insertCell(0)

  // Set cell innerHTML to answer
  newCell.innerHTML = answer
  newCell.setAttribute("id", "testId")
}