// 3 players game

game = {
  players: [
    'JzY7zZX3pD07AvpVAAAB',
    'oV0Dbu0emBdQGDYaAAAD',
    'Ni9f7X0A2VAO5h-6AAAF'
  ],
  pnames: {
    JzY7zZX3pD07AvpVAAAB: '3',
    oV0Dbu0emBdQGDYaAAAD: '2',
    'Ni9f7X0A2VAO5h-6AAAF': '1'
  },
  ppoints: {
    JzY7zZX3pD07AvpVAAAB: 117,
    oV0Dbu0emBdQGDYaAAAD: 90,
    'Ni9f7X0A2VAO5h-6AAAF': 100
  },
  imposters: [ 'JzY7zZX3pD07AvpVAAAB' ],
  impostersCount: 1,
  round: 3,
  playersOrder: [
    'Ni9f7X0A2VAO5h-6AAAF',
    'JzY7zZX3pD07AvpVAAAB',
    'oV0Dbu0emBdQGDYaAAAD'
  ],
  usedWordSets: [ 4, 1, 2 ],
  setIndex: 2,
  imposterIndex: 1,
  talkTime: 3,
  voteTime: 7,
  canVote: false,
  canVoteCorrectnes: false,
  r1: {
    oV0Dbu0emBdQGDYaAAAD: 'imposter',
    'Ni9f7X0A2VAO5h-6AAAF': [ 'oV0Dbu0emBdQGDYaAAAD' ]
  },
  c1: {
    JzY7zZX3pD07AvpVAAAB: { oV0Dbu0emBdQGDYaAAAD: 2 },
    'Ni9f7X0A2VAO5h-6AAAF': { oV0Dbu0emBdQGDYaAAAD: 3 }
  },
  impScore1: { oV0Dbu0emBdQGDYaAAAD: 2.5 },
  wronGuesses1: { oV0Dbu0emBdQGDYaAAAD: 0 },
  noGuesses1: { oV0Dbu0emBdQGDYaAAAD: 1 },
  r2: {
    JzY7zZX3pD07AvpVAAAB: 'imposter',
    'Ni9f7X0A2VAO5h-6AAAF': [ 'JzY7zZX3pD07AvpVAAAB' ],
    oV0Dbu0emBdQGDYaAAAD: [ 'Ni9f7X0A2VAO5h-6AAAF' ]
  },
  c2: {
    oV0Dbu0emBdQGDYaAAAD: { JzY7zZX3pD07AvpVAAAB: 2 },
    'Ni9f7X0A2VAO5h-6AAAF': { JzY7zZX3pD07AvpVAAAB: 1 }
  },
  impScore2: { JzY7zZX3pD07AvpVAAAB: 1.5 },
  wronGuesses2: { JzY7zZX3pD07AvpVAAAB: 1 },
  noGuesses2: { JzY7zZX3pD07AvpVAAAB: 0 },
  r3: {
    JzY7zZX3pD07AvpVAAAB: 'imposter',
    'Ni9f7X0A2VAO5h-6AAAF': [ 'oV0Dbu0emBdQGDYaAAAD' ],
    oV0Dbu0emBdQGDYaAAAD: [ 'JzY7zZX3pD07AvpVAAAB' ]
  },
  c3: {
    oV0Dbu0emBdQGDYaAAAD: { JzY7zZX3pD07AvpVAAAB: 3 },
    'Ni9f7X0A2VAO5h-6AAAF': { JzY7zZX3pD07AvpVAAAB: 1 }
  },
  impScore3: { JzY7zZX3pD07AvpVAAAB: 2 },
  wronGuesses3: { JzY7zZX3pD07AvpVAAAB: 1 },
  noGuesses3: { JzY7zZX3pD07AvpVAAAB: 0 }
}

// sample 6 players game

game = {
  players: [
    'IgT_40yXT9G4M4v-AAAH',
    'klN2L27_PZci4FScAAAL',
    'j0gZm1OQARaghWNgAAAT',
    'Ax8PYO0XEH2IoUd1AAAJ',
    'FDbOTVeN3HfMxpgoAAAN',
    'GevuLFU1tS_34N93AAAP'
  ],
  pnames: {
    'IgT_40yXT9G4M4v-AAAH': '1',
    klN2L27_PZci4FScAAAL: '3',
    j0gZm1OQARaghWNgAAAT: '6',
    Ax8PYO0XEH2IoUd1AAAJ: '2',
    FDbOTVeN3HfMxpgoAAAN: '4',
    GevuLFU1tS_34N93AAAP: '5'
  },
  ppoints: {
    'IgT_40yXT9G4M4v-AAAH': 650,
    klN2L27_PZci4FScAAAL: 660,
    j0gZm1OQARaghWNgAAAT: 1280,
    Ax8PYO0XEH2IoUd1AAAJ: 371,
    FDbOTVeN3HfMxpgoAAAN: 550,
    GevuLFU1tS_34N93AAAP: 657
  },
  imposters: [ 'j0gZm1OQARaghWNgAAAT', 'FDbOTVeN3HfMxpgoAAAN' ],
  impostersCount: 2,
  round: 6,
  playersOrder: [
    'FDbOTVeN3HfMxpgoAAAN',
    'klN2L27_PZci4FScAAAL',
    'GevuLFU1tS_34N93AAAP',
    'j0gZm1OQARaghWNgAAAT',
    'IgT_40yXT9G4M4v-AAAH',
    'Ax8PYO0XEH2IoUd1AAAJ'
  ],
  usedWordSets: [ 3 ],
  setIndex: 3,
  imposterIndex: 1,
  talkTime: 3,
  voteTime: 7,
  canVote: false,
  canVoteCorrectnes: false,
  r1: {
    'IgT_40yXT9G4M4v-AAAH': 'imposter',
    klN2L27_PZci4FScAAAL: 'imposter',
    Ax8PYO0XEH2IoUd1AAAJ: [ 'IgT_40yXT9G4M4v-AAAH', 'FDbOTVeN3HfMxpgoAAAN' ]
  },
  c1: {
    j0gZm1OQARaghWNgAAAT: {},
    Ax8PYO0XEH2IoUd1AAAJ: {},
    FDbOTVeN3HfMxpgoAAAN: { 'IgT_40yXT9G4M4v-AAAH': 3, klN2L27_PZci4FScAAAL: 4 },
    GevuLFU1tS_34N93AAAP: { 'IgT_40yXT9G4M4v-AAAH': 1, klN2L27_PZci4FScAAAL: 1 }
  },
  impScore1: { 'IgT_40yXT9G4M4v-AAAH': 2, klN2L27_PZci4FScAAAL: 2.5 },
  wronGuesses1: { 'IgT_40yXT9G4M4v-AAAH': 0, klN2L27_PZci4FScAAAL: 1 },
  noGuesses1: { 'IgT_40yXT9G4M4v-AAAH': 6, klN2L27_PZci4FScAAAL: 6 },
  r2: {
    j0gZm1OQARaghWNgAAAT: 'imposter',
    'IgT_40yXT9G4M4v-AAAH': 'imposter',
    Ax8PYO0XEH2IoUd1AAAJ: [ 'IgT_40yXT9G4M4v-AAAH', 'klN2L27_PZci4FScAAAL' ],
    klN2L27_PZci4FScAAAL: [ 'Ax8PYO0XEH2IoUd1AAAJ', 'GevuLFU1tS_34N93AAAP' ]
  },
  c2: {
    klN2L27_PZci4FScAAAL: {},
    Ax8PYO0XEH2IoUd1AAAJ: {},
    FDbOTVeN3HfMxpgoAAAN: { j0gZm1OQARaghWNgAAAT: 2, 'IgT_40yXT9G4M4v-AAAH': 3 },
    GevuLFU1tS_34N93AAAP: { j0gZm1OQARaghWNgAAAT: 1, 'IgT_40yXT9G4M4v-AAAH': 1 }
  },
  impScore2: { j0gZm1OQARaghWNgAAAT: 1.5, 'IgT_40yXT9G4M4v-AAAH': 2 },
  wronGuesses2: { j0gZm1OQARaghWNgAAAT: 3, 'IgT_40yXT9G4M4v-AAAH': 2 },
  noGuesses2: { j0gZm1OQARaghWNgAAAT: 4, 'IgT_40yXT9G4M4v-AAAH': 4 },
  r3: {
    j0gZm1OQARaghWNgAAAT: 'imposter',
    Ax8PYO0XEH2IoUd1AAAJ: 'imposter',
    'IgT_40yXT9G4M4v-AAAH': [ 'Ax8PYO0XEH2IoUd1AAAJ', 'FDbOTVeN3HfMxpgoAAAN' ],
    klN2L27_PZci4FScAAAL: [ 'GevuLFU1tS_34N93AAAP', 'FDbOTVeN3HfMxpgoAAAN' ]
  },
  c3: {
    'IgT_40yXT9G4M4v-AAAH': {},
    klN2L27_PZci4FScAAAL: { j0gZm1OQARaghWNgAAAT: 3, Ax8PYO0XEH2IoUd1AAAJ: 3 },
    FDbOTVeN3HfMxpgoAAAN: { j0gZm1OQARaghWNgAAAT: 2, Ax8PYO0XEH2IoUd1AAAJ: 4 },
    GevuLFU1tS_34N93AAAP: {}
  },
  impScore3: { j0gZm1OQARaghWNgAAAT: 2.5, Ax8PYO0XEH2IoUd1AAAJ: 3.5 },
  wronGuesses3: { j0gZm1OQARaghWNgAAAT: 3, Ax8PYO0XEH2IoUd1AAAJ: 2 },
  noGuesses3: { j0gZm1OQARaghWNgAAAT: 4, Ax8PYO0XEH2IoUd1AAAJ: 4 },
  r4: {
    klN2L27_PZci4FScAAAL: 'imposter',
    GevuLFU1tS_34N93AAAP: 'imposter',
    FDbOTVeN3HfMxpgoAAAN: [ 'GevuLFU1tS_34N93AAAP', 'Ax8PYO0XEH2IoUd1AAAJ' ],
    Ax8PYO0XEH2IoUd1AAAJ: [ 'FDbOTVeN3HfMxpgoAAAN', 'IgT_40yXT9G4M4v-AAAH' ]
  },
  c4: {
    'IgT_40yXT9G4M4v-AAAH': {},
    j0gZm1OQARaghWNgAAAT: {},
    Ax8PYO0XEH2IoUd1AAAJ: { klN2L27_PZci4FScAAAL: 2 },
    FDbOTVeN3HfMxpgoAAAN: { klN2L27_PZci4FScAAAL: 3 }
  },
  impScore4: { klN2L27_PZci4FScAAAL: 2.5, GevuLFU1tS_34N93AAAP: 1 },
  wronGuesses4: { klN2L27_PZci4FScAAAL: 3, GevuLFU1tS_34N93AAAP: 2 },
  noGuesses4: { klN2L27_PZci4FScAAAL: 4, GevuLFU1tS_34N93AAAP: 4 },
  r5: {
    GevuLFU1tS_34N93AAAP: 'imposter',
    j0gZm1OQARaghWNgAAAT: 'imposter',
    FDbOTVeN3HfMxpgoAAAN: [ 'GevuLFU1tS_34N93AAAP', 'j0gZm1OQARaghWNgAAAT' ],
    klN2L27_PZci4FScAAAL: [ 'GevuLFU1tS_34N93AAAP', 'j0gZm1OQARaghWNgAAAT' ],
    Ax8PYO0XEH2IoUd1AAAJ: [ 'GevuLFU1tS_34N93AAAP', 'j0gZm1OQARaghWNgAAAT' ],
    'IgT_40yXT9G4M4v-AAAH': [ 'FDbOTVeN3HfMxpgoAAAN' ]
  },
  c5: {
    'IgT_40yXT9G4M4v-AAAH': { j0gZm1OQARaghWNgAAAT: 2, GevuLFU1tS_34N93AAAP: 3 },
    klN2L27_PZci4FScAAAL: { j0gZm1OQARaghWNgAAAT: 1 },
    Ax8PYO0XEH2IoUd1AAAJ: { GevuLFU1tS_34N93AAAP: 4 },
    FDbOTVeN3HfMxpgoAAAN: {}
  },
  impScore5: { GevuLFU1tS_34N93AAAP: 3.5, j0gZm1OQARaghWNgAAAT: 1.5 },
  wronGuesses5: { GevuLFU1tS_34N93AAAP: 1, j0gZm1OQARaghWNgAAAT: 1 },
  noGuesses5: { GevuLFU1tS_34N93AAAP: 1, j0gZm1OQARaghWNgAAAT: 1 },
  r6: {
    j0gZm1OQARaghWNgAAAT: 'imposter',
    FDbOTVeN3HfMxpgoAAAN: 'imposter',
    'IgT_40yXT9G4M4v-AAAH': [ 'GevuLFU1tS_34N93AAAP', 'klN2L27_PZci4FScAAAL' ],
    klN2L27_PZci4FScAAAL: [ 'GevuLFU1tS_34N93AAAP', 'Ax8PYO0XEH2IoUd1AAAJ' ],
    GevuLFU1tS_34N93AAAP: [ 'Ax8PYO0XEH2IoUd1AAAJ' ]
  },
  c6: {
    'IgT_40yXT9G4M4v-AAAH': {},
    klN2L27_PZci4FScAAAL: { FDbOTVeN3HfMxpgoAAAN: 1, j0gZm1OQARaghWNgAAAT: 3 },
    Ax8PYO0XEH2IoUd1AAAJ: { FDbOTVeN3HfMxpgoAAAN: 1, j0gZm1OQARaghWNgAAAT: 2 },
    GevuLFU1tS_34N93AAAP: { FDbOTVeN3HfMxpgoAAAN: 4, j0gZm1OQARaghWNgAAAT: 1 }
  },
  impScore6: { j0gZm1OQARaghWNgAAAT: 2, FDbOTVeN3HfMxpgoAAAN: 2 },
  wronGuesses6: { j0gZm1OQARaghWNgAAAT: 5, FDbOTVeN3HfMxpgoAAAN: 5 },
  noGuesses6: { j0gZm1OQARaghWNgAAAT: 3, FDbOTVeN3HfMxpgoAAAN: 3 }
}