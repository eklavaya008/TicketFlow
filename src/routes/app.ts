// entry file for express
// all express related logic

import express from 'express';
import { errorHandler } from '../middlewares/errorHandlers';


export function createAPP(){

    const app = express();

    app.use(express.json);

    app.use(errorHandler);
};

 
 