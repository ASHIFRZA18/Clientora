import type { Request, Response } from "express";
import { reportsService } from "./reports.service.js";
import { reportTypeEnum } from "./reports.validation.js";
import { ApiError } from "../../middleware/error-handler.js";
import type { ReportQuery } from "./reports.validation.js";

export const reportsController = {
  async get(req: Request, res: Response) {
    const parsedType = reportTypeEnum.safeParse(req.params.type);
    if (!parsedType.success) {
      throw new ApiError(400, "INVALID_REPORT_TYPE", "Unknown report type");
    }
    const type = parsedType.data;
    const query = req.query as unknown as ReportQuery;
    const range = { from: query.from, to: query.to, ownerId: query.ownerId };

    const result = await reportsService.export(type, range, query.format);

    if (result.kind === "json") {
      res.status(200).json({ data: result.table });
      return;
    }

    res.setHeader("Content-Type", result.contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
    res.status(200).send(result.buffer);
  },
};
