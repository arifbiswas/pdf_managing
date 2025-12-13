// utils.ts
import { pdfjs } from "react-pdf";

async function renderPageToImage(pdfBytes, pageIndex, scale = 0.5) {
  let pdfDoc;

  try {
    // ⭐ 1. Data URL-এর জন্য pdfjs-কে Worker-এ ডেটা পাস করার সঠিক পদ্ধতি
    const pdfData = { data: pdfBytes };

    // 2. PDF ডকুমেন্ট লোড করা
    // pdfjs.getDocument কলটি প্রতিটি পেজ রেন্ডার করার জন্য একই Worker ব্যবহার করার চেষ্টা করবে
    pdfDoc = await pdfjs.getDocument(pdfData).promise;

    // 3. নির্দিষ্ট পেজ নেওয়া
    const page = await pdfDoc.getPage(pageIndex + 1);

    // 4. ভিউপোর্ট এবং ক্যানভাস তৈরি
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    const canvasContext = canvas.getContext("2d");

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // 5. রেন্ডার করা
    const renderContext = {
      canvasContext,
      viewport,
    };

    await page.render(renderContext).promise;

    // 6. Data URL জেনারেট
    const imgDataUrl = canvas.toDataURL("image/jpeg", 0.8);

    // ⭐ 7. CRITICAL: প্রতি পেজ রেন্ডার শেষে ডকুমেন্ট ডিসট্রয় করা
    // এটি নিশ্চিত করে যে Worker পরবর্তী পেজের জন্য প্রস্তুত।
    pdfDoc.destroy();

    return imgDataUrl;
  } catch (error) {
    console.error(`Error rendering page ${pageIndex + 1} to image:`, error);
    if (pdfDoc) {
      // যদি রেন্ডারিং ব্যর্থ হয়, তবুও পরিষ্কার করা
      pdfDoc.destroy();
    }
    // ত্রুটি হলে একটি খালি ইমেজ Data URL ফেরত দেওয়া
    return "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNjAiIGhlaWdodD0iMTcwIiB2aWV3Qm94PSIwIDAgMTYwIDE3MCI+PHJlY3Qgd2lkdGg9IjE2MCIgaGVpZ2h0PSIxNzAiIGZpbGw9IiNmZmVkZWQiLz48dGV4dCB4PSI4MCIgeT0iODUiIGZpbGw9IiNjYzAiIGZvbnQtZmFtaWx5PSJTYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjVlbSI+RXJyb3IgTG9hZGluZzwvdGV4dD48L3N2Zz4=";
  }
}

const generateUniqueId = (prefix = "id") =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export { generateUniqueId, renderPageToImage };
