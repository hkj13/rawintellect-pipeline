import React from 'react';
import {Composition, staticFile} from 'remotion';
import {Short} from './Short';
import {ShortProps, Timeline} from './types';

const FPS = 30;

export const Root: React.FC = () => (
  <Composition
    id="Short"
    component={Short}
    width={1080}
    height={1920}
    fps={FPS}
    durationInFrames={FPS * 30}
    defaultProps={{id: '001-blind-spot', timeline: null} satisfies ShortProps}
    calculateMetadata={async ({props}) => {
      const res = await fetch(staticFile(`${props.id}/timeline.json`));
      const timeline = (await res.json()) as Timeline;
      return {
        durationInFrames: Math.ceil(timeline.duration * FPS),
        props: {...props, timeline},
      };
    }}
  />
);
