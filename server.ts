import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes
  app.get("/api/batches", (req, res) => {
    const publicDir = path.join(process.cwd(), "public");
    try {
      const files = fs.readdirSync(publicDir).filter(f => f.endsWith(".txt"));
      const batches = files.map(f => ({
        id: f,
        title: f.replace(".txt", "").replace(/_/g, " "),
      }));
      res.json(batches);
    } catch (err) {
      res.status(500).json({ error: "Failed to read batches" });
    }
  });

  app.get("/api/batch/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), "public", filename);
    
    try {
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Batch not found" });
      }

      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n").filter(line => line.trim() !== "");
      
      let thumbnail = "";
      const folders: any = {};

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

      // Convert folders object to array
      const folderArray = Object.values(folders).map((f: any) => ({
        ...f,
        subfolders: Object.values(f.subfolders)
      }));

      res.json({
        title: filename.replace(".txt", "").replace(/_/g, " "),
        thumbnail,
        folders: folderArray
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to parse batch" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
