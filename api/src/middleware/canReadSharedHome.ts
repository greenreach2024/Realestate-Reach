import { NextFunction, Request, Response } from 'express';
import { AppDataSource } from '../dataSource.js';
import HomeShare from '../entity/HomeShare.js';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: 'buyer' | 'seller' | 'agent';
  };
  shareScope?: Record<string, unknown> | null;
}

export async function canReadSharedHome(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { user } = req;
  const { homeId } = req.params;

  if (!user) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }

  if (!homeId) {
    return res.status(400).json({ error: 'Missing homeId' });
  }

  if (user.role === 'seller' || user.role === 'agent') {
    req.shareScope = null;
    return next();
  }

  if (user.role !== 'buyer') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const repo = AppDataSource.getRepository(HomeShare);
  const share = await repo.findOne({
    where: { homeId, buyerId: user.id },
    withDeleted: false
  });

  if (!share) {
    return res.status(403).json({ error: 'No share found' });
  }

  if (share.expiresAt && share.expiresAt.getTime() < Date.now()) {
    return res.status(403).json({ error: 'Share expired' });
  }

  req.shareScope = share.scope as Record<string, unknown>;
  return next();
}

export default canReadSharedHome;
