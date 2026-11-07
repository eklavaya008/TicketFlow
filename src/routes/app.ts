// entry file for express
// all express related logic

import express from 'express';
import { errorHandler } from '../middlewares/errorHandlers';
import { notFound } from '../middlewares/notFound';


export function createAPP(){

    const app = express();

    app.use(express.json);

    app.use(errorHandler);
    app.use(notFound);
};

 
 