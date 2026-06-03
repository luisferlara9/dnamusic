import { Request, Response } from 'express';

export const register = async (req: Request, res: Response) => {
  res.status(501).json({ success: false, message: 'Not implemented' });
};

export const login = async (req: Request, res: Response) => {
  res.status(501).json({ success: false, message: 'Not implemented' });
};
