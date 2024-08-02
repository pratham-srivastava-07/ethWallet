import express from 'express'
import { walletRouter } from './wallet';

export const router = express.Router();

router.use('/wallet', walletRouter);