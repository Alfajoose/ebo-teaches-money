// Renders the rig hand props (src/cast/handProps.tsx) to SVG and writes, with the forearm anchors
// of every view, the JSON that cast/tools/add_hand_props.py builds Ebo's master from.
import fs from 'fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {HAND_PROPS, PROP_LAYERS} from '../../src/cast/handProps';
import {handAnchors} from '../../src/cast/RigCharacter';
import {InPropContext} from '../../src/prop';
import {CAST} from '../../src/cast/castConfig';

const out = process.argv[2];
const props = HAND_PROPS.map((e) => ({name: e.name, svg: renderToStaticMarkup(<InPropContext.Provider value>{e.el}</InPropContext.Provider>)}));
fs.writeFileSync(out, JSON.stringify({scale: CAST.ebo.scale, props, layers: PROP_LAYERS, anchors: handAnchors('ebo')}, null, 1));
console.log('wrote', out, props.length, 'props');
