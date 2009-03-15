var CronWTF = {
  entry: function(line) {
    pieces = line.split(/\s/)
    e = {
      minutes:   this.parseAttribute(pieces[0], 60),
      hours:     this.parseAttribute(pieces[1], 24),
      days:      this.parseAttribute(pieces[2], 31),
      months:    this.parseAttribute(pieces[3], 12),
      week_days: this.parseAttribute(pieces[4], 8),
      command:   pieces.slice(5, pieces.length).join(" ")
    }
    e.message = this.generateMessage(e);
    return e;
  },

  // parses an individual time attribute into an array of numbers.
  // *     - every increment (returns 0)
  // \d+   - that value
  // 1,2,3 - those values
  // 1-3   - range of values
  // */3   - steps
  parseAttribute: function(value, upperBound) {
    if(value == '*') return 0;

    if(value.match(/^\*\/\d+$/)) {
      step  = parseInt(value.match(/^\*\/(\d+)$/)[1])
      range = []
      for(i = 0; i < upperBound; i++) {
        if(i % step == 0) range.push(i)
      }
      return range
    } 
    
    if(value.match(/^\d+\-\d+$/)) {
      matches = value.match(/^(\d+)\-(\d+)$/)
      lower   = parseInt(matches[1])
      upper   = parseInt(matches[2])
      range   = []
      for(var i = lower; i <= upper; i++) {
        range.push(i);
      }
      return range
    }

    return value.split(",")
  },

  generateMessage: function(entry) {
    var timeMsg;
    if(entry.minutes == 0) {
      timeMsg = 'every minute'
    } else {
      //alert(entry.minutes)
      timeMsg = 'every hour'
    }
    return "Runs `" + entry.command + "`" + timeMsg + "."
  }
}