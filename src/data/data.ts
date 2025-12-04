interface DataPoint {
  time: string;
  value: number;
}

function generateRealisticData(totalPoints: number = 1_000_000): DataPoint[] {
  const data: DataPoint[] = [];
  let currentValue = 100; // giá trị khởi tạo
  const startDate = new Date("2020-01-01T00:00:00Z");
  const interval = 60 * 1000; // mỗi điểm cách nhau 1 phút

  for (let i = 0; i < totalPoints; i++) {
    // Tạo xu hướng nhẹ (có thể là tăng, giảm hoặc giữ nguyên)
    const trend = (Math.random() - 0.5) * 0.2; // từ -0.1 đến +0.1

    // Tạo nhiễu ngẫu nhiên
    const noise = (Math.random() - 0.5) * 2; // từ -1 đến +1

    // Cập nhật giá trị hiện tại
    currentValue += trend + noise;

    // Đảm bảo giá trị không âm
    if (currentValue < 0) currentValue = Math.abs(currentValue);

    // Tạo thời gian tương ứng
    const currentTime = new Date(startDate.getTime() + i * interval);

    data.push({
      time: currentTime.toISOString(),
      value: parseFloat(currentValue.toFixed(2)),
    });
  }

  return data;
}

const data = generateRealisticData();

export { data };
