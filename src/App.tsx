// CSS Fix: Vite/Bun এর জন্য লোকাল ফাইল import (যদি আপনি এই ফাইল দুটি তৈরি করে থাকেন)
import "./AnnotationLayer.css";
import "./TextLayer.css";

import { PDFDocument } from "pdf-lib";
import { useState } from "react"; // ⭐ useMemo যোগ করা হয়েছে
import { pdfjs } from "react-pdf";
import InputText from "./InputText";
import PDFList from "./PDFList";
import TButton from "./TButton";
import { renderPageToImage } from "./utils";

// PDF.js ইনস্টল করা

pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;
// ------------------------------------------------------------------

// console.log(pdfjs.version);

// Utility to generate a unique ID for drag-and-drop stability
const generateUniqueId = (prefix = "id") =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

function MergeButton({ pdfs }) {
  const mergePDFs = async () => {
    if (pdfs.length === 0 || pdfs.every((p) => p.pages.length === 0)) {
      alert("Please upload PDFs and arrange pages first.");
      return;
    }

    const merged = await PDFDocument.create();

    // প্রতিবার মার্জিং শুরু হলে, নতুন করে সাজানো PDFS লুপ করা হয়
    for (const pdf of pdfs) {
      // ⭐ চূড়ান্ত ফিক্স: pdf.bytes এর নতুন কপি ব্যবহার করা
      // এটি নিশ্চিত করে যে pdf-lib সবসময় একটি Attached Uint8Array পাচ্ছে,
      // যা Drag/Drop এর পরেও স্থিতিশীল থাকে।
      const freshBytes = pdf.bytes.slice();

      const src = await PDFDocument.load(freshBytes);

      // pdf.pages লিস্ট এখন নতুন ক্রম অনুযায়ী আছে
      for (const p of pdf.pages) {
        // p.pageIndex (মূল PDF-এ পেজটির আসল অবস্থান) ব্যবহার করা হচ্ছে
        const [page] = await merged.copyPages(src, [p.pageIndex]);
        merged.addPage(page);
      }
    }

    const bytes = await merged.save();
    download(bytes, "final_merged_document.pdf");
  };

  return (
    <TButton
      onClick={mergePDFs}
      disabled={pdfs.length === 0 || pdfs.every((p) => p.pages.length === 0)}
      style={{ marginTop: 20 }}
    >
      🚀 Merge & Download Final PDF
    </TButton>
  );
}

// এই ফিক্সটি প্রয়োগ করে দেখুন।
// যদি এখনো কাজ না করে, তবে আপনার App.tsx ফাইল থেকে
// MergeButton এবং download ফাংশনসহ সম্পূর্ণ App কম্পোনেন্টটি আবার দিন।

function download(bytes, filename) {
  const blob = new Blob([bytes], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function App() {
  const [pdfs, setPdfs] = useState([]);

  const uploadPDFs = async (e) => {
    const files = [...e.target.files];

    const loaded = await Promise.all(
      files.map(async (file) => {
        const bytes = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(bytes);
        const pdfId = generateUniqueId("pdf");

        const pdfJsBytes = bytes; // মূল Uint8Array বাইট
        const pageIndices = pdfDoc.getPageIndices();

        const pages = [];
        for (let index = 0; index < pageIndices.length; index++) {
          const p = pageIndices[index];

          // ⭐ CRITICAL FIX: Uint8Array-এর একটি নতুন কপি তৈরি করুন
          // Slice() ব্যবহার করলে Uint8Array ডেটার একটি Shallow Copy তৈরি হয়,
          // যা Worker-এ নতুনভাবে ট্রান্সফার করা যেতে পারে।
          const bytesToRender = pdfJsBytes.slice();

          // এই নতুন কপিটি renderPageToImage ফাংশনে পাঠান
          const imgDataUrl = await renderPageToImage(bytesToRender, p);

          pages.push({
            pageIndex: p,
            id: generateUniqueId(`page-${pdfId}-${index}`),
            imgDataUrl: imgDataUrl,
          });
        }

        return {
          name: file.name,
          bytes: pdfJsBytes, // pdf-lib এর জন্য মূল বাইট ব্যবহার করা হচ্ছে
          pdfId,
          numPages: pageIndices.length,
          pages: pages,
        };
      })
    );

    setPdfs([...pdfs, ...loaded]);
  };

  console.log(pdfjs);

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>
      <h2 style={{ borderBottom: "2px solid #eee", paddingBottom: 10 }}>
        📄 PDF Page Arranger & Merger
      </h2>
      <div style={{ marginBottom: 20 }}>
        <label>
          <TButton
            type="button"
            onClick={() => document.getElementById("upload").click()}
            as="span"
            style={{ marginRight: 15 }}
          >
            Upload PDFs
          </TButton>
          <InputText // ⭐ আপনার ইনপুট কম্পোনেন্ট
            type="file"
            accept="application/pdf"
            multiple
            onChange={uploadPDFs}
            style={{ display: "none" }}
          />
        </label>
      </div>
      <PDFList pdfs={pdfs} setPdfs={setPdfs} />
      <MergeButton pdfs={pdfs} />
    </div>
  );
}

export default App;
