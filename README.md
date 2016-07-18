# Thumbist

Thumbist is a image server written in node.js thanks to sharp (https://github.com/lovell/sharp) library.

# Features

## Implemented

* Serve images from:
    * Amazon S3
    * Google Cloud Storage
    * Static file
* Resize images via `sharp`

## Planned

* Serve images from:
    * Local file system
* Support validation of URL
* Support of image resize algorithms (fit-in)
* Support of image filters (fill)

# Motivation

There is a great image server written in Python - Thumbor (https://github.com/thumbor/thumbor). It 
is the main inspiration for this implementation in node.js. For people who don't know python well
but want to have a simple and fast image processing Thumbist will be a good fit.


_This implementation won't copy all the features from Thumbor, if you need something specific that
is not yet implemented its better to use Thumbor itself._

Thumbist is better used with Amazon AWS with a following setup: Cloudfront -> Thumbist -> S3.
For a detailed information please refer to this article on medium.

# Installation
...

# Configuration
...

# Known limitations
...

# Building / Running Tests

## Getting Started
```
npm install
```

```
node server.js
```

## Running Tests

```
npm test
```