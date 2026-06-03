import { Request, Response } from 'express';

export const getStats = async (req: Request, res: Response) => {
  res.status(501).json({ success: false, message: 'Not implemented' });
};
