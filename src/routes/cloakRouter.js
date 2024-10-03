import { Router } from 'express';
import { getCloaks, createCloak, deleteCloak } from '../controllers/cloakController.js';

const cloakRouter = Router();

cloakRouter.get('/', getCloaks);

cloakRouter.post('/', createCloak);

cloakRouter.delete('/:name', deleteCloak);


export default cloakRouter;