// faceutils.js

export function areaOf(leftTop, rightBottom) {
    const width = Math.max(0, rightBottom[0] - leftTop[0]);
    const height = Math.max(0, rightBottom[1] - leftTop[1]);
    return width * height;
}

export function iouOf(boxes0, boxes1, eps = 1e-5) {
    const overlapLeftTop = [Math.max(boxes0[0], boxes1[0]), Math.max(boxes0[1], boxes1[1])];
    const overlapRightBottom = [Math.min(boxes0[2], boxes1[2]), Math.min(boxes0[3], boxes1[3])];
    const overlapArea = areaOf(overlapLeftTop, overlapRightBottom);
    const area0 = areaOf([boxes0[0], boxes0[1]], [boxes0[2], boxes0[3]]);
    const area1 = areaOf([boxes1[0], boxes1[1]], [boxes1[2], boxes1[3]]);
    return overlapArea / (area0 + area1 - overlapArea + eps);
}

export function hardNms(boxScores, iouThreshold, topK = -1) {
    let scores = boxScores.map(e => e[4]);
    let indices = scores.map((score, index) => index)
                        .sort((a, b) => scores[b] - scores[a]);
    let picked = [];
    while (indices.length > 0) {
        const current = indices.pop();
        picked.push(current);
        if (topK > 0 && picked.length === topK) break;
        indices = indices.filter(index => {
            const currentBox = boxScores[current];
            const indexBox = boxScores[index];
            return iouOf(currentBox, indexBox) <= iouThreshold;
        });
    }
    return picked.map(index => boxScores[index]);
}

export function drawBoundingBoxes(canvas, detections) {
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas first
    context.strokeStyle = 'red';
    context.lineWidth = 2;

    detections.forEach(det => {
        const [x1, y1, x2, y2] = det.box;
        context.beginPath();
        context.rect(x1, y1, x2 - x1, y2 - y1);
        context.stroke();
        // console.log(`Drawing box: ${x1}, ${y1}, ${x2}, ${y2}`); // Log each box being drawn
    });
}



  