#! /usr/bin/env node
'use strict'

const vorpal = require('vorpal')()

class Hack {
  /**
   * @param {string[]} words
   */
  constructor (words) {
    if (!words || !Array.isArray(words) || words.length === 0 || words.find((el, i, vett) => { return typeof el !== 'string' || (i > 0 ? el.length !== vett[0].length : false) })) {
      throw new Error('Please provide a suitable set of words.')
    }
    /** @type {string[]} */
    this.words = words.map((el) => { return el.toUpperCase() })
    /** @type {string[]} */
    this._words = Object.freeze(JSON.parse(JSON.stringify(this.words)))
  }
  /**
   * @param {string} word
   * @param {number} result
   */
  attempt (word, result = 0) {
    if (this.solved) return
    if (!word) {
      throw new Error('No word provided.')
    }
    word = word.toUpperCase()
    if (this.words[0].length !== word.length || this.words.indexOf(word) === -1) {
      throw new Error(`This word (${word}) isn't in the problem${this._words.indexOf(word) !== -1 ? ' (anymore)' : ''}.`)
    }
    if (typeof result !== 'number') {
      result = parseInt(result)
    }
    if (isNaN(result) || result < 0 || result > word.length) {
      throw new Error('The result provided is not valid.')
    }
    if (result === word.length) {
      this.words = [ word ]
    } else {
      let origWords = JSON.parse(JSON.stringify(this.words))
      this.words = this.words.filter((el) => {
        let score = 0
        for (let i = 0; i < word.length && score <= result; ++i) {
          if (word.charAt(i) === el.charAt(i)) {
            ++score
          }
        }
        return score === result
      })
      if (this.words.length === 0) {
        this.words = origWords
        throw new Error('Impossible attempt, no word remained. Resetting to the previous state.')
      }
    }
  }
  solve (word) {
    this.attempt(word, (word || '').length)
  }
  /**
   * @returns {string}
   */
  get result () {
    if (this.words && Array.isArray(this.words) && this.words.length === 1) {
      return this.words[0]
    } else {
      return null
    }
  }
  /**
   * @returns {boolean}
   */
  get solved () {
    return this.result !== null
  }
}
module.exports = Hack

if (require.main === module) {
  let hack

  vorpal
    .command('words [words...]', 'Allows to define the enigma words (resetting the game) or to see them.')
    .validate(function (args) {
      if (!args.words && (!hack || hack.words.length < 1)) {
        return 'Please define the problem first.'
      }
      return true
    })
    .action(function (args, callback) {
      if (args.words) {
        try {
          hack = new Hack(args.words)
          this.log('New words saved:', hack.words)
        } catch (err) {
          this.log(err.message)
        }
      } else {
        if (hack.solved) {
          this.log('Result:', hack.result)
        } else {
          this.log('Still possible words:', hack.words)
        }
      }
      callback()
    })

  vorpal
    .command('attempt <word> <result>', 'Set the result for a single words, eliminating impossible options.')
    .validate(function (args) {
      if (!args.words && (!hack || hack.words.length < 1)) {
        return 'Please define the problem first.'
      }
      return true
    })
    .action(function (args, callback) {
      try {
        hack.attempt(args.word, args.result)
        if (hack.solved) {
          this.log('Result:', hack.result)
        } else {
          this.log('Still possible words:', hack.words)
        }
      } catch (err) {
        this.log(err.message)
      }
      callback()
    })

  vorpal
    .command('solve <word>', 'Give the solution to the problem.')
    .validate(function (args) {
      if (!args.words && (!hack || hack.words.length < 1)) {
        return 'Please define the problem first.'
      }
      return true
    })
    .action(function (args, callback) {
      try {
        hack.solve(args.word)
        if (hack.solved) {
          this.log('Result:', hack.result)
        } else {
          this.log('The solution was not valid!!! Still possible words:', hack.words)
        }
      } catch (err) {
        this.log(err.message)
      }
      callback()
    })

  vorpal
    .delimiter('fallout$')
    .show()
}
