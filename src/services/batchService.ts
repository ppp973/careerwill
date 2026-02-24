
import { Batch, Folder, Subfolder, ContentItem } from '../types';

export const batchService = {
  async getBatches(): Promise<{ id: string; title: string }[]> {
    try {
      const res = await fetch('/batches.json');
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("Manifest not found, using fallback list");
    }
    
    // Fallback list of known files (since we can't list dir at runtime)
    return [
      { id: "123456.txt", title: "COMMUNICATION CLASSES" },
      { id: "RPSC_EO_RO_Fateh_2.0.txt", title: "RPSC EO RO FATEH 2.0" }
    ];
  },

  async getBatchDetails(filename: string): Promise<Batch> {
    const res = await fetch(`/${filename}`);
    if (!res.ok) {
      throw new Error(`Failed to load batch: ${filename}`);
    }

    const content = await res.text();
    const lines = content.split("\n").map(l => l.trim()).filter(l => l !== "");
    
    let thumbnail = "";
    const folders: Record<string, { name: string; subfolders: Record<string, { name: string; items: ContentItem[] }> }> = {};
    const flatItems: ContentItem[] = [];

    lines.forEach(line => {
      // 1. Check for thumbnail
      if (line.toLowerCase().includes("[batch thumbnail]") || line.toLowerCase().includes("thumbnail:")) {
        const parts = line.split(/:(.+)/);
        if (parts.length >= 2) thumbnail = parts[1].trim();
        return;
      }

      // 2. Universal Parsing Logic
      let folderName = "General";
      let subfolderName = "Default";
      let title = "";
      let url = "";

      // Try multiple patterns
      // Pattern 1: [Folder](Subfolder)Title:URL
      const m1 = line.match(/^\[(.*?)\]\((.*?)\)(.*?):(.*)$/);
      // Pattern 2: [Folder]Title:URL
      const m2 = line.match(/^\[(.*?)\](.*?):(.*)$/);
      // Pattern 3: Title : URL (or Title:URL)
      const m3 = line.match(/^(.*?)\s*[:|]\s*(https?:\/\/.*)$/i);
      // Pattern 4: Title URL (space separated, if URL is clearly a link)
      const m4 = line.match(/^(.*?)\s+(https?:\/\/[^\s]+)$/i);

      if (m1) {
        folderName = m1[1].trim();
        subfolderName = m1[2].trim();
        title = m1[3].trim();
        url = m1[4].trim();
      } else if (m2) {
        folderName = m2[1].trim();
        title = m2[2].trim();
        url = m2[3].trim();
      } else if (m3) {
        title = m3[1].trim();
        url = m3[2].trim();
      } else if (m4) {
        title = m4[1].trim();
        url = m4[2].trim();
      }

      // Clean up title if it contains folder tags like [Folder]
      if (title.startsWith("[") && title.includes("]")) {
        const tagMatch = title.match(/^\[(.*?)\]/);
        if (tagMatch) {
          folderName = tagMatch[1].trim();
          title = title.replace(tagMatch[0], "").trim();
        }
      }

      if (url && (url.startsWith("http") || url.includes("cloudfront.net") || url.includes("youtube.com") || url.includes("vimeo.com") || url.includes(".mp4") || url.includes(".m3u8"))) {
        const type = (url.toLowerCase().endsWith(".pdf") || url.toLowerCase().includes("/pdf/") || url.toLowerCase().includes("drive.google.com")) ? "pdf" : "video";
        const item: ContentItem = {
          id: Math.random().toString(36).substr(2, 9),
          title: title.replace(/^[:\s-]+/, "").trim() || "Untitled Item",
          url: url.trim(),
          type
        };

        flatItems.push(item);

        if (!folders[folderName]) {
          folders[folderName] = { name: folderName, subfolders: {} };
        }
        if (!folders[folderName].subfolders[subfolderName]) {
          folders[folderName].subfolders[subfolderName] = { name: subfolderName, items: [] };
        }
        folders[folderName].subfolders[subfolderName].items.push(item);
      }
    });

    let folderArray: Folder[] = Object.values(folders).map(f => ({
      name: f.name,
      subfolders: Object.values(f.subfolders) as Subfolder[]
    }));

    // Logic: If there's only one folder called "General" and one subfolder "Default",
    // OR if the user requested "display all videos directly" when issues occur.
    // We'll provide a "Direct Access" folder if the structure is too flat.
    if (flatItems.length > 0) {
      const isTooFlat = folderArray.length <= 1 && folderArray[0]?.name === "General";
      const hasTooManyItems = flatItems.length > 20;

      if (isTooFlat || hasTooManyItems) {
        folderArray.unshift({
          name: "🚀 Direct Access (All)",
          subfolders: [{ name: "All Items", items: flatItems }]
        });
      }
    }

    return {
      id: filename,
      title: filename.replace(".txt", "").replace(/_/g, " ").replace(/-/g, " ").toUpperCase(),
      thumbnail: thumbnail || `https://picsum.photos/seed/${filename}/400/225`,
      folders: folderArray
    };
  }
};
