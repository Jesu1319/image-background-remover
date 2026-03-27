"use client";

import { useState, useCallback } from "react";
import { Upload, Download, Loader2, ImageIcon } from "lucide-react";

type ProcessingState = "idle" | "uploading" | "processing" | "done" | "error";

export default function Home() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [state, setState] = useState<ProcessingState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
      const file = "dataTransfer" in e 
        ? e.dataTransfer.files[0] 
        : e.target.files?.[0];

      if (!file) return;

      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setErrorMessage("Please upload a JPG, PNG, or WebP image");
        setState("error");
        return;
      }

      // Read and display original image
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImage(e.target?.result as string);
        setResultImage(null);
        setErrorMessage(null);
      };
      reader.readAsDataURL(file);

      // Process image
      setState("uploading");
      
      try {
        const formData = new FormData();
        formData.append("image", file);

        setState("processing");
        
        const response = await fetch("/api/remove-bg", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to process image");
        }

        setResultImage(data.image);
        setState("done");
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "An error occurred");
        setState("error");
      }
    },
    []
  );

  const handleDownload = useCallback(() => {
    if (!resultImage) return;
    
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = "background-removed.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [resultImage]);

  const reset = useCallback(() => {
    setOriginalImage(null);
    setResultImage(null);
    setState("idle");
    setErrorMessage(null);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900">Background Remover</span>
          </div>
          <a
            href="https://github.com/Jesu1319/image-background-remover"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            GitHub
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl">
          {/* Hero */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Remove Image Background
            </h1>
            <p className="text-gray-600 text-lg">
              Upload your image and get a transparent background in seconds
            </p>
          </div>

          {/* Upload Area */}
          {!originalImage ? (
            <div
              className="relative border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer"
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleImageUpload(e);
              }}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <input
                type="file"
                id="file-input"
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
              />
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-sm text-gray-500">JPG, PNG or WebP (max 10MB)</p>
            </div>
          ) : (
            /* Preview Area */
            <div className="space-y-6">
              {/* Image Comparison */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Original */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border">
                  <p className="text-sm font-medium text-gray-500 mb-3">Original</p>
                  <div className="relative rounded-lg overflow-hidden checkerboard aspect-square flex items-center justify-center bg-gray-100">
                    <img
                      src={originalImage}
                      alt="Original"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </div>

                {/* Result */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border">
                  <p className="text-sm font-medium text-gray-500 mb-3">Result</p>
                  <div className="relative rounded-lg overflow-hidden checkerboard aspect-square flex items-center justify-center bg-gray-100">
                    {state === "processing" || state === "uploading" ? (
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <p className="text-sm">
                          {state === "uploading" ? "Uploading..." : "Removing background..."}
                        </p>
                      </div>
                    ) : resultImage ? (
                      <img
                        src={resultImage}
                        alt="Result"
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : state === "error" ? (
                      <div className="text-red-400 text-center p-4">
                        <p className="text-sm">{errorMessage}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-center gap-4">
                {resultImage && (
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/25"
                  >
                    <Download className="w-5 h-5" />
                    Download PNG
                  </button>
                )}
                <button
                  onClick={reset}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors border"
                >
                  Process Another
                </button>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 text-center border">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Easy Upload</h3>
              <p className="text-sm text-gray-500">Drag and drop or click to upload any image</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center border">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">AI Powered</h3>
              <p className="text-sm text-gray-500">Powered by advanced AI for accurate background removal</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center border">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Download className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Instant Download</h3>
              <p className="text-sm text-gray-500">Get your transparent PNG ready to use</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-6">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-500">
          Powered by Remove.bg API
        </div>
      </footer>
    </div>
  );
}
