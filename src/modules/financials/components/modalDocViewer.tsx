import React, { useState, useEffect, useCallback } from "react";
import { Box, Button, Modal, TextField, Typography } from "@mui/material";

const PdfContent = ({ htmlContent }: { htmlContent: string }) => {
  return (
    <div
      className="mt-2 text-sm max-h-[80vh] overflow-y-auto"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

interface Match {
  start: number;
  length: number;
  node: HTMLElement | null;
}

const XMLRenderer = ({ showPopup, setShowPopup }: { showPopup: boolean, setShowPopup: (show: boolean) => void }) => {
  const [xmlData, setXmlData] = useState<Document | null>(null);
  const [searchText, setSearchText] = useState<string>("default"); // Default search text for testing
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [popupSearch, setPopupSearch] = useState<string>("default"); // Default search text for testing
  const [htmlContent, setHtmlContent] = useState<string>("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  const escapeRegExp = (string: string): string => {
    return string.replace(/[-/\\^$?()|[\]{}]/g, "\\$&");
  };

  const fetchAndHighlightXML = useCallback(async () => {
    console.log("fetchAndHighlightXML called");
    if (searchText.length < 3) {
      console.log("Search text is too short");
      return;
    }
    try {
      const targetUrl = "/api/fetch_doc"; // Your Next.js API route
      const response = await fetch(targetUrl);
      const text = await response.text();
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");

      if (doc.body) {
        doc.body.innerHTML = doc.body.innerHTML
          .replace(/&nbsp;/g, " ")
          .replace(/\u00A0/g, " ");
      }
      setXmlData(doc);
      setShowPopup(true);
      console.log("XML data fetched and set");
    } catch (error) {
      console.error("Error fetching XML data:", error);
    }
  }, [searchText, setShowPopup]);

  useEffect(() => {
    setPopupSearch(searchText);
    if (showPopup) {
      highlightMatches();
    }
  }, [showPopup, searchText]);

  useEffect(() => {
    if (matches.length > 0) {
      setTimeout(() => scrollToMatch(0), 100);
    }
  }, [matches]);

  const scrollToMatch = (index: number) => {
    if (matches.length === 0) return;
    const element = document.querySelector(`.highlighted-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const highlightMatches = useCallback((): void => {
    if (!searchText || searchText.length < 3) return;

    const regex = new RegExp(escapeRegExp(searchText), "gi");

    const doc: Document | null = xmlData;
    if (!doc) {
      return;
    }

    const highlightedElements = doc.body.querySelectorAll(".highlighted-text");
    highlightedElements.forEach((span) => {
      const parent = span.parentNode;
      if (parent && span.textContent) {
        const textNode = document.createTextNode(span.textContent);
        parent.replaceChild(textNode, span);
      }
    });

    const walker = document.createTreeWalker(
      doc.body,
      NodeFilter.SHOW_TEXT,
      null
    );

    let textNodes: { node: Node; start: number }[] = [];
    let fullText = "";

    while (walker.nextNode()) {
      let node = walker.currentNode as Text;
      let parent = node.parentElement;

      let isHidden = false;
      while (parent) {
        if (parent.style.display === "none") {
          isHidden = true;
          break;
        }
        parent = parent.parentElement;
      }

      if (isHidden) continue;

      textNodes.push({ node, start: fullText.length });
      fullText += node.textContent ?? "";
    }

    let matchList: Match[] = [];
    let matches = [...fullText.matchAll(regex)];

    matches.forEach((match) => {
      if (match.index !== undefined) {
        matchList.push({
          start: match.index,
          length: match[0].length,
          node: null,
        });
      }
    });

    if (matchList.length === 0) {
      setMatches([]);
      setCurrentIndex(-1);
      setHtmlContent(doc.body.innerHTML);
      return;
    }

    let newNodes: { oldNode: Node; newContent: (Node | HTMLElement)[] }[] = [];
    let matchIndex = 0;
    let currentMatch = matchList[matchIndex];

    textNodes.forEach(({ node, start }) => {
      if (!currentMatch) {
        newNodes.push({
          oldNode: node,
          newContent: [document.createTextNode(node.textContent ?? "")],
        });
        return;
      }

      let text: string = node.textContent ?? "";
      let nodeEnd = start + text.length;
      let newNodeContent: (Node | HTMLElement)[] = [];
      let localOffset = 0;

      while (currentMatch && currentMatch.start < nodeEnd) {
        let matchStart = currentMatch.start;
        let matchEnd = matchStart + currentMatch.length;

        let localStart = Math.max(0, matchStart - start);
        let localEnd = Math.min(text.length, matchEnd - start);

        if (localStart > localOffset) {
          newNodeContent.push(
            document.createTextNode(text.slice(localOffset, localStart))
          );
        }

        let matchedText = text.slice(localStart, localEnd);
        if (matchedText.length > 0) {
          let span = document.createElement("span");
          span.className = `highlighted-text highlighted-${matchIndex}`;
          span.setAttribute("data-highlight-id", `${matchIndex}`);
          span.textContent = matchedText;
          newNodeContent.push(span);

          currentMatch.node = span;
        }

        localOffset = localEnd;

        if (matchEnd >= nodeEnd) break;
        matchIndex++;
        currentMatch = matchList[matchIndex];
      }

      if (localOffset < text.length) {
        newNodeContent.push(document.createTextNode(text.slice(localOffset)));
      }

      newNodes.push({ oldNode: node, newContent: newNodeContent });
    });

    newNodes.forEach(({ oldNode, newContent }) => {
      let parent = oldNode.parentNode;
      if (!parent) return;

      newContent.forEach((newNode) => parent.insertBefore(newNode, oldNode));
      parent.removeChild(oldNode);
    });
    setMatches(matchList);
    setHtmlContent(doc.body.innerHTML);
    setCurrentIndex(0);
  }, [searchText, xmlData]);

  const nextMatch = () => {
    if (matches.length === 0) return;
    const newIndex = (currentIndex + 1) % matches.length;
    setCurrentIndex(newIndex);
    scrollToMatch(newIndex);
  };

  const goToMatch = (index: number) => {
    setCurrentIndex(index);
    scrollToMatch(index);
  };

  const prevMatch = () => {
    if (matches.length === 0) return;
    const newIndex = (currentIndex - 1 + matches.length) % matches.length;
    setCurrentIndex(newIndex);
    scrollToMatch(newIndex);
  };

  const handleSearch = () => {
    setSearchText(popupSearch);
  };

  return (
    <Modal
      open={showPopup}
      onClose={() => setShowPopup(false)}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 800, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4 }}>
        <Typography id="modal-title" variant="h6" component="h2">
          XML Renderer
        </Typography>
        <TextField
          label="Search"
          value={popupSearch}
          onChange={(e) => setPopupSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          fullWidth
          margin="normal"
        />
        <Button onClick={fetchAndHighlightXML} variant="contained" color="primary">
          Open
        </Button>
        <Box mt={2}>
          {searchText.length > 2 && (
            <>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Button onClick={prevMatch} disabled={matches.length === 0}>
                  Prev
                </Button>
                <Typography>
                  {matches.length > 0 ? `${currentIndex + 1} / ${matches.length}` : "0 / 0"}
                </Typography>
                <Button onClick={nextMatch} disabled={matches.length === 0}>
                  Next
                </Button>
              </Box>
              <Box maxHeight="60vh" overflow="auto">
                <ul>
                  {matches.map((match, index) => (
                    <li
                      key={index}
                      onClick={() => goToMatch(index)}
                      style={{
                        cursor: "pointer",
                        backgroundColor: index === currentIndex ? "lightblue" : "transparent",
                      }}
                    >
                      ...{searchText}...
                    </li>
                  ))}
                </ul>
              </Box>
            </>
          )}
        </Box>
        <Box mt={2}>
          <PdfContent htmlContent={htmlContent} />
        </Box>
      </Box>
    </Modal>
  );
};

export { PdfContent };
export default XMLRenderer;