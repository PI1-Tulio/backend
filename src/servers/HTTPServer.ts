import express from "express";
import { ServiceFactory } from "../services/ServiceFatory";
import z, { ZodError } from "zod";
import { HttpError } from "../errors/interface/HttpError";
import cors from "cors";
import { createServer } from "http";

const app: express.Express = express();
app.use(cors());
app.use(express.json());

app.post("/delivery", async (req, res) => {
  const deliverySession = await ServiceFactory.getCreateDeliverySession().execute(req.body);
  res.status(201).json(deliverySession);
});

app.get("/deliveries", async (req, res, next) => {
  try {
    const deliveries = await ServiceFactory.getListDeliveriesService().execute({
      page: req.query.page ? Number(req.query.page) : undefined,
      pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined
    });
    res.status(200).json(deliveries);
  } catch (err) {
    next(err);
  }
});

app.get("/delivery/:id", async (req, res, next) => {
  try {
    const delivery = await ServiceFactory.getFindDeliveryService().execute({
      deliveryId: Number(req.params.id)
    });
    res.status(200).json(delivery);
  } catch (err) {
    next(err);
  }
});

app.post("/delivery/resend/:id", async (req, res, next) => {
  try {
    await ServiceFactory.getResendDelivery().execute({
      id: Number(req.params.id)
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation error",
      issues: z.treeifyError(err)
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      message: err.message
    });
  }


  console.error(err);
  res.status(500).json({
    message: "Internal server error"
  });
});

export const httpServer = createServer(app);

// export { app };
