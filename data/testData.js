var testData = [
  {"tag":"morgon","meanMax":4.5,"meanAnswered":2},
  {"tag":"Tidig eftermiddag","meanMax":6,"meanAnswered":3},
  {"tag":"Förmiddag","meanMax":7.5,"meanAnswered":3.5},
  {"tag":"Sen eftermiddag","meanMax":7,"meanAnswered":3.5},
  {"tag":"Tidig kväll","meanMax":5,"meanAnswered":2.5},
  {"tag":"Sen kväll","meanMax":7.5,"meanAnswered":4}, // 5.2 gives weirdness
  {"tag":"Natt","meanMax":4,"meanAnswered":2},
  {"tag":"Hela dagen","meanMax":2,"meanAnswered":0}
]

// var testDataNormalized = [
//   {"tag":"morgon", "idx": 0, "normWeight": 0.34},
//   {"tag":"Tidig Eftermiddag", "idx": 1, "normWeight": 0.34},
//   {"tag":"Förmiddag","idx": 2, "normWeight": 0.34},
//   {"tag":"Sen eftermiddag","idx": 3, "normWeight": 0.34},
//   {"tag":"Tidig kväll","idx": 4, "normWeight": 0.34},
//   {"tag":"Sen kväll","idx": 5, "normWeight": 0.34},
//   {"tag":"Natt","idx": 6, "normWeight": 0.34},
//   {"tag":"Hela dagen","idx": 7, "normWeight": 0.34},
// ]