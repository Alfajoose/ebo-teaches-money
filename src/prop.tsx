import React, {createContext, useContext} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Rough} from './handDrawn';
import {NoScaleContext} from './noScale';
import {CameraContext, hash, IDENT, mmul, parseTransform, useCapture, useLayerMode} from './series/exportCtx';

/**
 * Every prop (vending machine, can, coin, crate, …) wraps its drawing in <Prop>.
 * Props are kept apart from the set:
 *   - in the video they draw hand-drawn (see handDrawn.tsx);
 *   - in a 'set' render they disappear, so the Animate "Background" layer is the set only;
 *   - in an Animate capture they report their drawing and screen placement, so the
 *     export rebuilds them as editable vector symbols on their own "Props" layers.
 *
 * The drawing's outer `<g transform>` (its x / y / rotate / scale) becomes the symbol
 * instance's matrix, so a prop that only moves or turns stays one symbol.
 * A prop inside another prop (cans in the machine) is part of its parent's drawing.
 */
const InPropContext = createContext(false);

export const Prop: React.FC<{name: string; children: React.ReactElement}> = ({name, children}) => {
  const inProp = useContext(InPropContext);
  const mode = useLayerMode();
  const cap = useCapture();
  const cam = useContext(CameraContext);
  const noScale = useContext(NoScaleContext);
  if (inProp) return children;
  if (mode === 'set') return null;
  if (cap) {
    const svg = renderToStaticMarkup(<NoScaleContext.Provider value={noScale}>{children}</NoScaleContext.Provider>);
    const outer = /^<g transform="([^"]*)">([\s\S]*)<\/g>$/.exec(svg);
    const local = outer ? parseTransform(outer[1]) : IDENT;
    const inner = outer ? outer[2] : svg;
    cap.props.push({name, key: `${name}:${hash(inner)}`, matrix: mmul(cam, local), svg: `<g>${inner}</g>`, front: cap.chars.length > 0});
  }
  return (
    <InPropContext.Provider value>
      <Rough>{children}</Rough>
    </InPropContext.Provider>
  );
};
