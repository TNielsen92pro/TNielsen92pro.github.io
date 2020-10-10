class Data {
  DAYS = [
    'morgon',
    'förmiddag',
    'tidig eftermiddag',
    'sen eftermiddag',
    'tidig kväll',
    'sen kväll',
    'natt',
    'hela dagen'
  ]
  constructor(data) {
    this.rawData = data
    this.data = data
    this.fullDayScore;
  }

  get getData() {
    return this.data
  }

  get getCurrentDataSize() {
    return this.data.length
  }

  initialize() {
    this.normalize()
    this.sort()
    this.extractFullDay()
    this.calculateAvg()
    this.duplicateNightInterval()
  }

  normalize() {
    this.data = DAYS.map((day, i) => {
      var weight = 0;
      const tagObj = data.find(el => el && (el.tag.toLowerCase() === day.toLowerCase()))
      tagObj && (weight = tagObj.meanAnswered / tagObj.meanMax);
      return {
        idx: i,
        tag: day.toLowerCase(),
        normWeight: weight
      }
    })
  }

  sort() {
    this.data.sort((first, snd) => {
      return first.idx < snd.idx ? -1 : 1
    })
  }

  extractFullDay() {
    this.fullDayScore = data[getCurrentDataSize() - 1]
    this.data.pop()
  }

  calculateAvg() {
    this.fullDayScore = this.data.reduce((res, obj) => {
      return res + obj['normWeight'];
    }, 0) / getCurrentDataSize();
  }

  duplicateNightInterval() {
    this.data.push(this.data[getCurrentDataSize() - 1])
  }

  addGeneralWeight(impact) {
    // Start here
  }

}