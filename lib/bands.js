// Shared semantic vocabulary. Reuse these exact hexes so meaning
// transfers between AEG dashboards.
export const BAND_COLOR = {
  red:    '#D22B2B',  // failing / breached
  orange: '#E08A1E',  // at risk / imminent
  yellow: '#D9BC1F',  // acceptable
  green:  '#2E8B57',  // healthy
  pink:   '#E85D9E',  // exceptional / outlier-high
  none:   '#9AA0A6',  // not measurable / no basis
};

export const SEVERITY = {
  alert: '#98012E',
  watch: '#B08D57',
  info:  '#4A6D7C',
};

// Chart categorical palette, fixed order, cycled by index.
export const PALETTE = ['#98012E', '#C1355A', '#B08D57', '#4A6D7C', '#7A6F70', '#5B7553'];
export const MAROON = '#98012E';
export const CHARCOAL = '#21201E';

// How an employee's salary sits against their band.
export const ALIGN = {
  ok:    { label: 'Within band',      color: BAND_COLOR.green,  glyph: '●' },
  above: { label: 'Above band',       color: BAND_COLOR.orange, glyph: '▲' },
  below: { label: 'Below band',       color: BAND_COLOR.red,    glyph: '▼' },
  none:  { label: 'No scale defined', color: BAND_COLOR.none,   glyph: '○' },
};

export const ALIGN_RULE =
  'Within band: pay sits between YR1 and YR5 · Above band: pay exceeds YR5 · ' +
  'Below band: pay is under YR1 · No scale defined: this job title has no published band';
