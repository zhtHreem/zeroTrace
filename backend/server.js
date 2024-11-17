import express from 'express'
import connectDB from './src/database/connectivity.js';

import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import FormData from 'form-data';
//import ProductRoutes from './src/database/models/Product/route.js';
import FormRoute from './src/database/models/Form/route.js'
import ResponseForm from './src/database/models/ResponseForm/route.js';

const app = express();
const port = process.env.PORT || 5000;

connectDB();
console.log("OK")
app.use(express.json()); 
app.use(cors());


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);





app.use('/api', FormRoute);
app.use('/api',ResponseForm);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});


app.get('/', (req, res) => res.send('Hello World!'));


app.listen(port, () => console.log(`Server running on port ${port}`));