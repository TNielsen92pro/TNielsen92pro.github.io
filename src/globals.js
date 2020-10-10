
/* ------------- SETTINGS ------------- */

const SHOW_TABLE = false // Show a table of questionnaire answers next to visualization (For comparing / debugging)
const USE_TEST_DATA = false // Set to true for using test datafile
const DEVELOPER_MODE = true
const SHOW_SLIDERS = true

var FULL_DAY_INFLUENCE = 0.2 // The amount of influence full-day score has on the visualization
var STD_VAL_THRESHOLD = 0.15 // The max standard deviation value of which to enable highlighting

var HIGHLIGHT_UPPER_LIMIT = 0.4 // The maximum average value to highlight
var HIGHLIGHT_LOWER_LIMIT = 0.1 // The minimum average value to highlight
var HIGHLIGHTS = 3 // Max number of intervals to highlight
var HIGHLIGHT_THRESHOLD = 0.1 // Values further than this from max weight will not be highlighted
var HIGHLIGHT_INTERVAL = 0.2 // Period size between higlighting and lowering visualization intervals, where both highlight and lowering is executed

// Enable value adjustments. Recommended.
var DISABLE_ADJUSTMENT = false

var DISABLE_BLUR = false

const days = ['morgon', 'förmiddag', 'tidig eftermiddag', 'sen eftermiddag', 'tidig kväll', 'sen kväll', 'natt', 'hela dagen']

// Color for specific weight values. Yellow is further adjusted in tuning stage
var RED = 1.1 // 1.1 instead of 1 to avoid weights around 0.8-0.9 to appear fully red. Only weights close to 1 should be fully red
let YELLOW = 0.5
const GREEN = 0

/* ------------- DRAW VARIABLES ------------- */

// Constants
const RADIUS = 400 // Radius of main circle
const LINEWIDTH = 30 // Width of main circle
const BLURDETAIL = 50 // Number of blur gradient sections for each time interval. Increase for smoother blur transitions. Even number, please
const backgroundColor = '#ffffff' // Background color should mimic the css background color
const stampColor = ['0', '0', '0'] // Color of the time-stamps
const tooltipColor = ['0', '0', '0'] // Color of the tooltips
const tooltipFill = ['245', '245', '245'] // Color of tooltip background
const tooltipHoverFill = ['220', '220', '220'] // Color of tooltip background on hover
const tooltipTextSize = 17
const intervals = []
const warmupRounds = 100
const startAnimationTime = 1.5

// Main canvas rendering variables
var initializing = true
var drawStarted = false
var fps = 60 // FPS is calculated every render. Starts at 60 to avoid bugs on first frames
var ROTATION = 0 // Rotation of the visualization, increment in draw() function for continous rotation
var rotationSpeed = 0 // The speed of rotation
var hoverIndex = -1 // The index of which the cursor is currently hovering
var mousePos = 0
var mouseClicked = false
var clickIndex = -1
var lastClickIndex = -1
var alpha = 0

// Tooptip animation variables
var showTooltip = false
var animatingLine = false
var lineX = null
var lineY = null
var animatingBubble = false
var bubbleDist = null
var tooltipAlpha = 0
var tooltipQuestionIndex = 0

// Some values are set in canvas.js, needs initialization here for files to recognize them on render
var lastCalledTime
var delta
var context
var canvas
var X
var Y