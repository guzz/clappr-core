// Copyright 2014 Globo.com Player authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
/*jshint -W079 */

import '../base/polyfills'
import Media from '../base/media'
import Browser from '../components/browser'
import $ from 'clappr-zepto'

const idsCounter = {}
const videoStack = []

export const requestAnimationFrame = (window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  function(fn) { window.setTimeout(fn, 1000/60) }).bind(window)

export const cancelAnimationFrame = (window.cancelAnimationFrame ||
 window.mozCancelAnimationFrame ||
 window.webkitCancelAnimationFrame ||
 window.clearTimeout).bind(window)

export function isMobile() {
  const navString = navigator.userAgent||navigator.vendor||window.opera
  if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navString)) {
    return true
  } else {
    return false
  }
}

export function assign(obj, source) {
  if (source) {
    for (const prop in source) {
      const propDescriptor = Object.getOwnPropertyDescriptor(source, prop)
      propDescriptor ? Object.defineProperty(obj, prop, propDescriptor) : obj[prop] = source[prop]
    }
  }
  return obj
}

export function extend(parent, properties) {
  class Surrogate extends parent {
    constructor(...args) {
      super(...args)
      if (properties.initialize)
        properties.initialize.apply(this, args)

    }
  }
  assign(Surrogate.prototype, properties)
  return Surrogate
}

export function formatTime(time, paddedHours) {
  if (!isFinite(time)) return '--:--'

  time = time * 1000
  time = parseInt(time/1000)
  const seconds = time % 60
  time = parseInt(time/60)
  const minutes = time % 60
  time = parseInt(time/60)
  const hours = time % 24
  const days = parseInt(time/24)
  let out = ''
  if (days && days > 0) {
    out += days + ':'
    if (hours < 1) out += '00:'
  }
  if (hours && hours > 0 || paddedHours) out += ('0' + hours).slice(-2) + ':'
  out += ('0' + minutes).slice(-2) + ':'
  out += ('0' + seconds).slice(-2)
  return out.trim()
}

export const Fullscreen = {
  fullscreenElement: function() {
    return document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
  },
  requestFullscreen: function(el) {
    if (el.requestFullscreen) {
      return el.requestFullscreen()
    } else if (el.webkitRequestFullscreen) {
      if (typeof el.then === 'function') return el.webkitRequestFullscreen()
      el.webkitRequestFullscreen()
    } else if (el.mozRequestFullScreen) {
      return el.mozRequestFullScreen()
    } else if (el.msRequestFullscreen) {
      return el.msRequestFullscreen()
    } else if (el.querySelector && el.querySelector('video') && el.querySelector('video').webkitEnterFullScreen) {
      el.querySelector('video').webkitEnterFullScreen()
    } else if (el.webkitEnterFullScreen) {
      el.webkitEnterFullScreen()
    }
  },
  cancelFullscreen: function(el=document) {
    if (el.exitFullscreen)
      el.exitFullscreen()
    else if (el.webkitCancelFullScreen)
      el.webkitCancelFullScreen()
    else if (el.webkitExitFullscreen)
      el.webkitExitFullscreen()
    else if (el.mozCancelFullScreen)
      el.mozCancelFullScreen()
    else if (el.msExitFullscreen)
      el.msExitFullscreen()

  },
  fullscreenEnabled: function() {
    return !!(
      document.fullscreenEnabled ||
      document.webkitFullscreenEnabled ||
      document.mozFullScreenEnabled ||
      document.msFullscreenEnabled
    )
  }
}

export class Config {

  static _defaultConfig() {
    return {
      volume: {
        value: 100,
        parse: parseInt
      }
    }
  }

  static _defaultValueFor(key) {
    try {
      return this._defaultConfig()[key].parse(this._defaultConfig()[key].value)
    } catch (e) {
      return undefined
    }
  }

  static _createKeyspace(key) {
    return `clappr.${document.domain}.${key}`
  }

  static restore(key) {
    if (Browser.hasLocalstorage && localStorage[this._createKeyspace(key)])
      return this._defaultConfig()[key].parse(localStorage[this._createKeyspace(key)])

    return this._defaultValueFor(key)
  }

  static persist(key, value) {
    if (Browser.hasLocalstorage) {
      try {
        localStorage[this._createKeyspace(key)] = value
        return true
      } catch (e) {
        return false
      }
    }
  }
}

export class QueryString {
  static get params() {
    const query = window.location.search.substring(1)
    if (query !== this.query) {
      this._urlParams = this.parse(query)
      this.query = query
    }
    return this._urlParams
  }

  static get hashParams() {
    const hash = window.location.hash.substring(1)
    if (hash !== this.hash) {
      this._hashParams = this.parse(hash)
      this.hash = hash
    }
    return this._hashParams
  }

  static parse(paramsString) {
    let match
    const pl = /\+/g,  // Regex for replacing addition symbol with a space
      search = /([^&=]+)=?([^&]*)/g,
      decode = (s) => decodeURIComponent(s.replace(pl, ' ')),
      params = {}
    while (match = search.exec(paramsString)) { // eslint-disable-line no-cond-assign
      params[decode(match[1]).toLowerCase()] = decode(match[2])
    }
    return params
  }
}

export function seekStringToSeconds(paramName = 't') {
  let seconds = 0
  const seekString = QueryString.params[paramName] || QueryString.hashParams[paramName] || ''
  const parts = seekString.match(/[0-9]+[hms]+/g) || []
  if (parts.length > 0) {
    const factor = { 'h': 3600, 'm': 60, 's': 1 }
    parts.forEach(function(el) {
      if (el) {
        const suffix = el[el.length - 1]
        const time = parseInt(el.slice(0, el.length - 1), 10)
        seconds += time * (factor[suffix])
      }
    })
  } else if (seekString) { seconds = parseInt(seekString, 10) }

  return seconds
}

export function uniqueId(prefix) {
  idsCounter[prefix] || (idsCounter[prefix] = 0)
  const id = ++idsCounter[prefix]
  return prefix + id
}

export function isNumber(value) {
  return value - parseFloat(value) + 1 >= 0
}

export function currentScriptUrl() {
  const scripts = document.getElementsByTagName('script')
  return scripts.length ? scripts[scripts.length - 1].src : ''
}

export function getBrowserLanguage() {
  return window.navigator && window.navigator.language
}

export function now() {
  if (window.performance && window.performance.now)
    return performance.now()

  return Date.now()
}

// remove the item from the array if it exists in the array
export function removeArrayItem(arr, item) {
  const i = arr.indexOf(item)
  if (i >= 0)
    arr.splice(i, 1)

}

// find an item regardless of its letter case
export function listContainsIgnoreCase(item, items) {
  if (item === undefined || items === undefined) return false
  return items.find((itemEach) => item.toLowerCase() === itemEach.toLowerCase()) !== undefined
}

// https://github.com/video-dev/can-autoplay
export function canAutoPlayMedia(cb, options) {
  options = Object.assign({
    inline: false,
    muted: false,
    timeout: 250,
    type: 'video',
    source: Media.mp4,
    element: null
  }, options)

  let element = options.element ? options.element : document.createElement(options.type)

  element.muted = options.muted
  if (options.muted === true)
    element.setAttribute('muted', 'muted')

  if (options.inline === true)
    element.setAttribute('playsinline', 'playsinline')

  element.src = options.source

  let promise = element.play()

  let timeoutId = setTimeout(() => {
    setResult(false, new Error(`Timeout ${options.timeout} ms has been reached`))
  }, options.timeout)

  let setResult = (result, error = null) => {
    clearTimeout(timeoutId)
    cb(result, error)
  }

  if (promise !== undefined) {
    promise
      .then(() => setResult(true))
      .catch(err => setResult(false, err))
  } else {
    setResult(true)
  }
}

// Simple element factory with video recycle feature.
export class DomRecycler {
  static configure(options) {
    this.options = $.extend(true, this.options, options)
  }

  static create(name) {
    if (this.options.recycleVideo && name === 'video' && videoStack.length > 0)
      return videoStack.shift()

    return document.createElement(name)
  }

  static garbage(el) {
    if (!this.options.recycleVideo || el.tagName.toUpperCase() !== 'VIDEO') return
    $(el).children().remove()
    Object.values(el.attributes).forEach(attr => el.removeAttribute(attr.name))
    videoStack.push(el)
  }
}

DomRecycler.options = { recycleVideo: false }

export class DoubleEventHandler {
  constructor(delay = 500) {
    this.delay = delay
    this.lastTime = 0
  }

  handle(event, cb, prevented = true) {
    // Based on http://jsfiddle.net/brettwp/J4djY/
    let currentTime = new Date().getTime()
    let diffTime = currentTime - this.lastTime

    if (diffTime < this.delay && diffTime > 0) {
      cb()
      prevented && event.preventDefault()
    }

    this.lastTime = currentTime
  }
}

export default {
  Config,
  Fullscreen,
  QueryString,
  DomRecycler,
  assign,
  extend,
  formatTime,
  seekStringToSeconds,
  uniqueId,
  currentScriptUrl,
  isNumber,
  requestAnimationFrame,
  cancelAnimationFrame,
  getBrowserLanguage,
  now,
  removeArrayItem,
  listContainsIgnoreCase,
  canAutoPlayMedia,
  Media,
  DoubleEventHandler,
}
