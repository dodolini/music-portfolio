import { Router } from "express";
import { beatsList, beatCreate, beatDelete, beatsLibrary, beatPlay } from "../controllers/beats.controller";
import { upload } from "../middlewares/upload";

const beatsRouter = Router();

beatsRouter.get('/list', beatsList)
beatsRouter.get('/library', beatsLibrary)
beatsRouter.post("/:id/play", beatPlay);
beatsRouter.post(
  "/create",
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  beatCreate
);
beatsRouter.delete("/delete/:id", beatDelete);

export default beatsRouter;
