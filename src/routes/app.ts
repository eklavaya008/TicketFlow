// entry file for express
// all express related logic

import express from 'express';


export function createAPP(){

    const app = express();

    app.use(express.json);
};

 
 