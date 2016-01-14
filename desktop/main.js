/** global library **/
require('gsap');



window.THREE = require('three');
window.Stats = require('./src/js/vendors/Stats');

require('./vendors/postprocessing/EffectComposer');
require('./vendors/postprocessing/ShaderPass');
require('./vendors/postprocessing/RenderPass');
require('./vendors/postprocessing/MaskPass');
require('./vendors/shaders/CopyShader');

require('./app/app');
