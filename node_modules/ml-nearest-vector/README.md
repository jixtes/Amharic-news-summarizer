# nearest-vector

  [![NPM version][npm-image]][npm-url]
  [![build status][travis-image]][travis-url]
  [![Test coverage][coveralls-image]][coveralls-url]
  [![David deps][david-image]][david-url]
  [![npm download][download-image]][download-url]
  
> Find the nearest point to a sample point

## Installation

```
$ npm install ml-nearest-vector
```

## [API Documentation](https://mljs.github.io/nearest-vector/)

## Example

```js
const nearestVector = require('ml-nearest-vector');

let centers = [[1, 2, 1], [-1, -1, -1]];
nearestVector(centers, [1, 2, 1]) === 0;
```

## License

[MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/ml-nearest-vector.svg?style=flat-square
[npm-url]: https://npmjs.org/package/ml-nearest-vector
[travis-image]: https://img.shields.io/travis/mljs/nearest-vector/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/mljs/nearest-vector
[coveralls-image]: https://img.shields.io/coveralls/mljs/nearest-vector.svg?style=flat-square
[coveralls-url]: https://coveralls.io/github/mljs/nearest-vector
[david-image]: https://img.shields.io/david/mljs/nearest-vector.svg?style=flat-square
[david-url]: https://david-dm.org/mljs/nearest-vector
[download-image]: https://img.shields.io/npm/dm/ml-nearest-vector.svg?style=flat-square
[download-url]: https://npmjs.org/package/ml-nearest-vector
