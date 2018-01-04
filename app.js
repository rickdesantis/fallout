#! /usr/bin/env node
'use strict'

const vorpal = require('vorpal')()

let words

vorpal
  .command('words [words...]', 'Allows to define the enigma words (resetting the game) or to see them.')
  .validate(function (args) {
    if (!args.words && (!words || words.length < 1)) {
      return 'Please define the words.'
    }
    return true
  })
  .action(function (args, callback) {
    if (args.words) {
      words = args.words.map((el) => { return el.toUpperCase()})
      this.log('New words saved:', words)
    } else {
      if (words.length === 1) {
        this.log('Result:', words[0])
      } else {
        this.log('Still possible words:', words)
      }
    }
    callback()
  })

vorpal
  .command('attempt <word> <result>', 'Set the result for a single words, eliminating impossible options.')
  .validate(function (args) {
    if (!args.words && (!words || words.length < 1)) {
      return 'Please define the words.'
    }
    if (args.word && words.indexOf(args.word.toUpperCase()) === -1) {
      return 'Please define a word that is still in the problem.'
    }
    return true
  })
  .action(function (args, callback) {
    let attemptWord = args.word.toUpperCase()
    let result = Math.min(Math.max(parseInt(args.result || 0), 0), attemptWord.length)
    if (result === attemptWord.length) {
      words = [ attemptWord ]
      this.log('Result:', words[0])
    } else {
      words = words.filter((word) => {
        let score = 0
        for (let i = 0; i < word.length && score <= result; ++i) {
          if (word.charAt(i) === attemptWord.charAt(i)) {
            ++score
          }
        }
        return score === result
      })
      this.log('Still possible words:', words)
    }
    callback()
  })

vorpal
  .delimiter('fallout$')
  .show()
