import { Router } from 'express';
import ImportCtrl from '../controllers/import';

const router = Router();

router.post('/', ImportCtrl.import);

export default router;
