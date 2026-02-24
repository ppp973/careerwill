import { Batch, Folder, Subfolder, ContentItem } from '../types';

export const batchService = {
  async getBatches(): Promise<{ id: string; title: string }[]> {
    // In a static environment, we can't easily list files in a directory.
    // However, we can expect a 'batches.json' file in the public folder 
    // or we can hardcode the list if it's small.
    // For maximum portability, let's try to fetch a manifest or use a known list.
    try {
      const res = await fetch('/batches.json');
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("Manifest not found, falling back to empty list");
    }
    return [];
  },

  async getBatchDetails(filename: string): Promise<Batch> {
    const res = await fetch(`/${filename}`);
    if (!res.ok) {
      throw new Error(`Failed to load batch: ${filename}`);
    }

    const content = await res.text();
    const lines = content.split("\n").filter(line => line.trim() !== "");
    
    let thumbnail = "";
    const folders: Record<string, { name: string; subfolders: Record<string, { name: string; items: ContentItem[] }> }> = {};

    lines.forEach(line => {
      if (line.startsWith("[Batch Thumbnail]")) {
        thumbnail = line.split(":").slice(1).join(":").trim();
        return;
      }

      // Regex to match [Folder](Subfolder)Title:URL
      const match = line.match(/^\[(.*?)\]\((.*?)\)(.*?):(.*)$/);
      if (match) {
        const folderName = match[1].trim();
        const subfolderName = match[2].trim();
        const title = match[3].trim();
        const url = match[4].trim();
        const type = url.toLowerCase().endsWith(".pdf") ? "pdf" : "video";

        if (!folders[folderName]) {
          folders[folderName] = { name: folderName, subfolders: {} };
        }

        if (!folders[folderName].subfolders[subfolderName]) {
          folders[folderName].subfolders[subfolderName] = { name: subfolderName, items: [] };
        }

        folders[folderName].subfolders[subfolderName].items.push({
          id: Math.random().toString(36).substr(2, 9),
          title,
          url,
          type
        });
      }
    });

    const folderArray: Folder[] = Object.values(folders).map(f => ({
      name: f.name,
      subfolders: Object.values(f.subfolders) as Subfolder[]
    }));

    return {
      id: filename,
      title: filename.replace(".txt", "").replace(/_/g, " "),
      thumbnail,
      folders: folderArray
    };
  }
};
