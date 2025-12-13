// src/components/PDFList.tsx (dnd-kit এর জন্য)

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

import PageThumbnail from "./PageThumbnail";

function PDFList({ pdfs, setPdfs }) {
  // Dnd-kit এর জন্য PointerSensor ব্যবহার
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // ছোট দূরত্ব অতিক্রম করলেই ড্র্যাগ শুরু
      },
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    // ⭐ NOTE: dnd-kit এ পেজ ID ব্যবহার করা হয়
    if (active.id !== over.id) {
      // 1. কোন PDF থেকে আসছে এবং কোথায় যাচ্ছে তা খুঁজে বের করা
      let sourcePdfIndex = -1;
      let destinationPdfIndex = -1;
      let activePageIndex = -1;
      let overPageIndex = -1;

      // সমস্ত PDF এর মধ্যে লুপ করে active এবং over আইটেমগুলির অবস্থান খুঁজে বের করা
      pdfs.forEach((pdf, pdfIndex) => {
        pdf.pages.forEach((page, pageIndex) => {
          if (page.id === active.id) {
            sourcePdfIndex = pdfIndex;
            activePageIndex = pageIndex;
          }
          if (page.id === over.id) {
            destinationPdfIndex = pdfIndex;
            overPageIndex = pageIndex;
          }
        });
      });

      if (sourcePdfIndex === -1 || destinationPdfIndex === -1) return;

      const newPdfs = [...pdfs];

      // একই PDF এর মধ্যে sorting হলে
      if (sourcePdfIndex === destinationPdfIndex) {
        newPdfs[sourcePdfIndex].pages = arrayMove(
          newPdfs[sourcePdfIndex].pages,
          activePageIndex,
          overPageIndex
        );
      } else {
        // ভিন্ন PDF এর মধ্যে পেজ সরিয়ে নেওয়া
        const [movedPage] = newPdfs[sourcePdfIndex].pages.splice(
          activePageIndex,
          1
        );
        newPdfs[destinationPdfIndex].pages.splice(overPageIndex, 0, movedPage);
      }

      setPdfs(newPdfs);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter} // সবচেয়ে কাছাকাছি আইটেম চিহ্নিত করা
      onDragEnd={handleDragEnd}
    >
      <div style={{ marginTop: 20 }}>
        {pdfs.map((pdf) => (
          <div
            key={pdf.pdfId}
            style={{
              marginBottom: 30,
              padding: 15,
              border: "1px solid #eee",
              borderRadius: "8px",
            }}
          >
            <h4
              style={{
                color: "#333",
                borderBottom: "1px dashed #ddd",
                paddingBottom: 10,
              }}
            >
              📁 **{pdf.name}** ({pdf.pages.length} pages)
            </h4>

            {/* ⭐ SortableContext ব্যবহার করা হয়েছে */}
            <SortableContext
              items={pdf.pages.map((p) => p.id)} // প্রতিটি পেজের ID array
              strategy={horizontalListSortingStrategy} // horizontal গ্রিডের জন্য
            >
              <div
                style={{
                  backgroundColor: "#f9f9f9",
                  borderRadius: "6px",
                  padding: "10px",
                  minHeight: "270px",
                }}
              >
                {/* ⭐ র‍্যাপার ডিভ: গ্রিড লেআউটের জন্য */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "flex-start",
                    alignContent: "flex-start",
                    width: "100%",
                    position: "relative",
                  }}
                >
                  {pdf.pages.map((page, i) => (
                    <PageThumbnail
                      page={page}
                      index={i}
                      pdf={pdf}
                      key={page.id}
                    />
                  ))}
                </div>
              </div>
            </SortableContext>
          </div>
        ))}
      </div>
    </DndContext>
  );
}

export default PDFList;
