'use strict';

const nearestVector = require('ml-nearest-vector');

let centers = [[1, 2, 1], [-1, -1, -1]];
nearestVector(centers, [1, 2, 1]) === 0;