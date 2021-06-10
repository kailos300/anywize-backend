import { Router } from 'express';
import DriversCtrl from '../controllers/drivers';
import isDriverAuthenticated from '../middlewares/isDriverAuthenticated';

const router = Router();

router.post('/login', DriversCtrl.authenticate);
router.get('/route', isDriverAuthenticated, DriversCtrl.route);
router.put('/route/start', isDriverAuthenticated, DriversCtrl.startRoute);
router.put('/route/end', isDriverAuthenticated, DriversCtrl.endRoute);
router.post('/route/stop', isDriverAuthenticated, DriversCtrl.createStop);
router.post('/route/location', isDriverAuthenticated, DriversCtrl.location);

export default router;
