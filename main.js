/** global library **/
require('gsap');



window.THREE = require('three');
window.Stats = require('./src/js/vendors/Stats');
window.GUI   = require('dat-gui').GUI;

require('./vendors/postprocessing/EffectComposer');
require('./vendors/postprocessing/ShaderPass');
require('./vendors/postprocessing/RenderPass');
require('./vendors/postprocessing/MaskPass');
require('./vendors/shaders/CopyShader');

require('./sketches/app00/app');
