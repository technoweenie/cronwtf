var CronWTF = {
  // parse multiple cron lines, returns an array of messages.
  parse: function(s) {
    lines    = s.split("\n")
    messages = []
    len      = lines.length
    for(i = 0; i < len; i++) {
      var line = lines[i]
      if(line.length > 0 && !line.match(/^#/))
        messages.push(this.entry(line).message)
    }
    return messages
  },

  // parses a single cron line, returns an object
  entry: function(line) {
    pieces = line.replace(/^\s+|\s+$/g, '').split(/\s+/)
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
  // *     - every increment (returns '*')
  // \d+   - that value
  // 1,2,3 - those values
  // 1-3   - range of values
  // */3   - steps
  parseAttribute: function(value, upperBound) {
    if(value == '*') return value;

    if(value.match(/^\*\/\d+$/)) {
      step  = parseInt(value.match(/^\*\/(\d+)$/)[1])
      range = []
      for(i = 0; i < upperBound; i += step) {
        range.push(i)
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

  // on minute :00, every hour, on months July, August, every week day
  generateMessage: function(entry) {
    var attribs   = ['minute', 'hour', 'day', 'month', 'week_day']
    var attribLen = attribs.length;
    var msg       = []
    for(var i = 0; i < attribLen; i++) {
      var key    = attribs[i] + 's'
      var prev   = msg[msg.length -1]
      var values = entry[key]
      if(values == '*') {
        if(!prev || !prev.match(/^every/))
          msg.push("every " + attribs[i].replace('_', ' '))
      } else {
        func = this[key + 'Message']
        if(func) msg.push(func(values))
      }
    }
    return "Runs `" + entry.command + "` " + msg.join(", ") + "."
  },

  minutesMessage: function(values) {
    var m   = 'at minute'
    var v   = []
    var len = values.length;
    for(var j = 0; j < len; j++) {
      num = values[j].toString();
      if(num.length == 1) num = "0" + num
      v.push(":" + num)
    }
    if(len > 1) m += 's'
    return m + " " + v.join(", ")
  },

  hoursMessage: function(values) {
    var m = 'on hour'
    if(values.length > 1) m += 's'
    return m + " " + values.join(", ")
  },

  daysMessage: function(values) {
    var m = 'on day'
    if(values.length > 1) m += 's'
    return m + " " + values.join(", ")
  },

  months: [, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  monthsMessage: function(values) {
    var v   = []
    var len = values.length;
    for(var j = 0; j < len; j++) {
      v.push(CronWTF.months[values[j]])
    }
    return "in " + v.join(", ")
  },

  week_days: ['Sun', 'Mon', "Tue", 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  week_daysMessage: function(values) {
    var v   = []
    var len = values.length;
    for(var j = 0; j < len; j++) {
      v.push(CronWTF.week_days[values[j]])
    }
    return "on " + v.join(", ")
  }
}
