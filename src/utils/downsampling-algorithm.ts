interface DataPoint {
  time: string;
  value: number;
}

export function lttbDownsample(
  data: DataPoint[],
  threshold: number
): DataPoint[] {
  if (data.length <= threshold) return data;

  const sampled: DataPoint[] = [];
  const bucketSize = (data.length - 2) / (threshold - 2);

  // Giữ điểm đầu tiên
  sampled.push(data[0]);

  let a = 0;
  for (let i = 0; i < threshold - 2; i++) {
    const avgRangeStart = Math.floor((i + 1) * bucketSize) + 1;
    const avgRangeEnd = Math.floor((i + 2) * bucketSize) + 1;
    const rangeTo = Math.min(avgRangeEnd, data.length);

    let avgX = 0;
    let avgY = 0;

    for (let j = avgRangeStart; j < rangeTo; j++) {
      avgX += j;
      avgY += data[j].value;
    }

    avgX /= rangeTo - avgRangeStart;
    avgY /= rangeTo - avgRangeStart;

    const rangeFrom = Math.floor(i * bucketSize) + 1;
    const rangeTo2 = Math.floor((i + 1) * bucketSize) + 1;

    let maxArea = -1;
    let maxAreaPoint = rangeFrom;

    for (let j = rangeFrom; j < rangeTo2; j++) {
      const area = Math.abs(
        (data[a].value - avgY) * (j - a) -
          (data[a].value - data[j].value) * (avgX - a)
      );

      if (area > maxArea) {
        maxArea = area;
        maxAreaPoint = j;
      }
    }

    sampled.push(data[maxAreaPoint]);
    a = maxAreaPoint;
  }

  // Giữ điểm cuối cùng
  sampled.push(data[data.length - 1]);

  return sampled;
}

export function minMaxDownsample(
  data: DataPoint[],
  threshold: number
): DataPoint[] {
  if (data.length <= threshold) return data;

  const sampled: DataPoint[] = [];
  const bucketSize = Math.ceil(data.length / threshold);

  for (let i = 0; i < data.length; i += bucketSize) {
    const bucket = data.slice(i, i + bucketSize);

    // Tìm min, max trong bucket
    let min = bucket[0];
    let max = bucket[0];

    for (const point of bucket) {
      if (point.value < min.value) min = point;
      if (point.value > max.value) max = point;
    }

    // Thêm theo thứ tự thời gian
    if (min.time < max.time) {
      sampled.push(min, max);
    } else {
      sampled.push(max, min);
    }
  }

  return sampled.slice(0, threshold);
}

export function averageDownsample(
  data: DataPoint[],
  threshold: number
): DataPoint[] {
  if (data.length <= threshold) return data;

  const sampled: DataPoint[] = [];
  const bucketSize = Math.ceil(data.length / threshold);

  for (let i = 0; i < data.length; i += bucketSize) {
    const bucket = data.slice(i, i + bucketSize);

    // Tính trung bình
    const sum = bucket.reduce((acc, point) => acc + point.value, 0);
    const avgValue = sum / bucket.length;
    const avgTime = bucket[Math.floor(bucket.length / 2)].time; // lấy thời gian ở giữa

    sampled.push({
      time: avgTime,
      value: avgValue,
    });
  }

  return sampled;
}
