const LEFT_EYE = {
  outer: 33,
  inner: 133,
  upperA: 159,
  lowerA: 145,
  upperB: 158,
  lowerB: 153
};

const RIGHT_EYE = {
  outer: 362,
  inner: 263,
  upperA: 386,
  lowerA: 374,
  upperB: 385,
  lowerB: 380
};

function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function eyeEAR(landmarks, indexes) {
  const horizontal = distance(landmarks[indexes.outer], landmarks[indexes.inner]);
  const verticalA = distance(landmarks[indexes.upperA], landmarks[indexes.lowerA]);
  const verticalB = distance(landmarks[indexes.upperB], landmarks[indexes.lowerB]);
  if (!horizontal) return 0;
  return (verticalA + verticalB) / (2 * horizontal);
}

export function calculateEyeMetrics(landmarks) {
  const leftEAR = eyeEAR(landmarks, LEFT_EYE);
  const rightEAR = eyeEAR(landmarks, RIGHT_EYE);
  const averageEAR = (leftEAR + rightEAR) / 2;
  return { leftEAR, rightEAR, averageEAR };
}

export function smoothValue(previous, next, weight = 0.65) {
  if (previous == null) return next;
  return previous * weight + next * (1 - weight);
}
