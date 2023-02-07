'use strict';

const squaredDistance = require('ml-distance-euclidean').squared;

const defaultOptions = {
    distanceFunction: squaredDistance,
    similarityFunction: false,
    returnVector: false
};

/**
 * Find the nearest vector in a list to a sample vector
 * @param {Array<Array<number>>} listVectors - List of vectors with same dimensions
 * @param {Array<number>} vector - Reference vector to "classify"
 * @param {object} [options] - Options object
 * @param {function} [options.distanceFunction = squaredDistance] - Function that receives two vectors and return their distance value as number
 * @param {function} [options.similarityFunction = undefined] - Function that receives two vectors and return their similarity value as number
 * @param {boolean} [options.returnVector = false] - Return the nearest vector instead of its index
 * @return {number|Array<number>} - The index or the content of the nearest vector
 */
function nearestVector(listVectors, vector, options) {
    options = options || defaultOptions;
    const distanceFunction = options.distanceFunction || defaultOptions.distanceFunction;
    const similarityFunction = options.similarityFunction || defaultOptions.similarityFunction;
    const returnVector = options.returnVector || defaultOptions.returnVector;

    var vectorIndex = -1;
    if (typeof similarityFunction === 'function') {

        // maximum similarity
        var maxSim = Number.MIN_VALUE;
        for (var j = 0; j < listVectors.length; j++) {
            var sim = similarityFunction(vector, listVectors[j]);
            if (sim > maxSim) {
                maxSim = sim;
                vectorIndex = j;
            }
        }
    } else if (typeof distanceFunction === 'function') {

        // minimum distance
        var minDist = Number.MAX_VALUE;
        for (var i = 0; i < listVectors.length; i++) {
            var dist = distanceFunction(vector, listVectors[i]);
            if (dist < minDist) {
                minDist = dist;
                vectorIndex = i;
            }
        }
    } else {
        throw new Error('A similarity or distance function it\'s required');
    }

    if (returnVector) {
        return listVectors[vectorIndex];
    } else {
        return vectorIndex;
    }
}

module.exports = nearestVector;
