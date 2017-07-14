import React from 'react';
import ReactGauge from 'react-gauge-test';
import Page from '../Page/Page';

const range7 = [{
  start: 0,
  end: 1 / 7,
  color: '#f00',
},
{
  start: 1 / 7,
  end: 2 / 7,
  color: '#ff7f00',
},
{
  start: 2 / 7,
  end: 3 / 7,
  color: '#ffff00',
},
{
  start: 3 / 7,
  end: 4 / 7,
  color: '#00bc3f',
},
{
  start: 4 / 7,
  end: 5 / 7,
  color: '#0068ff',
},
{
  start: 5 / 7,
  end: 6 / 7,
  color: '#7a00e5',
},
{
  start: 6 / 7,
  end: 1,
  color: '#bc31fe',
}];
const Privacy = () => (
  <div className="Privacy">
    <ReactGauge
      isInnerNumbers={false}
      arrowValue={4 / 6}
      aperture={180}
      arcStrokeWidth={10}
      marks={['dont\nuse', 'outdated', 'complicated', 'balanced', 'popular', 'viral', 'sliced\nbread']}
      svgContainerHeight={250}
      ranges={range7}
    />
    <Page
      title="Privacy Policy"
      subtitle="Last updated May 29th, 2017"
      page="privacy"
    />
  </div>
);

export default Privacy;
