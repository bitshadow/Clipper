import { useCallback, useEffect, useRef } from "react";

function animateBars(
  analyser: any,
  canvas: any,
  canvasCtx: any,
  dataArray: any,
  isPlaying: boolean,
) {
  if (!isPlaying) return;
  let bars = 100;

  // Draw Background
  canvasCtx.fillStyle = "black";
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

  // Analyze the audio data using the Web Audio API's `getByteFrequencyData` method.
  analyser.getByteFrequencyData(dataArray);
  // Set the canvas fill style to black.
  canvasCtx.fillStyle = "black";
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

  canvasCtx.font = "500 24px Helvetica Neue";
  const avg =
    new Array(255)
      .fill(0)
      .map((_, i) => i + 1)
      .reduce((acc, curr) => acc + dataArray[curr], 0) / 255;
  canvasCtx.fillStyle = "rgb(" + 200 + ", " + (200 - avg) + ", " + avg + ")";
  canvasCtx.textAlign = "center";
  canvasCtx.textBaseline = "top";
  canvasCtx.fillText("1B", canvas.width / 2, canvas.height / 2 - 25);
  canvasCtx.fillText("STUDIO", canvas.width / 2, canvas.height / 2 + 6);

  const HEIGHT = canvas.height;
  var barWidth = Math.ceil(canvas.width / bars) * 2.5;

  let barHeight;
  let x = 0;

  for (var i = 0; i < bars; i++) {
    barHeight = (dataArray[i] / 255) * HEIGHT * 0.5;

    let color =
      "rgb(" + 200 + ", " + (200 - dataArray[i]) + ", " + dataArray[i] + ")";

    // Set the canvas fill style to the random RGB values.
    canvasCtx.fillStyle = color;

    // Draw the bar on the canvas at the current x-position and with the calculated height and width.
    canvasCtx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

    // Update the x-position for the next bar.
    x += barWidth + 1;
  }
}

function animateCircle(
  analyser: any,
  canvas: any,
  canvasCtx: any,
  dataArray: any,
  isPlaying: boolean,
) {
  if (!isPlaying) return;

  let radius = 75;
  let bars = 100;

  // Draw Background
  canvasCtx.fillStyle = "black";
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw circle
  canvasCtx.beginPath();
  canvasCtx.arc(canvas.width / 2, canvas.height / 2, radius, 0, 2 * Math.PI);
  canvasCtx.stroke();
  analyser.getByteFrequencyData(dataArray);

  // Draw label
  canvasCtx.font = "500 24px Helvetica Neue";
  const avg =
    new Array(255)
      .fill(0)
      .map((_, i) => i + 1)
      .reduce((acc, curr) => acc + dataArray[curr], 0) / 255;
  canvasCtx.fillStyle = "rgb(" + 200 + ", " + (200 - avg) + ", " + avg + ")";
  canvasCtx.textAlign = "center";
  canvasCtx.textBaseline = "top";
  canvasCtx.fillText("1B", canvas.width / 2, canvas.height / 2 - 25);
  canvasCtx.fillText("STUDIO", canvas.width / 2, canvas.height / 2 + 6);

  // Draw bars
  for (var i = 0; i < bars; i++) {
    let radians = (Math.PI * 2) / bars;
    let bar_height = dataArray[i] * 0.5;

    let x = canvas.width / 2 + Math.cos(radians * i) * radius;
    let y = canvas.height / 2 + Math.sin(radians * i) * radius;
    let x_end =
      canvas.width / 2 + Math.cos(radians * i) * (radius + bar_height);
    let y_end =
      canvas.height / 2 + Math.sin(radians * i) * (radius + bar_height);
    let color =
      "rgb(" + 200 + ", " + (200 - dataArray[i]) + ", " + dataArray[i] + ")";
    canvasCtx.strokeStyle = color;
    canvasCtx.lineWidth = 3;
    canvasCtx.beginPath();
    canvasCtx.moveTo(x, y);
    canvasCtx.lineTo(x_end, y_end);
    canvasCtx.stroke();
  }
}

export const WaveForm = ({ analyzerData, isPlaying }: any) => {
  // Ref for the canvas element
  const canvasRef = useRef(null);
  const { dataArray, analyzer } = analyzerData;

  // Function to draw the waveform
  const draw = useCallback(
    (dataArray: any, analyzer: any) => {
      const canvas: any = canvasRef.current;
      if (!canvas || !analyzer) return;
      const canvasCtx = canvas.getContext("2d");

      const animate = () => {
        requestAnimationFrame(animate);
        canvas.width = canvas.width;
        animateCircle(analyzer, canvas, canvasCtx, dataArray, isPlaying);
        // animateBars(analyzer, canvas, canvasCtx, dataArray, isPlaying);
      };

      animate();
    },
    [isPlaying],
  );

  // Effect to draw the waveform on mount and update
  useEffect(() => {
    draw(dataArray, analyzer);
  }, [dataArray, analyzer, draw]);

  // Return the canvas element
  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={400}
      style={{ background: "black" }}
    />
  );
};
