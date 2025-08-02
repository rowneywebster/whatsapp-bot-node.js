const states = {};
exports.get = user => states[user];
exports.set = (user, value) => { states[user] = value; };
exports.clear = user => { delete states[user]; };



// // state.js — state manager
// const states = {};

// exports.get = user => states[user];
// exports.set = (user, value) => { states[user] = value; };
// exports.clear = user => { delete states[user]; };