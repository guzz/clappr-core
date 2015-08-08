var HLS = require('../../src/playbacks/hls/hls.js')
var Events = require('../../src/base/events.js')

describe('HLS playback', function() {
  describe('#setPlaybackState', function() {
    beforeEach(function() {
      this.hls = new HLS({})
      this.hls.el.getbufferLength = function() { return 0 }
      this.hls.el.getDuration = function() { return 30 }
      this.hls.el.getType = function() { return 'live' }
    })

    it('should trigger a buffering event on buffering states', function() {
      var buffering = false
      this.hls.on(Events.PLAYBACK_BUFFERING, function() { buffering = true })
      this.hls.setPlaybackState("PLAYING_BUFFERING")
      expect(buffering).to.be.true
      buffering = false
      this.hls.setPlaybackState("PAUSED_BUFFERING")
      expect(buffering).to.be.true
    })

    it('should trigger a buffering event regardless of buffer size', function() {
      var buffering = false
      this.hls.el.getbufferLength = function() { return 10 }
      this.hls.on(Events.PLAYBACK_BUFFERING, function() { buffering = true })
      this.hls.setPlaybackState("PLAYING_BUFFERING")
      expect(buffering).to.be.true
    })

    it('should trigger a buffer full event when transitioning from a buffering state to playing', function() {
      var buffering = true
      this.hls.setPlaybackState("PLAYING_BUFFERING")
      this.hls.on(Events.PLAYBACK_BUFFERFULL, function() { buffering = false })
      this.hls.setPlaybackState("PLAYING")
      expect(buffering).to.be.false
    })

    it('should trigger a buffer full event when transitioning from a buffering state to paused', function() {
      var buffering = true
      this.hls.setPlaybackState("PAUSED_BUFFERING")
      this.hls.on(Events.PLAYBACK_BUFFERFULL, function() { buffering = false })
      this.hls.setPlaybackState("PAUSED")
      expect(buffering).to.be.false
    })

    it('should trigger an ended event when changing to idle', function() {
      var ended = false
      this.hls.on(Events.PLAYBACK_ENDED, function() { ended = true })
      this.hls.setPlaybackState("IDLE")
      expect(ended).to.be.true
    })

    it('should set current time to 0 when changing to idle', function() {
      var current = -1
      this.hls.on(Events.PLAYBACK_TIMEUPDATE, function(position) { current = position })
      this.hls.setPlaybackState("IDLE")
      expect(current).to.be.equal(0)
    })
  })
})