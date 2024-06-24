import * as ort from 'onnxruntime-web/webgpu';
import { hardNms } from './faceutils';

export function preprocess(imageData, targetWidth = 320, targetHeight = 240) {
  const { data, width, height } = imageData;

  const imageMean = [127, 127, 127];
  const std = 128;
  const float32Data = new Float32Array(3 * width * height);

  for (let i = 0, len = data.length; i < len; i += 4) {
    const pixelIndex = i / 4;
    const rIndex = pixelIndex + width * height * 0;
    const gIndex = pixelIndex + width * height * 1;
    const bIndex = pixelIndex + width * height * 2;

    float32Data[rIndex] = (data[i] - imageMean[0]) / std;
    float32Data[gIndex] = (data[i + 1] - imageMean[1]) / std;
    float32Data[bIndex] = (data[i + 2] - imageMean[2]) / std;
  }

  return new ort.Tensor('float32', float32Data, [1, 3, height, width]);
}

export async function processOutputs(session, inputTensor, canvas) {
  const inputName = session.inputNames[0];
  const outputs = await session.run({ [inputName]: inputTensor });

  const boxesTensor = outputs['boxes'];
  const scoresTensor = outputs['scores'];
  const boxes = new Float32Array(boxesTensor.data.buffer);
  const scores = new Float32Array(scoresTensor.data.buffer);

  const preparedData = [];
  for (let i = 0; i < scores.length / 2; i++) {
    const score = scores[i * 2 + 1];
    if (score > 0.5) {
      const offset = i * 4;
      const box = [
        boxes[offset] * canvas.width,
        boxes[offset + 1] * canvas.height,
        boxes[offset + 2] * canvas.width,
        boxes[offset + 3] * canvas.height
      ];
      preparedData.push([...box, score]);
    }
  }

  const results = hardNms(preparedData, 0.5);
  const finalResults = results.map(res => ({ box: res.slice(0, 4), score: res[4] }));
  // console.log('Final results (boxes and scores):', finalResults); // Debugging
  return finalResults;
}
