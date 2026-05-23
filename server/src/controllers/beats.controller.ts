import { Request, Response } from "express";
import { Beat } from "../models/beats";

export async function beatsList(req: Request, res: Response) {
  try {
    const beats = await Beat.find()
    const serializedBeats = beats.map(beat => ({
      id: beat.id.toString(),
      name: beat.name,
      fileUrl: beat.fileUrl,
      imageUrl: beat.imageUrl,
      plays: beat.plays,
      main: beat.isMain
    }));
    res.json(serializedBeats);
  } catch (error) {
    console.error("Error fetching beats:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function beatsLibrary(req: Request, res: Response) {
  
}

export async function beatPlay(req: Request, res: Response) {
    try {
        const { id } = req.params;

        const beat = await Beat.findByIdAndUpdate(
            id,
            { $inc: { plays: 1 } },
            { new: true }
        );

        if (!beat) {
            return res.status(404).json({ message: "Beat not found" });
        }

        res.status(200).json(beat);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

export async function beatCreate(req: Request, res: Response) {
  try {
    const { namePl, nameEn, main } = req.body;

    // Type assertion: we know files is a dictionary
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const file = files?.file?.[0];
    const image = files?.image?.[0];

    const beat = new Beat({
      name: { pl: namePl, en: nameEn },
      fileUrl: file ? `/uploads/${file.filename}` : null,
      imageUrl: image ? `/uploads/${image.filename}` : null,
      plays: 0,
      isMain: main,
    });

    await beat.save();
    res.status(201).json(beat);
  } catch (err) {
    console.error("Error creating beat:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function beatDelete(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const deleted = await Beat.findByIdAndDelete(id);

    if (!deleted) return res.status(404).json({ message: "Beat not found" });

    res.json({ message: "Beat deleted successfully" });
  } catch (err) {
    console.error("Error deleting beat:", err);
    res.status(500).json({ message: "Server error" });
  }
}
