import { AnimatePresence, motion } from "framer-motion";
import { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRef, useState } from "react";
import CountUp from "react-countup";
import { CompareSlider } from "../components/CompareSlider";
import Footer from "../components/Footer";
import Header from "../components/Header";
import LoadingDots from "../components/LoadingDots";
import ResizablePanel from "../components/ResizablePanel";
import Toggle from "../components/Toggle";
import appendNewToName from "../utils/appendNewToName";
import downloadPhoto from "../utils/downloadPhoto";
import { ImageModel, Img2ImgModel } from "@visheratin/web-ai";

const Home: NextPage = () => {
  const [originalPhoto, setOriginalPhoto] = useState<string | null>(null);
  const [restoredImage, setRestoredImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [restoredLoaded, setRestoredLoaded] = useState<boolean>(false);
  const [sideBySide, setSideBySide] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const fileSelectRef = useRef<HTMLInputElement>(null);

  const FileSelector = () => (
    <div>
      <input
        className="w-full bg-black rounded-full text-white font-medium px-4 pt-2 pb-3 mt-8 hover:bg-black/80 w-90"
        type="file"
        ref={fileSelectRef}
        onChange={processImage}
      />
    </div>
  );

  const processImage = () => {
    if (
      fileSelectRef.current &&
      fileSelectRef.current.files &&
      fileSelectRef.current.files[0]
    ) {
      var reader = new FileReader();
      reader.onload = async () => {
        if (
          fileSelectRef.current &&
          fileSelectRef.current.files &&
          fileSelectRef.current.files[0]
        ) {
          setPhotoName(fileSelectRef.current.files[0].name);
          setOriginalPhoto(URL.createObjectURL(fileSelectRef.current.files[0]));
          generatePhoto(reader.result as ArrayBuffer);
        }
      };
      reader.readAsArrayBuffer(fileSelectRef.current.files[0]);
    }
  };

  async function generatePhoto(fileData: ArrayBuffer) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setLoading(true);
    const result = await ImageModel.create("superres-compressed-x4");
    console.log(`Model loaded in ${result.elapsed} seconds.`);
    const model = result.model as Img2ImgModel;
    const restored = await model.process(fileData, 300);
    console.log(`Photo restored in ${restored.elapsed} seconds.`);
    const renderCanvas = document.createElement("canvas");
    renderCanvas.width = restored.data.width;
    renderCanvas.height = restored.data.height;
    const renderCtx = renderCanvas.getContext("2d");
    renderCtx!.putImageData(restored.data, 0, 0);
    const imgData = renderCanvas.toDataURL("image/png");
    setRestoredImage(imgData);
    setLoading(false);
  }

  return (
    <div className="flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Head>
        <title>Restore Photos</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-4 sm:mb-0 mb-8">
        <a
          href="https://nutlope.substack.com"
          target="_blank"
          rel="noreferrer"
          className="border rounded-2xl py-1 px-4 text-slate-500 text-sm mb-5 hover:scale-105 transition duration-300 ease-in-out"
        >
          Want to support this project? Subscribe to{" "}
          <span className="font-semibold">my newsletter</span>.
        </a>
        <h1 className="mx-auto max-w-4xl font-display text-4xl font-bold tracking-normal text-slate-900 sm:text-6xl mb-5">
          Restore any photo
        </h1>
        <p className="text-slate-500">
          The process may take a couple of minutes. Please be patient.
        </p>
        <ResizablePanel>
          <AnimatePresence exitBeforeEnter>
            <motion.div className="flex justify-between items-center w-full flex-col mt-4">
              <Toggle
                className={`${restoredLoaded ? "visible" : "invisible"} mb-6`}
                sideBySide={sideBySide}
                setSideBySide={(newVal) => setSideBySide(newVal)}
              />
              {restoredLoaded && sideBySide && (
                <CompareSlider
                  original={originalPhoto!}
                  restored={restoredImage!}
                />
              )}
              {!originalPhoto && <FileSelector />}
              {originalPhoto && !restoredImage && (
                <Image
                  alt="original photo"
                  src={originalPhoto}
                  className="rounded-2xl"
                  width={475}
                  height={475}
                />
              )}
              {restoredImage && originalPhoto && !sideBySide && (
                <div className="flex sm:space-x-4 sm:flex-row flex-col">
                  <div>
                    <h2 className="mb-1 font-medium text-lg">Original Photo</h2>
                    <Image
                      alt="original photo"
                      src={originalPhoto}
                      className="rounded-2xl relative"
                      width={475}
                      height={475}
                    />
                  </div>
                  <div className="sm:mt-0 mt-8">
                    <h2 className="mb-1 font-medium text-lg">Restored Photo</h2>
                    <a href={restoredImage} target="_blank" rel="noreferrer">
                      <Image
                        alt="restored photo"
                        src={restoredImage}
                        className="rounded-2xl relative sm:mt-0 mt-2 cursor-zoom-in"
                        width={475}
                        height={475}
                        onLoadingComplete={() => setRestoredLoaded(true)}
                      />
                    </a>
                  </div>
                </div>
              )}
              {loading && (
                <button
                  disabled
                  className="bg-black rounded-full text-white font-medium px-4 pt-2 pb-3 mt-8 hover:bg-black/80 w-40"
                >
                  <span className="pt-4">
                    <LoadingDots color="white" style="large" />
                  </span>
                </button>
              )}
              {error && (
                <div
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mt-8"
                  role="alert"
                >
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
              <div className="flex space-x-2 justify-center">
                {originalPhoto && !loading && (
                  <button
                    onClick={() => {
                      setOriginalPhoto(null);
                      setRestoredImage(null);
                      setRestoredLoaded(false);
                      setError(null);
                    }}
                    className="bg-black rounded-full text-white font-medium px-4 py-2 mt-8 hover:bg-black/80 transition"
                  >
                    Upload New Photo
                  </button>
                )}
                {restoredLoaded && (
                  <button
                    onClick={() => {
                      downloadPhoto(
                        restoredImage!,
                        appendNewToName(photoName!)
                      );
                    }}
                    className="bg-white rounded-full text-black border font-medium px-4 py-2 mt-8 hover:bg-gray-100 transition"
                  >
                    Download Restored Photo
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </ResizablePanel>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
