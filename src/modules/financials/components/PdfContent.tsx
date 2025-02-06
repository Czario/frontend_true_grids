import React from "react";
const PdfContent = ({ htmlContent }: { htmlContent: string }) => {
  return (
    <>
      <div
        className="mt-2 text-sm max-h-[80vh] overflow-y-auto"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </>
  );
};
export default React.memo(PdfContent);
