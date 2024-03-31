# Integrating Node Groups into the three.js playground

This branch of three.js was developed during the 3D-Computer-Graphics seminar "Extending the Three.js Framework" at Hasso-Plattner-Institute.

You can look at the results online [here](https://abc013.github.io/three.js/playground/).

## Motivation

Node-based shadergraphs are an intuitive and simple way for non-programmers to construct materials and scenes of higher complexity. The more complexity a scene has, the more chaotic its shader-graph will get. Thus, this branch introduces "Node Groups", which encapsulates nodes into a separate view and simplifies reusing existing node setups.

![image](https://github.com/abc013/three.js/assets/21260178/ba3f030d-9603-43a1-9ec1-8d72ecb20cfc)
_concept of node groups_

## About three.js

To get to know more about three.js, you can finde the original README.md [here](https://github.com/abc013/three.js/blob/nodeGroups-submission/README-threejs.md).

## Building and local deployment

To build the project, please follow the [build instructions of three.js](https://github.com/mrdoob/three.js/wiki/Build-instructions).
Once the local server is running (e.g. via `npm start`), visit `https://localhost:8080/playground` (or similar URLs, depending on configuration) to view the playground.
