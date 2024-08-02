import express from "express"
import bodyParser from "body-parser"
import { router } from "./routes";
const app = express()

app.use(express.json())
// app.use(bodyParser())

app.use('/api/v1/wallet', router);

app.listen(3000, ()=> {
    console.log('Server started');
})

