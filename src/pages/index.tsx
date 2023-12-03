import Head from "next/head";
import { useEffect, useState, useRef } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";
import Webcam from "react-webcam";
import { UserButton } from "@clerk/nextjs";

export default function Home() {
  const webcamRef = useRef<Webcam | null>(null);

  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);

  async function loadModel() {
    try {
      const model = await cocoSsd.load();
      setModel(model);
      console.log("Model loaded");
    } catch (err) {
      console.log(err);
      console.log("failed load model");
    }
  }

  useEffect(() => {
    void (async () => {
      await tf.ready();
      await loadModel();
    })();
  }, []);

  useEffect(() => {
    let req: number | null = null;

    async function predictionFunction() {
      req = requestAnimationFrame(() => {
        void (async () => {
          await predictionFunction();
        })();
      });

      if (!model || !webcamRef.current?.video) {
        console.log(model, webcamRef);
        return;
      }

      const predictions = await model.detect(webcamRef.current.video);
      const cnvs = document.getElementById("myCanvas") as HTMLCanvasElement;
      cnvs.width = webcamRef.current.video.videoWidth;
      cnvs.height = webcamRef.current.video.videoHeight;

      const ctx = cnvs.getContext("2d");
      if (!ctx) return; // fix for 'ctx' is possibly 'null'
      ctx.clearRect(
        0,
        0,
        webcamRef.current.video.videoWidth,
        webcamRef.current.video.videoHeight,
      );

      if (predictions.length > 0) {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let n = 0; n < predictions.length; n++) {
          // Check scores
          // console.log(n);
          if (predictions[n]!.score > 0.8) {
            const bboxLeft = predictions[n]!.bbox[0]; // fix for 'bboxLeft' is never reassigned
            const bboxTop = predictions[n]!.bbox[1]; // fix for 'bboxTop' is never reassigned
            const bboxWidth = predictions[n]!.bbox[2]; // fix for 'bboxWidth' is never reassigned
            const bboxHeight = predictions[n]!.bbox[3]; // fix for 'bboxHeight' is never reassigned

            // console.log("bboxLeft: " + bboxLeft);
            // console.log("bboxTop: " + bboxTop);

            // console.log("bboxWidth: " + bboxWidth);
            // console.log("bboxHeight: " + bboxHeight);

            ctx.beginPath();
            ctx.font = "bold 28px Arial"; // fix for 'ctx' is possibly 'null'
            ctx.fillStyle = "red";

            ctx.fillText(predictions[n]!.class, bboxLeft, bboxTop - 20);

            ctx.rect(bboxLeft, bboxTop, bboxWidth, bboxHeight);
            ctx.strokeStyle = "#FF0000";

            ctx.lineWidth = 3;
            ctx.stroke();

            // console.log("detected");
          }
        }
      }
    }

    if (model) void predictionFunction();

    return () => {
      if (req) {
        cancelAnimationFrame(req);
      }
    };
  }, [model]);

  return (
    <>
      <Head>
        <title>POC React Tensorflow</title>
        <meta name="description" content="Sadman Yasar Sayem" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* <header>
        <UserButton afterSignOutUrl="/" />
      </header> */}
      <main className="flex min-h-screen flex-col bg-gray-800">
        <div className="relative mx-auto w-full max-w-xl">
          <div className="container absolute top-0">
            {!model && <div className="text-2xl text-white">Loading</div>}
            <Webcam id="img" ref={webcamRef} />
          </div>
          {model && (
            <div className="absolute top-0 z-[9999] text-white opacity-50">
              <canvas id="myCanvas" className="w-full" />
            </div>
          )}
        </div>
      </main>
    </>
  );
}
