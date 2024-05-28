import { Router } from 'express';

import healthCheck from '@components/healthcheck/healthCheck.router';
import user from '@components/user/user.router';
import event from '@components/event/event.router';
import seat from '@components/seat/seat.router';

const router: Router = Router();
router.use(healthCheck);
router.use(user);
router.use(event);
router.use(seat);

export default router;
