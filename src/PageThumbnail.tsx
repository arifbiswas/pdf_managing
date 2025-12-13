import { CSS } from "@dnd-kit/utilities";
// src/components/PageThumbnail.tsx (dnd-kit এর জন্য)
import { useSortable } from "@dnd-kit/sortable";

const getPageStyle = (isDragging) => ({
  margin: 10,
  borderRadius: "8px",
  boxShadow: isDragging
    ? "0 4px 8px rgba(0, 123, 255, 0.5)"
    : "0 2px 4px rgba(0,0,0,0.1)",
  transition: "box-shadow 0.2s, border 0.2s",
  backgroundColor: "#fff",
  position: "relative",
  cursor: "grab",
  border: isDragging ? "2px solid #007bff" : "1px solid #ccc",

  // স্থির সাইজ
  width: 160,
  height: 170,
  flexShrink: 0,

  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
});

const PageThumbnail = ({ page, index }) => {
  // DND-KIT এর জন্য ID হলো page.id
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1, // Dragging opacity
    zIndex: isDragging ? 2000 : 1, // Dragging elevation
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...getPageStyle(isDragging),
        ...style,
        height: 170, // স্থির উচ্চতা বজায় রাখা
      }}
      {...attributes}
      {...listeners} // ড্র্যাগ হ্যান্ডেল
    >
      <div
        style={{
          position: "absolute",
          top: 5,
          left: 5,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          color: "white",
          padding: "2px 6px",
          borderRadius: "4px",
          fontSize: "12px",
          zIndex: 10,
        }}
      >
        P. {page.pageIndex + 1}
      </div>

      <img
        src={page.imgDataUrl}
        alt={`Page ${page.pageIndex + 1} thumbnail`}
        style={{
          width: 150,
          height: "auto",
          maxHeight: "100%",
          objectFit: "contain",
          border: "1px solid #ddd",
        }}
      />
    </div>
  );
};

export default PageThumbnail;
