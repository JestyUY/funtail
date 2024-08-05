import nc from "next-connect";
import bodyParser from "body-parser";

const handler = nc()
  .use(bodyParser.json({ limit: "10mb" }))
  .use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

export default handler;
